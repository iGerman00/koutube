import { Env, VideoEmbedData, CacheData } from '../types';
import { embedUserAgents, config } from '../constants';
import he from 'he';
import { getDislikes, getVideoInfo, isChannelVerified, renderGenericTemplate, stripTracking } from '../utils';

export default {
	async handleVideo(request: Request, env: Env): Promise<Response> {
		const overrideShorts = new URL(request.url).searchParams.get('shorts') !== null;
		const overrideNoThumb = new URL(request.url).searchParams.get('nothumb') !== null;
		const overrideDislikes = new URL(request.url).searchParams.get('dislikes') !== null;

		const originalPath = request.url.replace(new URL(request.url).origin, '');
		const isShorts = originalPath.startsWith('/shorts') || overrideShorts;
		const isWatch = originalPath.startsWith('/watch');
		const isEmbed = originalPath.startsWith('/embed');
		const isMusic = request.url.startsWith('https://music') || request.url.startsWith('https://www.music');

		function getOriginalUrl() {
			if (isShorts || isWatch || isEmbed) {
				return stripTracking(`https://www.youtube.com${originalPath}`);
			}
			if (isMusic) {
				return stripTracking(`https://music.youtube.com${originalPath}`);
			}
			return stripTracking(`https://youtu.be${originalPath}`);
		}

		const [width, height] = isShorts ? [720, 1280] : [1280, 720];

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

		// TODO: voodoo with some kind of API to get info on scheduled livestreams
		if (info.error && info.error.startsWith('This live event will begin ')) {
			const date = info.error.replace('This live event will begin ', '').replace('.', '');
			const string = `Sorry, there's no info to give you other than the fact that the event will begin ${date}`;
			const response = renderGenericTemplate(string, getOriginalUrl(), request);
			return new Response(response, {
				status: 200,
				headers: {
					'Content-Type': 'text/html',
					Location: getOriginalUrl(),
				},
			});
		}

		let formatStream = null;
		try {
			formatStream =
				info.formatStreams.find((stream) => stream.itag === '22') || info.formatStreams.find((stream) => stream.itag === '18') || null;
		} catch (e) {
			// console.error('Failed to get format stream', e);
		}

		const videoResolution = {
			width: isShorts ? width : Number(formatStream?.size?.split('x')[0]),
			height: isShorts ? height : Number(formatStream?.size?.split('x')[1]),
			itag: formatStream?.itag || 18,
		};

		let rydResponse = undefined;

		if (config.enableDislikes || overrideDislikes) {
			rydResponse = await getDislikes(videoId);
		}

		const embedData: VideoEmbedData = {
			appTitle: config.appName,
			type: info.type,
			error: info.error,
			title: he.encode(info.title),
			author: he.encode(info.author),
			description: he.encode(info.description),
			viewCount: info.viewCount.toLocaleString('en-US'),
			publishedAt: info.liveNow ? '' : `Uploaded ${info.publishedText}`,
			subscriberCountText: info.subCountText,
			likeCount: info.likeCount.toLocaleString('en-US'),
			isVerified: await isChannelVerified(info.authorId),
			ownerProfileUrl: 'https://youtube.com' + info.authorUrl,
			bestThumbnail: isShorts || overrideNoThumb ? '' : config.api_base + info.videoThumbnails[0].url,
			isLive: info.liveNow,
			directUrl: `${config.api_base}/latest_version?id=${videoId}&itag=${videoResolution.itag}`,
			formatStreams: info.formatStreams,
			resolution: videoResolution,
			youtubeUrl: getOriginalUrl(),
			videoId,
			request,
			rydResponse,
		};

		const html = renderTemplate(embedData);

		const cacheEntry: CacheData = {
			response: html,
			headers: {
				'Content-Type': 'text/html',
				'Cached-On': new Date().toUTCString(),
			},
		};
		try {
			await env.YT_CACHE_DB.put(stripTracking(request.url), JSON.stringify(cacheEntry), { expirationTtl: 60 * 60 * 24 * 7 });
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

function renderTemplate(info: VideoEmbedData) {
	function constructProviderString(info: VideoEmbedData) {
		let string = `${config.appName}`;

		let timecodeParam = new URL(info.request.url).searchParams.get('t');

		if (timecodeParam !== null && timecodeParam !== '') {
			try {
				let timeInSeconds = 0;
				if (timecodeParam.includes('h')) {
					const hours = Number(timecodeParam.split('h')[0]);
					timeInSeconds += hours * 3600;
					timecodeParam = timecodeParam.split('h')[1];
				}
				if (timecodeParam.includes('m')) {
					const minutes = Number(timecodeParam.split('m')[0]);
					timeInSeconds += minutes * 60;
					timecodeParam = timecodeParam.split('m')[1];
				}
				if (timecodeParam.includes('s')) {
					const seconds = Number(timecodeParam.split('s')[0]);
					timeInSeconds += seconds;
				}

				const date = new Date(0);
				date.setSeconds(timeInSeconds == 0 ? Number(timecodeParam) : timeInSeconds);
				let timeString = date.toISOString().substring(11, 19).replace('00:', '');
				console.log('Timecode', timeString);
				string += ` - ${config.timecodeEmoji} ${timeString}\n`;
			} catch (e) {
				console.error('Failed to get timecode', e);
				string += '\n';
			}
		} else string += '\n';

		if (info.type === 'scheduled') {
			if (info.error !== undefined) {
				string += `${info.error}\n`;
			} else string += `${info.publishedAt}\n`;

			if (info.formatStreams.length === 0) info.isLive = true;
		} else string += `${info.publishedAt}\n`;

		if (info.isLive && !(info.type === 'scheduled')) string += `${config.tvEmoji} Live now\n`;

		string += `${config.viewEmoji} ${info.viewCount} `;

		if (info.rydResponse) {
			let dislikeCountRYD = info.rydResponse.dislikes.toLocaleString('en-US');
			let likeCountRYD = info.rydResponse.likes.toLocaleString('en-US');
			string += `${config.likeEmoji} ${info.likeCount === '0' ? likeCountRYD : info.likeCount} `;
			string += `${config.dislikeEmoji} ${dislikeCountRYD} `;
		} else {
			string += `${config.likeEmoji} ${info.likeCount} `;
		}

		string += `${config.subscriberEmoji} ${info.subscriberCountText.replace(' subscribers', '')}`;

		return string;
	}

	return `
<!DOCTYPE html>
<html lang="en">
<head>
<title>${config.appName}</title>
<style>body{background-color:#1f1f1f;color:white;}a{color:#ff5d5b;}</style>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<meta name="theme-color" content="#FF0000" />
<meta property="og:site_name" content="${constructProviderString(info)}">
<meta name="twitter:card" content="${info.isLive ? 'summary_large_image' : 'player'}" />
<meta name="twitter:title" content="${info.title}" />
${
	!info.isLive
		? `
<meta name="twitter:player:width" content="${info.resolution.width}" />
<meta name="twitter:player:height" content="${info.resolution.height}" />
<meta name="twitter:player:stream" content="${info.directUrl}" />
`
		: ''
}
<meta name="twitter:image" content="${info.bestThumbnail}" />
<meta name="twitter:player:stream:content_type" content="video/mp4" />
<meta property="og:url" content="${info.youtubeUrl}" />
${
	!info.isLive
		? `
<meta property="og:video" content="${info.directUrl}" />
<meta property="og:video:secure_url" content="${info.directUrl}" />
<meta property="og:video:type" content="video/mp4" />
<meta property="og:video:width" content="${info.resolution.width}" />
<meta property="og:video:height" content="${info.resolution.height}" />
`
		: ``
}
<meta property="og:image" content="${info.bestThumbnail}" />
<meta property="og:description" content="${info.description.substring(0, 160) + '...'}" />
<script>
let url=new URL("${info.youtubeUrl}"),id="${
		info.videoId
	}",tc="&t="+url.searchParams.get("t"),ws="watch?v="+id+tc;window.location="youtube:"+ws,setTimeout(function(){window.location="vnd.youtube:"+ws},25),setTimeout(function(){window.location=url.href},50);
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
