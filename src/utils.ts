import { config } from "./constants";
import { RYDResponse, PlaylistInfo, VideoInfo } from "./types";

export function getURLType(url: URL): string {
	const isShorts = url.pathname.startsWith('/shorts');
	const isWatch = url.pathname.startsWith('/watch');
	const isEmbed = url.pathname.startsWith('/embed');
	const isPlaylist = url.pathname.startsWith('/playlist');
	const isMusic = url.origin.startsWith('https://music') || url.origin.startsWith('https://www.music');
	
	switch (true) {
		case isShorts:
			return 'shorts';
		case isWatch:
			return 'video';
		case isEmbed:
			return 'embed';
		case isPlaylist:
			return 'playlist';
		case isMusic:
			return 'music';
		default:
			return 'video';
	}
}

export async function isChannelVerified(channelId: string): Promise<boolean> {
	const page = await fetch(`${config.api_base}/api/v1/channels/${channelId}?hl=en&fields=authorVerified`, {
		headers: {
			// set language to english
			'Accept-Language': 'en-US,en;q=0.9',
			'User-Agent': 'Mozilla/5.0 (compatible; Koutube/1.0; +https://github.com/igerman00/koutube)',
		},
	});
	const json: { authorVerified: boolean; } = await page.json();
	return json.authorVerified;
}

export async function getVideoInfo(videoId: string): Promise<VideoInfo> {
	const page = await fetch(`${config.api_base}/api/v1/videos/${videoId}?hl=en&fields=title,videoThumbnails,description,publishedText,viewCount,likeCount,dislikeCount,author,authorUrl,authorId,subCountText,isListed,liveNow,formatStreams,type,error`, {
		headers: {
			'Accept-Language': 'en-US,en;q=0.9',
			'User-Agent': 'Mozilla/5.0 (compatible; Koutube/1.0; +https://github.com/igerman00/koutube)',
		},
	});

	const json: VideoInfo = await page.json();

	return json;
}

export async function getPlaylistInfo(playlistId: string): Promise<PlaylistInfo> {
	const page = await fetch(`${config.api_base}/api/v1/playlists/${playlistId}?hl=en`, {
		headers: {
			'Accept-Language': 'en-US,en;q=0.9',
			'User-Agent': 'Mozilla/5.0 (compatible; Koutube/1.0; +https://github.com/igerman00/koutube)',
		},
	});

	const json: PlaylistInfo = await page.json();

	return json;
}

export async function isMix(playlistId: string, request: Request): Promise<boolean> {
	// return true; // for testing
	const isMusic = request.url.startsWith('https://music') || request.url.startsWith('https://www.music');
	return isMusic;

	// not sure if to include the rest, for now no need

	const page = await fetch(`${config.api_base}/api/v1/playlists/${playlistId}?hl=en&fields=mixId,playlistId`, {
		headers: {
			'Accept-Language': 'en-US,en;q=0.9',
			'User-Agent': 'Mozilla/5.0 (compatible; Koutube/1.0; +https://github.com/igerman00/koutube)',
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
				'User-Agent': 'Mozilla/5.0 (compatible; Koutube/1.0',
			},
		});
		const json: RYDResponse = await page.json();
		return json;
	} catch (error: any) {
		console.error(error)
		return undefined;
	}
}

export function userAgentType(userAgent: string | null): string {
	if (!userAgent) return 'unknown';
	const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
	return mobileRegex.test(userAgent) ? 'mobile' : 'desktop';
}

export function renderGenericTemplate(info: string, redirectUrl: string, request: Request, title = 'Scheduled event') {
	return `
<!DOCTYPE html>
<html lang="en">
<head>
<title>${config.appName}</title>
<style>body{background-color:#1f1f1f;color:white;}a{color:#ff5d5b;}</style>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<meta name="theme-color" content="#FF0000" />
<meta property="og:site_name" content="">
<meta property="og:description" content="${info.substring(0, 160) + '...'}" />
<link rel="alternate" href="${
		new URL(request.url).origin +
		'/oembed.json?' +
		new URLSearchParams({
			author_name: '',
			author_url: '',
			provider_name: config.appName,
			provider_url: config.appLink,
			title: title,
			type: 'video',
			version: '1.0',
		}).toString()
	}" type="application/json+oembed" title="d"/>
</head>
<body>
Please wait...
<a href="${redirectUrl}">Or click here.</a>
</body>
</html>
`;
}

export function escapeHtml(html: any) {
	const regex_html_characters_to_escape = /["'&<>]/g;
	const escaped: { [key: string]: string } = {
		'"': '&quot;',
		"'": '&#39;',
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;'
	};

	return String(html).replace(
		regex_html_characters_to_escape,
		match => escaped[match]
	);
}
  