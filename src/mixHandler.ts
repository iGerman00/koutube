import { Env, CacheData, MixEmbedData } from "./types";
import { embedUserAgents, config } from "./constants";
import he from 'he';
import { getPlaylistInfo as getMixInfo } from "./utils";

export default {
    async handleMix(request: Request, env: Env): Promise<Response> {
		const originalPath = request.url.replace(new URL(request.url).origin, '');

		function getOriginalUrl() {
			return `https://music.youtube.com${originalPath}`;
		}

        const parserRe = /(.*?)(^|\/|list=)([a-zA-Z0-9_-]{18,})(.*)?/gim;
		const match = parserRe.exec(getOriginalUrl());
		const mixId = match ? match[3] : null;

		if (!mixId) {
			return new Response('Mix ID not found!', { status: 400 });
		}


		const userAgent = request.headers.get('User-Agent');
		const isBot = embedUserAgents.some((agent) => userAgent?.includes(agent));

		if (!isBot) return Response.redirect(getOriginalUrl(), 302);

		const info = await getMixInfo(mixId);

		const embedData: MixEmbedData = {
			appTitle: config.appName,
			// url escape emojis and such
			title: he.encode(info.title),
			videos: info.videos,
			youtubeUrl: getOriginalUrl(),
			mixId: mixId,
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
			env.YT_CACHE_DB.put(request.url, JSON.stringify(cacheEntry), { expirationTtl: 60 * 60 * 24 * 7 });
		}
		catch (e) {
			console.error('Cache saving error, e');
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

function renderTemplate(info: MixEmbedData) {
    function constructProviderString() {
        let string = `${config.appName} - Mix`;
        return string;
    }

	function constructVideoList(max: number) {
		let string = '';
		let count = 0;
		for (let i = 0; i < info.videos.length && count < max; i++) {
			const video = info.videos[i];
			if (video && video.title !== '[Private video]') {
				count++;
				string += `${count}. ${video.title}\n`;
			}
		}
		return he.encode(string);
	}

	function constructDescription() {
		let description = '';
		description += constructVideoList(10);
		return description;
	}

	return `
<!DOCTYPE html>
<html lang="en">

<head>
<title>${config.appName}</title>
<style>
	body {
		background-color: #1f1f1f;
		color: white;
	}
	a {
		color: #ff5d5b;
	}
</style>

<meta http-equiv="Content-Type"					content="text/html; charset=UTF-8" />
<meta name="theme-color"						content="#FF0000" />
<meta property="og:site_name" 					content="${constructProviderString()}">

<meta name="twitter:card" 						content="card" />
<meta name="twitter:title" 						content="${info.title}" />
<meta name="twitter:image" 						content="" />

<meta property="og:url" 						content="${info.youtubeUrl}" />
<meta property="og:image" 						content="" />

<meta property="og:description" content="${constructDescription()}" />

<link rel="alternate" href="${
		new URL(info.request.url).origin +
		'/oembed.json?' +
		new URLSearchParams({
			author_name: '',
			author_url: '',
			provider_name: constructProviderString(),
			provider_url: 'https://github.com/iGerman00/yockstube',
			title: info.appTitle,
			type: 'video',
			version: '1.0',
		}).toString()
	}" type="application/json+oembed" title="${info.appTitle}"/>


<meta http-equiv="refresh" content="0; url=${info.youtubeUrl}" />
</head>

<body>
Please wait...
<a href="${info.youtubeUrl}">Or click here.</a>
</body>
</html>
`;
}