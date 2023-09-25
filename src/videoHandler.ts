import { Env, VideoEmbedData, CacheData } from "./types";
import { embedUserAgents, config } from "./constants";
import he from 'he';
import { getVideoInfo, isChannelVerified } from "./utils";

export default {
    async handleVideo(request: Request, env: Env): Promise<Response> {
		const originalPath = request.url.replace(new URL(request.url).origin, '');
		const isShorts = originalPath.startsWith('/shorts');
		const isWatch = originalPath.startsWith('/watch');
		const isEmbed = originalPath.startsWith('/embed');
		const isMusic = request.url.startsWith('https://music') || request.url.startsWith('https://www.music');

		function getOriginalUrl() {
			if (isShorts) return `https://www.youtube.com${originalPath}`;
			if (isWatch) return `https://www.youtube.com${originalPath}`;
			if (isEmbed) return `https://www.youtube.com${originalPath}`;
			if (isMusic) return `https://music.youtube.com${originalPath}`;
			return `https://youtu.be${originalPath}`;
		}

        const parserRe = /(.*?)(^|\/|v=)([a-z0-9_-]{11})(.*)?/gim;
		const match = parserRe.exec(getOriginalUrl());
		const videoId = match ? match[3] : null;

		if (!videoId) {
			return new Response('Video ID not found!', { status: 400 });
		}

		const userAgent = request.headers.get('User-Agent');
		const isBot = embedUserAgents.some((agent) => userAgent?.includes(agent));

		if (!isBot) return Response.redirect(getOriginalUrl(), 302);

		const info = await getVideoInfo(videoId);

		const formatStream = info.formatStreams.find((stream) => stream.itag === '22') ||
		info.formatStreams.find((stream) => stream.itag === '18')
		|| null;

		const videoResolution = {
			width: Number(formatStream?.size?.split('x')[0]) || 1280,
			height: Number(formatStream?.size?.split('x')[1]) || 720,
			itag: formatStream?.itag || 18,
		};

		const embedData: VideoEmbedData = {
			appTitle: config.appName,
			// url escape emojis and such
			title: he.encode(info.title),
			author: he.encode(info.author),
			description: he.encode(info.description),
			viewCount: info.viewCount.toLocaleString('en-US'),
			publishedAt: info.liveNow ? '' : 'Uploaded ' + info.publishedText,
			subscriberCountText: info.subCountText,
			likeCount: info.likeCount.toLocaleString('en-US'),
			isVerified: await isChannelVerified(info.authorId),
			ownerProfileUrl: 'https://youtube.com' + info.authorUrl,
			bestThumbnail: 'https://iteroni.com' + info.videoThumbnails[0].url,
			isLive: info.liveNow,
			// directUrl: formatStream?.url ?? null,
			directUrl: `https://iteroni.com/latest_version?id=${videoId}&itag=${videoResolution.itag}`,
			resolution: videoResolution,
			youtubeUrl: getOriginalUrl(),
			videoId: videoId,
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

function renderTemplate(info: VideoEmbedData) {
    function constructProviderString(info: VideoEmbedData) {
        let string = `${config.appName}\n`;
        string += `${info.publishedAt}\n`;
		if (info.isLive) string += `&#x1F4FA;&#xFE0E; Live now\n`;
        string += `&#x1F441;&#xFE0E; ${info.viewCount} `;
        string += `&#x2764;&#xFE0E; ${info.likeCount} `;
        string += `&#x1F465;&#xFE0E; ${info.subscriberCountText.replace(' subscribers', '')}`;
        return string;
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
<meta property="og:site_name" 					content="${constructProviderString(info)}">

<meta name="twitter:card" 						content="${info.isLive ? 'summary_large_image' : 'player'}" />
<meta name="twitter:title" 						content="${info.title}" />
${!info.isLive ? `
<meta name="twitter:player:width" 				content="${info.resolution.width}" />
<meta name="twitter:player:height" 				content="${info.resolution.height}" />
<meta name="twitter:player:stream" 				content="${info.directUrl}" />
` : ''}
<meta name="twitter:image" 						content="${info.bestThumbnail}" />
<meta name="twitter:player:stream:content_type" content="video/mp4" />

<meta property="og:url" 						content="${info.youtubeUrl}" />
${!info.isLive ? `
<meta property="og:video" 						content="${info.directUrl}" />
<meta property="og:video:secure_url" 			content="${info.directUrl}" />
<meta property="og:video:type" 					content="video/mp4" />
<meta property="og:video:width" 				content="${info.resolution.width}" />
<meta property="og:video:height" 				content="${info.resolution.height}" />
` : ``}
<meta property="og:image" 						content="${info.bestThumbnail}" />
		
<meta property="og:description" 				content="${info.description.substring(0, 160) + '...'}" />

<link rel="alternate" href="${
		new URL(info.request.url).origin +
		'/oembed.json?' +
		new URLSearchParams({
			author_name: `${info.author}${info.isVerified ? ' &#x2713;&#xFE0E;' : ''}`,
			author_url: info.ownerProfileUrl,
			provider_name: constructProviderString(info),
			provider_url: 'https://github.com/iGerman00/yockstube',
			title: info.appTitle,
			type: 'video',
			version: '1.0',
		}).toString()
	}" type="application/json+oembed" title="${info.author}"/>


<meta http-equiv="refresh" content="0; url=${info.youtubeUrl}" />
</head>

<body>
Please wait...
<a href="${info.youtubeUrl}">Or click here.</a>
</body>
</html>
`;
}