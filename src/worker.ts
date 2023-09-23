import he from 'he';

const embedUserAgents = [
	'facebookexternalhit/1.1',
	'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.57 Safari/537.36',
	'Mozilla/5.0 (Windows; U; Windows NT 10.0; en-US; Valve Steam Client/default/1596241936; ) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.117 Safari/537.36',
	'Mozilla/5.0 (Windows; U; Windows NT 10.0; en-US; Valve Steam Client/default/0; ) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.117 Safari/537.36',
	'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/601.2.4 (KHTML, like Gecko) Version/9.0.1 Safari/601.2.4 facebookexternalhit/1.1 Facebot Twitterbot/1.0',
	'facebookexternalhit/1.1',
	'Mozilla/5.0 (Windows; U; Windows NT 6.1; en-US; Valve Steam FriendsUI Tenfoot/0; ) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.105 Safari/537.36',
	'Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)',
	'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.10; rv:38.0) Gecko/20100101 Firefox/38.0',
	'Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)',
	'TelegramBot (like TwitterBot)',
	'Mozilla/5.0 (compatible; January/1.0; +https://gitlab.insrt.uk/revolt/january)',
];

type Env = {
	YT_CACHE_DB: KVNamespace;
};

type CacheData = {
	response: string;
	headers: {
		'Content-Type': string;
		'Cached-On': string;
	};
};

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		try {
			const cache = await env.YT_CACHE_DB.get(request.url);
			if (cache) {
				console.info('Cache hit');
				const cacheData: CacheData = JSON.parse(cache);
				return new Response(cacheData.response, {
					headers: cacheData.headers,
				});
			}
		} catch (e) {
			console.error("Cache error", e);
		}

		if (new URL(request.url).pathname === '/') {
			return Response.redirect('https://github.com/iGerman00/yockstube', 302);
		}

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

		// if we fetch oembed, get all params and return them as json
		if (request.url.includes('oembed.json')) {
			let params: { [key: string]: string } = {};

			// get all params
			new URL(request.url).searchParams.forEach((value, key) => {
				params[key] = value;
			});

			// return them as json
			return new Response(JSON.stringify(params), {
				headers: {
					'Content-Type': 'application/json',
				},
			});
		}

		const url = request.url;
		const youtubeUrl = url.replace(new URL(url).host.toString(), 'youtube.com');

		const parserRe = /(.*?)(^|\/|v=)([a-z0-9_-]{11})(.*)?/gim;
		const match = parserRe.exec(youtubeUrl);
		const videoId = match ? match[3] : null;

		if (!videoId) {
			return new Response('Video ID not found!', { status: 400 });
		}

		const userAgent = request.headers.get('User-Agent');
		const isBot = embedUserAgents.some((agent) => userAgent?.includes(agent));

		// If a normal user is accessing the URL, redirect them to YouTube instead of returning an HTML response with meta tags for embedding
		if (!isBot) return Response.redirect(getOriginalUrl(), 302);

		const json = await getVideoInfo(videoId);
		const directUrl =
			json.streamingData.formats?.find((format) => format.itag === 22) ||
			json.streamingData.formats?.find((format) => format.itag === 18) ||
			null;

		const vFormat = {
			width: directUrl?.width,
			height: directUrl?.height,
			itag: directUrl?.itag || 18,
		};

		const essentialData = {
			appTitle: 'YocksTube',
			// url escape emojis and such
			title: he.encode(json.videoDetails.title),
			author: he.encode(json.videoDetails.author),
			description: he.encode(json.videoDetails.shortDescription),
			viewCount: json.videoDetails.viewCount,
			publishedAt:
				json.initialData?.contents?.twoColumnWatchNextResults?.results?.results?.contents?.[0]?.videoPrimaryInfoRenderer?.dateText?.simpleText || 'Not found',
			subscriberCountText:
				json.initialData?.contents?.twoColumnWatchNextResults?.results?.results?.contents?.[1]?.videoSecondaryInfoRenderer?.owner?.videoOwnerRenderer
					?.subscriberCountText?.accessibility?.accessibilityData?.label || 'Not found',
			likeCount:
				json.initialData?.contents?.twoColumnWatchNextResults?.results?.results?.contents?.[0]?.videoPrimaryInfoRenderer?.videoActions?.menuRenderer
					?.topLevelButtons?.[0]?.segmentedLikeDislikeButtonRenderer?.likeCount || 'Not found',
			category: json.microformat?.playerMicroformatRenderer?.category || 'Not found',
			ownerProfileUrl: json.microformat?.playerMicroformatRenderer?.ownerProfileUrl || 'Not found',
			bestThumbnail: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
			directUrl: `https://iteroni.com/latest_version?id=${videoId}&itag=${vFormat.itag}`,
			vFormat,
			youtubeUrl: getOriginalUrl(),
			videoId: videoId,
			isDiscordBot: userAgent?.includes('Discord') ?? false,
			request: request,
		};

		const html = renderTemplate(essentialData);

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
			console.error("Cache saving error, e");
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

