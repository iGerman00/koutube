import { Env, CacheData, PlaylistEmbedData } from "../types/types";
import { config } from "../constants";
import he from 'he';
import { getPlaylistInfo, isChannelVerified, isMix, putCacheEntry, renderGenericTemplate, stripTracking } from "../utils";
import mixHandler from "./mixHandler" 

export default {
    async handlePlaylist(request: Request, env: Env): Promise<Response> {
		const originalPath = request.url.replace(new URL(request.url).origin, '');

		function getOriginalUrl() {
			return stripTracking(`https://www.youtube.com${originalPath}`);
		}

        const parserRe = /(.*?)(^|\/|list=)([a-zA-Z0-9_-]{18,})(.*)?/gim;
		const match = parserRe.exec(getOriginalUrl());
		const playlistId = match ? match[3] : null;

		if (!playlistId) {
			const error = 'Invalid Playlist ID';
			const response = renderGenericTemplate(error, getOriginalUrl(), request, 'Parse Error');
			return new Response(response, {
				status: 200,
				headers: {
					'Content-Type': 'text/html',
					Location: getOriginalUrl(),
				},
			});
		}

		if (await isMix(playlistId, request)) {
			return mixHandler.handleMix(request, env);
		}

		const info = await getPlaylistInfo(playlistId);

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

		const embedData: PlaylistEmbedData = {
			appTitle: config.appName,
			// url escape emojis and such
			title: he.encode(info.title),
			author: he.encode(info.author),
			description: he.encode(info.description),
			viewCount: info.viewCount.toLocaleString('en-US'),
			lastUpdated: new Date(info.updated * 1000),
			videoCount: info.videoCount.toLocaleString('en-US'),
			ownerProfileUrl: 'https://youtube.com' + info.authorUrl,
			bestThumbnail: info.playlistThumbnail,
			videos: info.videos,
			isVerified: await isChannelVerified(info.authorId),
			youtubeUrl: getOriginalUrl(),
			playlistId: playlistId,
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
			await putCacheEntry(env.D1_DB, stripTracking(request.url), cacheEntry, config.playlistExpireTime);
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

function renderTemplate(info: PlaylistEmbedData) {
    function constructProviderString(info: PlaylistEmbedData) {
        let string = `${config.appName}\n`;
        string += `Updated ${info.lastUpdated.toDateString().substring(4, 99)}\n`;
        string += `${config.viewEmoji} ${info.viewCount} `;
        string += `${config.videoEmoji} ${info.videoCount} `;
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

		function constructDescription(info: PlaylistEmbedData) {
		let description = '';
		if (info.description !== '') {
			description += info.description.substring(0, 170);
			if (info.description.length > 170) description += '...\n\n';
			else description += '\n\n';
		}
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
<meta name="theme-color" content="#ff5d5b" />
<meta name="color-scheme" content="dark" />
<meta property="og:site_name" content="${constructProviderString(info)}">
<meta name="twitter:card" content="card" />
<meta name="twitter:title" content="${info.title}" />
<meta name="twitter:image" content="${info.bestThumbnail}" />
<meta property="og:url" content="${info.youtubeUrl}" />
<meta property="og:image" content="${info.bestThumbnail}" />
<meta property="og:description" content="${constructDescription(info)}" />
<script>
let url=new URL("${info.youtubeUrl}"),id="${info.playlistId}",ws="playlist?list="+id;window.location="youtube:"+ws,setTimeout(function(){window.location="vnd.youtube:"+ws},25),setTimeout(function(){window.location=url.href},50);
</script>
<link rel="alternate" href="${
		new URL(info.request.url).origin +
		'/oembed.json?' +
		new URLSearchParams({
			author_name: `${info.author} ${info.isVerified ? config.checkmarkEmoji : ''}`,
			author_url: info.ownerProfileUrl,
			provider_name: constructProviderString(info),
			provider_url: config.appLink,
			title: info.appTitle,
			type: 'video',
			version: '1.0',
		}).toString()
	}" type="application/json+oembed" title="${info.author}"/>
</head>
<body>
Please wait...
<a href="${info.youtubeUrl}">Or click here.</a>
</body>
</html>
`;
}