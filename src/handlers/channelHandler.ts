import { Env, CacheData, ChannelEmbedData } from "../types/types";
import { embedUserAgents, config } from "../constants";
import he from 'he';
import { getChannelInfo, renderGenericTemplate, scrapeChannelId, stripTracking } from "../utils";

export default {
    async handleChannel(request: Request, env: Env): Promise<Response> {
		const originalPath = request.url.replace(new URL(request.url).origin, '');
		let channel = null;

		function getOriginalUrl() {
			return stripTracking(`https://www.youtube.com${originalPath}`);
		}

		const userAgent = request.headers.get('User-Agent');
		const isBot = embedUserAgents.some((agent) => userAgent?.includes(agent));

		if (!isBot) return Response.redirect(getOriginalUrl(), 302);

		if (originalPath.startsWith('/c/') || originalPath.startsWith('/@') || originalPath.startsWith('/user/')) {
			// need to get the channel id
			const page = await fetch(getOriginalUrl(), {
				headers: {
					'User-Agent': 'Mozilla/5.0',
				},
			});
			const text = await page.text();
			channel = scrapeChannelId(text);
			
		} else if (originalPath.startsWith('/channel/')) {
			// already have the channel id
			channel = originalPath.split('/channel/')[1].split('/')[0];
		}

		if (!channel) {
			const error = 'Invalid Channel ID';
			const response = renderGenericTemplate(error, getOriginalUrl(), request, 'Parse Error');
			return new Response(response, {
				status: 200,
				headers: {
					'Content-Type': 'text/html',
					Location: getOriginalUrl(),
				},
			});
		}

		const info = await getChannelInfo(channel);

		if (info.error) {
			const response = renderGenericTemplate(info.error, getOriginalUrl(), request, 'Invidious Error');
			return new Response(response, {
				status: 200,
				headers: {
					'Content-Type': 'text/html',
					Location: getOriginalUrl(),
				},
			});
		}

		const embedData: ChannelEmbedData = {
			appTitle: config.appName,
			author: he.encode(info.author),
			description: he.encode(info.description),
			subCount: info.subCount.toLocaleString('en-US'),
			isVerified: info.authorVerified,
			latestVideos: info.latestVideos,
			youtubeUrl: info.authorUrl,
			authorId: info.authorId,
			bestThumbnail: info.authorThumbnails[info.authorThumbnails.length - 1].url,
			request: request,
		};

		const html = renderTemplate(embedData);

		const cacheEntry: CacheData = {
			response: html,
			headers: {
				'Content-Type': 'text/html',
				'Cached-On': new Date().toUTCString(),
			},
		}
		try {
			await env.YT_CACHE_DB.put(stripTracking(request.url), JSON.stringify(cacheEntry), { expirationTtl: 60 * 60 * 24 * 7 });
		}
		catch (e) {
			console.error('Cache saving error', e);
		}

		return new Response(html, {
			status: 200,
			headers: {
				'Content-Type': 'text/html',
				Location: getOriginalUrl(),
			},
		});
	},
};

function renderTemplate(info: ChannelEmbedData) {
    function constructProviderString(info: ChannelEmbedData) {
        let string = `${config.appName}\n`;
        string += `${config.subscriberEmoji} ${info.subCount}`;
        return string;
    }

	function constructVideoList(max: number) {
		let string = '';
		let count = 0;
		for (let i = 0; i < info.latestVideos.length && count < max; i++) {
			const video = info.latestVideos[i];
			if (video && video.title !== '[Private video]') {
				count++;
				string += `${count}. ${video.title}\n`;
			}
		}
		return he.encode(string);
	}

	function constructDescription(info: ChannelEmbedData) {
		let description = '';
		if (info.description !== '') {
			description += info.description.substring(0, 170);
			if (info.description.length > 170) description += '...\n\n';
			else description += '\n\n';
		}
		description += 'Latest videos:\n'
		description += constructVideoList(5);
		return description;
	}

	return `
<!DOCTYPE html>
<html lang="en">
<head>
<title>${config.appName}</title>
<style>body{background-color:#1f1f1f;color:white;}a{color:#ff5d5b;}</style>
<meta http-equiv="Content-Type"content="text/html; charset=UTF-8" />
<meta name="theme-color" content="#FF0000" />
<meta property="og:site_name" content="${constructProviderString(info)}">
<meta name="twitter:card" content="card" />
<meta name="twitter:title" content="${info.author} ${info.isVerified ? config.checkmarkEmoji : ''}" />
<meta name="twitter:image" content="${info.bestThumbnail}" />
<meta property="og:url" content="${info.youtubeUrl}" />
<meta property="og:image" content="${info.bestThumbnail}" />
<meta property="og:description" content="${constructDescription(info)}" />
<script>
let url=new URL("${info.youtubeUrl}"),id="${info.authorId}",ws="/channel/"+id;window.location="youtube:"+ws,setTimeout(function(){window.location="vnd.youtube:"+ws},25),setTimeout(function(){window.location=url.href},50);
</script>
<link rel="alternate" href="${
		new URL(info.request.url).origin +
		'/oembed.json?' +
		new URLSearchParams({
			author_name: `YouTube`,
			author_url: info.youtubeUrl,
			provider_name: constructProviderString(info),
			provider_url: config.appLink,
			title: info.appTitle,
			type: 'video',
			version: '1.0',
		}).toString()
	}" type="application/json+oembed" title=""/>
</head>
<body>
Please wait...
<a href="${info.youtubeUrl}">Or click here.</a>
</body>
</html>
`;
}