function renderTemplate(data: {
	appTitle: string;
	title: string;
	author: string;
	description: string;
	viewCount: number;
	publishedAt: string;
	category: string;
	ownerProfileUrl: string;
	bestThumbnail: string;
	directUrl: string | null;
	vFormat: { width?: number; height?: number; itag?: number };
	youtubeUrl: string;
	videoId: string;
	isDiscordBot: boolean;
	request: Request;
	likeCount: string;
	subscriberCountText: string;
}) {
	function constructProviderString(data: {
		appTitle: string;
		publishedAt: string;
		viewCount: number;
		likeCount: string;
		subscriberCountText: string;
	}): string {
		let string = `${data.appTitle}\n`;

		if (data.publishedAt && data.publishedAt !== 'Not found') {
			string += `${data.publishedAt}\n`;
		}

		if (data.viewCount) {
			string += `&#x1F441;&#xFE0E; ${data.viewCount} `;
		}

		if (data.likeCount && data.likeCount !== 'Not found') {
			string += `&#x2764;&#xFE0E; ${data.likeCount} `;
		}

		if (data.subscriberCountText && data.subscriberCountText !== 'Not found') {
			string += `&#x1F465;&#xFE0E; ${data.subscriberCountText.replace(' subscribers', '')}`;
		}

		return string;
	}
	return `
<!DOCTYPE html>
<html lang="en">

<head>
<title>${data.appTitle}</title>
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
<meta property="og:site_name" 					content="${constructProviderString(data)}">

<meta name="twitter:card" 						content="player" />
<meta name="twitter:title" 						content="${data.title}" />
<meta name="twitter:player:width" 				content="${data.vFormat.width}" />
<meta name="twitter:player:height" 				content="${data.vFormat.height}" />
<meta name="twitter:player:stream" 				content="${data.directUrl}" />
<meta name="twitter:image" 						content="${data.bestThumbnail}" />
<meta name="twitter:player:stream:content_type" content="video/mp4" />

<meta property="og:url" 						content="${data.youtubeUrl}" />
<meta property="og:video" 						content="${data.directUrl}" />
<meta property="og:video:secure_url" 			content="${data.directUrl}" />
<meta property="og:video:type" 					content="video/mp4" />
<meta property="og:video:width" 				content="${data.vFormat.width}" />
<meta property="og:video:height" 				content="${data.vFormat.height}" />
<meta property="og:image" 						content="${data.bestThumbnail}" />
		
<meta property="og:description" 				content="${data.description.substring(0, 200)}" />

<link rel="alternate" href="${
		new URL(data.request.url).origin +
		'/oembed.json?' +
		new URLSearchParams({
			author_name: data.author,
			author_url: data.ownerProfileUrl,
			provider_name: constructProviderString(data),
			provider_url: 'https://github.com/iGerman00/yockstube',
			title: data.appTitle,
			type: 'video',
			version: '1.0',
		}).toString()
	}" type="application/json+oembed" title="${data.author}"/>


<meta http-equiv="refresh" content="0; url=${data.youtubeUrl}" />
</head>

<body>
Please wait...
<a href="${data.youtubeUrl}">Or click here.</a>
</body>
</html>
`;
}

async function getVideoInfo(videoId: string): Promise<{
	videoDetails: { title: string; author: string; shortDescription: string; viewCount: number };
	streamingData: {
		expiresInSeconds: string;
		formats?: {
			itag: number;
			url: string;
			mimeType: string;
			bitrate: number;
			width: number;
			height: number;
			lastModified: string;
			contentLength?: string | null;
			quality: string;
			fps: number;
			qualityLabel: string;
			projectionType: string;
			averageBitrate?: number | null;
			audioQuality: string;
			approxDurationMs: string;
			audioSampleRate: string;
			audioChannels: number;
		}[];
	};
	// Can't be bothered to properly type these two
	initialData: { [key: string]: any };
	microformat: { [key: string]: any };
}> {
	const page = await fetch(`https://www.youtube.com/watch?v=${videoId}?hl=en&gl=US&has_verified=1&bpctr=9999999999`, {
		headers: {
			// set language to english
			'Accept-Language': 'en-US,en;q=0.9',
		},
	});

	const pageText = await page.text();
	const regex = pageText.match(`var ytInitialPlayerResponse = (.*);<\/script>`);
	const regex2 = pageText.match(`var ytInitialData = (.*);<\/script>`);
	if (!regex || !regex2) throw new Error('Unable to find video data');

	const json = JSON.parse(regex[1]);
	const json2 = JSON.parse(regex2[1]);
	// unite both jsons
	json.initialData = json2;
	return json;
}
