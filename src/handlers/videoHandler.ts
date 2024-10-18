import { Env, VideoEmbedData, CacheData } from '../types/types';
import { config } from '../constants';
import he from 'he';
import {
	getDearrowBranding,
	getDearrowThumbnail,
	getDislikes,
	getVideoInfo,
	isChannelVerified,
	putCacheEntry,
	renderGenericTemplate,
	stripTracking,
} from '../utils';

export default {
	async handleVideo(request: Request, env: Env): Promise<Response> {
		const overrideShorts = new URL(request.url).searchParams.getCaseInsensitive('shorts') !== null;
		let overrideNoThumb = new URL(request.url).searchParams.getCaseInsensitive('nothumb') !== null;
		const overrideDislikes = new URL(request.url).searchParams.getCaseInsensitive('dislikes') !== null;
		let enableDeArrow = new URL(request.url).searchParams.getCaseInsensitive('dearrow') !== null;
		let overrideStockPlayer = new URL(request.url).searchParams.getCaseInsensitive('stock') !== null;

		let overrideItag = new URL(request.url).searchParams.getCaseInsensitive('itag');

		if (overrideItag) {
			if (isNaN(Number(overrideItag))) {
				overrideItag = null;
			}
			if (overrideItag !== '18' && overrideItag !== '22') {
				overrideItag = null;
			}
		}

		const originalPath = request.url.replace(new URL(request.url).origin, '');
		const isShorts = originalPath.startsWith('/shorts') || overrideShorts;
		const isWatch = originalPath.startsWith('/watch');
		const isEmbed = originalPath.startsWith('/embed');
		const isLive = originalPath.startsWith('/live');
		const isMusic = request.url.startsWith('https://music') || request.url.startsWith('https://www.music');

		function getOriginalUrl() {
			if (isShorts || isWatch || isEmbed || isLive) {
				return stripTracking(`https://www.youtube.com${originalPath}`);
			}
			if (isMusic) {
				return stripTracking(`https://music.youtube.com${originalPath}`);
			}
			return stripTracking(`https://youtu.be${originalPath}`);
		}

		const parserRe = /(.*?)(^|\/|v=)([a-z0-9_-]{11})(.*)?/gim;
		const match = parserRe.exec(getOriginalUrl());
		const videoId = match ? match[3] : null;

		if (!videoId) {
			const error = 'Invalid Video ID';
			const response = renderGenericTemplate(error, getOriginalUrl(), request, 'Parse Error');
			return new Response(response, {
				status: 200,
				headers: {
					'Content-Type': 'text/html',
					Location: getOriginalUrl(),
				},
			});
		}

		let info = await getVideoInfo(videoId);

		// TODO: voodoo with some kind of API to get info on scheduled livestreams
		if (info.error && info.error.startsWith('This live event will begin ')) {
			const date = info.error.replace('This live event will begin ', '').replace('.', '');
			const string = `Sorry, there's no info to give you other than the fact that the event will begin ${date}`;
			overrideStockPlayer = true;
			const response = renderGenericTemplate(string, getOriginalUrl(), request, 'Scheduled Event', true, videoId);
			return new Response(response, {
				status: 200,
				headers: {
					'Content-Type': 'text/html',
					Location: getOriginalUrl(),
				},
			});
		} else if (info.error && info.error.startsWith('Premieres in')) {
			const date = info.error.replace('Premieres ', '').replace('.', '');
			const string = `Sorry, there's no info to give you other than the fact that it's a premiere starting ${date}`;
			overrideStockPlayer = true;
			const response = renderGenericTemplate(string, getOriginalUrl(), request, 'Premiering Event', true, videoId);
			return new Response(response, {
				status: 200,
				headers: {
					'Content-Type': 'text/html',
					Location: getOriginalUrl(),
				},
			});
		} else if (info.error) {
			if (info.error.startsWith('Please sign in')) throw new Error('Invidious seems to have died');

			const response = renderGenericTemplate(info.error, getOriginalUrl(), request, 'Invidious Error');
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
			console.error('Failed to get format stream', e);
		}

		const videoResolution = {
			width: Number(formatStream?.size?.split('x')[0]) || 1280,
			height: Number(formatStream?.size?.split('x')[1]) || 720,
			itag: overrideItag || formatStream?.itag || 18,
		};

		// discord takes the thumbnail's aspect ratio over the video's, get rid of it for non-16:9 videos
		if (videoResolution.width / videoResolution.height !== 16 / 9) {
			overrideNoThumb = true;
		}

		let rydResponse = undefined;

		if (config.enableDislikes || overrideDislikes) {
			rydResponse = await getDislikes(videoId);
		}

		if (enableDeArrow) {
			let title = info.title;
			let thumbnail = info.videoThumbnails[0].url;

			const dearrow = await getDearrowBranding(videoId);
			let timestamp = undefined;

			if (dearrow) {
				if (dearrow.titles.length > 0) {
					if (dearrow.titles[0].votes >= 0 || dearrow.titles[0].locked) {
						title = dearrow.titles[0].title;
						title = title.replace('>', ''); // we do not have a formatter
						timestamp = dearrow.thumbnails[0].timestamp;
					}
				}
			}
			if (timestamp !== undefined) {
				const _thumbnail = await getDearrowThumbnail(timestamp, videoId);
				if (_thumbnail) thumbnail = _thumbnail;
			}
			info.title = title;
			info.videoThumbnails[0].url = thumbnail;
		}

		const embedData: VideoEmbedData = {
			appTitle: config.appName,
			type: info.type,
			error: info.error,
			title: he.encode(info.title),
			author: he.encode(info.author),
			description: he.encode(info.description.length > 140 ? info.description.substring(0, 140) + '...' : info.description),
			viewCount: info.viewCount.toLocaleString('en-US'),
			publishedAt: info.liveNow ? '' : `Uploaded ${info.publishedText}`,
			subscriberCountText: info.subCountText,
			likeCount: info.likeCount.toLocaleString('en-US'),
			isVerified: await isChannelVerified(info.authorId),
			ownerProfileUrl: 'https://youtube.com' + info.authorUrl,
			bestThumbnail: isShorts || overrideNoThumb ? '' : info.videoThumbnails[0].url,
			isLive: info.liveNow,
			directUrl: `${config.api_base}/latest_version?id=${videoId}&itag=${videoResolution.itag}`,
			formatStreams: info.formatStreams,
			resolution: videoResolution,
			youtubeUrl: getOriginalUrl(),
			videoId,
			request,
			rydResponse,
			isStock: overrideStockPlayer,
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
			await putCacheEntry(env.D1_DB, stripTracking(request.url), cacheEntry, config.videoExpireTime);
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

		let params = new URL(info.request.url).searchParams;
		let timecodeParam = params.get('t') || params.get('time_continue');

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
<meta name="theme-color" content="#ff5d5b" />
<meta name="color-scheme" content="dark" />
<meta property="og:site_name" content="${constructProviderString(info)}">
<meta name="twitter:card" content="player" />
<meta name="twitter:title" content="${info.title}" />
${
	!info.isLive && !info.isStock
		? `
<meta name="twitter:player:width" content="${info.resolution.width}" />
<meta name="twitter:player:height" content="${info.resolution.height}" />
<meta name="twitter:player:stream" content="${info.directUrl}" />
<meta name="twitter:player:stream:content_type" content="video/mp4" />
`
		: ''
}
${
	!info.isLive && !info.isStock
		? `
<meta property="og:video" content="${info.directUrl}" />
<meta property="og:video:secure_url" content="${info.directUrl}" />
<meta property="og:video:type" content="video/mp4" />
<meta property="og:video:width" content="${info.resolution.width}" />
<meta property="og:video:height" content="${info.resolution.height}" />
`
		: ''
}
${
	info.isStock || info.isLive
		? `
<meta property="twitter:player" content="https://www.youtube.com/embed/${info.videoId}" />
<meta property="twitter:player:width" content="${info.resolution.width || 1280}" />
<meta property="twitter:player:height" content="${info.resolution.height || 720}" />
`
		: ''
}
<meta name="twitter:image" content="${info.bestThumbnail}" />
<meta property="og:url" content="${info.youtubeUrl}" />
<meta property="og:image" content="${info.bestThumbnail}" />
<meta property="og:description" content="${info.description}" />
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
