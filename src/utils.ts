import { config } from "./constants";
import { RYDResponse, PlaylistInfo, VideoInfo } from "./types";

export async function isChannelVerified(channelId: string): Promise<boolean> {
	const page = await fetch(`https://iteroni.com/api/v1/channels/${channelId}?hl=en&fields=authorVerified`, {
		headers: {
			// set language to english
			'Accept-Language': 'en-US,en;q=0.9',
			'User-Agent': 'Mozilla/5.0 (compatible; Yockstube/1.0; +https://github.com/igerman00/yockstube)',
		},
	});
	const json: { authorVerified: boolean; } = await page.json();
	return json.authorVerified;
}

export async function getVideoInfo(videoId: string): Promise<VideoInfo> {
	const page = await fetch(`https://iteroni.com/api/v1/videos/${videoId}?hl=en&fields=title,videoThumbnails,description,publishedText,viewCount,likeCount,dislikeCount,author,authorUrl,authorId,subCountText,isListed,liveNow,formatStreams,type,error`, {
		headers: {
			'Accept-Language': 'en-US,en;q=0.9',
			'User-Agent': 'Mozilla/5.0 (compatible; Yockstube/1.0; +https://github.com/igerman00/yockstube)',
		},
	});

	const json: VideoInfo = await page.json();

	return json;
}

export async function getPlaylistInfo(playlistId: string): Promise<PlaylistInfo> {
	const page = await fetch(`https://iteroni.com/api/v1/playlists/${playlistId}?hl=en`, {
		headers: {
			'Accept-Language': 'en-US,en;q=0.9',
			'User-Agent': 'Mozilla/5.0 (compatible; Yockstube/1.0; +https://github.com/igerman00/yockstube)',
		},
	});

	const json: PlaylistInfo = await page.json();

	return json;
}

export async function isMix(playlistId: string, request: Request): Promise<boolean> {
	const isMusic = request.url.startsWith('https://music') || request.url.startsWith('https://www.music');
	return isMusic;

	// not sure if to include the rest, for now no need

	const page = await fetch(`https://iteroni.com/api/v1/playlists/${playlistId}?hl=en&fields=mixId,playlistId`, {
		headers: {
			'Accept-Language': 'en-US,en;q=0.9',
			'User-Agent': 'Mozilla/5.0 (compatible; Yockstube/1.0; +https://github.com/igerman00/yockstube)',
		},
	});
	const url = new URL(page.url);
	const isMix = url.pathname.startsWith('/api/v1/mixes')
	return isMix;
}

export function stripTracking(link: string) {
	const url = new URL(link);
	url.searchParams.delete('feature');
	url.searchParams.delete('pp');
	url.searchParams.delete('si');
	url.searchParams.delete('a');
	url.searchParams.delete('utm_source');
	url.searchParams.delete('utm_medium');
	url.searchParams.delete('utm_campaign');
	url.searchParams.delete('gclid');
	url.searchParams.delete('fbclid');
	url.searchParams.delete('cid');
	url.searchParams.delete('mc_cid');
	url.searchParams.delete('mc_eid');
	url.searchParams.delete('yclid');
	url.searchParams.delete('cmp');
	url.searchParams.delete('context');
	url.searchParams.delete('keyword');
	url.searchParams.delete('source');
	url.searchParams.delete('medium');
	url.searchParams.delete('campaign');
	url.searchParams.delete('term');
	url.searchParams.delete('content');

	return url.toString();
}

export async function getDislikes(videoId: string): Promise<RYDResponse | undefined> {
	try {
		const page = await fetch(`https://returnyoutubedislikeapi.com/votes?videoId=${videoId}`, {
			headers: {
				'Accept-Language': 'en-US,en;q=0.9',
				'User-Agent': 'Mozilla/5.0 (compatible; Yockstube/1.0',
			},
		});
		const json: RYDResponse = await page.json();
		return json;
	} catch (error: any) {
		console.error(error)
		return undefined;
	}
}

export function renderGenericTemplate(info: string, redirectUrl: string, request: Request, title = 'Scheduled event') {
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
	<meta property="og:site_name" 					content="">
			
	<meta property="og:description" 				content="${info.substring(0, 160) + '...'}" />

	<link rel="alternate" href="${
		new URL(request.url).origin +
		'/oembed.json?' +
		new URLSearchParams({
			author_name: '',
			author_url: '',
			provider_name: config.appName,
			provider_url: 'https://github.com/iGerman00/yockstube',
			title: title,
			type: 'video',
			version: '1.0',
		}).toString()
	}" type="application/json+oembed" title="d"/>
	
	<meta http-equiv="refresh" content="0; url=${redirectUrl}" />
	</head>
	
	<body>
	Please wait...
	<a href="${redirectUrl}">Or click here.</a>
	</body>
	</html>
	`;
}