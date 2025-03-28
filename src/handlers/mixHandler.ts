import { Env, CacheData, MixEmbedData } from '../types/types';
import { config } from '../constants';
import he from 'he';
import { getPlaylistInfo as getMixInfo, putCacheEntry, renderGenericTemplate, stripTracking } from '../utils';

export default {
	async handleMix(request: Request, env: Env): Promise<Response> {
		const originalPath = request.url.replace(new URL(request.url).origin, '');

		function getOriginalUrl() {
			return stripTracking(`https://music.youtube.com${originalPath}`);
		}

		const parserRe = /(.*?)(^|\/|list=)([a-zA-Z0-9_-]{18,})(.*)?/gim;
		const match = parserRe.exec(getOriginalUrl());
		const mixId = match ? match[3] : null;

		if (!mixId) {
			const error = 'Invalid Mix ID';
			const response = renderGenericTemplate(error, getOriginalUrl(), request, 'Parse Error');
			return new Response(response, {
				status: 200,
				headers: {
					'Content-Type': 'text/html',
					Location: getOriginalUrl(),
				},
			});
		}

		const info = await getMixInfo(mixId);

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

		const embedData: MixEmbedData = {
			appTitle: config.appName,
			// url escape emojis and such
			title: he.encode(info.title),
			videos: info.videos,
			youtubeUrl: getOriginalUrl(),
			mixId: mixId,
			request: request,
			songCount: info.videos.length.toLocaleString('en-US'),
		};

		const html = renderTemplate(embedData);

		const cacheEntry: CacheData = {
			response: html,
			headers: {
				'Content-Type': 'text/html',
				'Cached-On': new Date().toISOString(),
			},
		};
		try {
			await putCacheEntry(env.D1_DB, stripTracking(request.url), cacheEntry, config.mixExpireTime);
		} catch (e) {
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

function renderTemplate(info: MixEmbedData) {
	function constructProviderString() {
		let string = `${config.appName} - Mix\n`;
		string += `${config.songEmoji} ${info.songCount}`;
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
<style>body{background-color:#1f1f1f;color:white;}a{color:#ff5d5b;}</style>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<meta name="theme-color" content="#ff5d5b" />
<meta name="color-scheme" content="dark" />
<meta property="og:site_name" content="${constructProviderString()}">
<meta name="twitter:card" content="card" />
<meta name="twitter:title" content="${info.title}" />
<meta name="twitter:image" content="" />
<meta property="og:url" content="${info.youtubeUrl}" />
<meta property="og:image" content="" />
<meta property="og:description" content="${constructDescription()}" />
<script>
let url=new URL("${info.youtubeUrl}"),id="${
		info.mixId
	}",ws="playlist?list="+id;window.location="youtube:"+ws,setTimeout(function(){window.location="vnd.youtube:"+ws},25),setTimeout(function(){window.location=url.href},50);
</script>
<link rel="alternate" href="${
		new URL(info.request.url).origin +
		'/oembed.json?' +
		new URLSearchParams({
			author_name: '',
			author_url: '',
			provider_name: constructProviderString(),
			provider_url: config.appLink,
			title: info.appTitle,
			type: 'video',
			version: '1.0',
		}).toString()
	}" type="application/json+oembed" title="${info.appTitle}"/>
</head>
<body>
Please wait...
<a href="${info.youtubeUrl}">Or click here.</a>
</body>
</html>
`;
}
