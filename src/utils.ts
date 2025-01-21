import { config } from './constants';
import { RYDResponse, PlaylistInfo, Video, ChannelInfo, DeArrowResponse, CacheData, CacheDataEntry } from './types/types';

export function getURLType(url: URL): string {
	const isShorts = url.pathname.startsWith('/shorts');
	const isWatch = url.pathname.startsWith('/watch');
	const isEmbed = url.pathname.startsWith('/embed');
	const isPlaylist = url.pathname.startsWith('/playlist');
	const isMusic = url.origin.startsWith('https://music') || url.origin.startsWith('https://www.music');
	const isChannel =
		url.pathname.startsWith('/channel') ||
		url.pathname.startsWith('/c') ||
		url.pathname.startsWith('/@') ||
		url.pathname.startsWith('/user/');
	const isImage = url.pathname.startsWith('/img');

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
		case isChannel:
			return 'channel';
		case isImage:
			return 'image';
		default:
			return 'video';
	}
}

export async function isChannelVerified(channelId: string): Promise<boolean> {
	if (!config.enableTickCheck) return false;
	const page = await fetch(`${config.api_base}/api/v1/channels/${channelId}?hl=en`, {
		headers: {
			// set language to english
			'Accept-Language': 'en-US,en;q=0.9',
			'User-Agent': 'Mozilla/5.0 (compatible; Koutube/1.0; +https://github.com/igerman00/koutube)',
			Authorization: config.auth,
		},
	});
	const json = (await page.json()) as { authorVerified: boolean };
	return json.authorVerified;
}

export async function getVideoInfo(videoId: string): Promise<Video> {
	const page = await fetch(`${config.api_base}/api/v1/videos/${videoId}?hl=en`, {
		headers: {
			'Accept-Language': 'en-US,en;q=0.9',
			'User-Agent': 'Mozilla/5.0 (compatible; Koutube/1.0; +https://github.com/igerman00/koutube)',
			Authorization: config.auth,
		},
	});

	const json = (await page.json()) as Video;

	return json;
}

export async function getPlaylistInfo(playlistId: string): Promise<PlaylistInfo> {
	const page = await fetch(`${config.api_base}/api/v1/playlists/${playlistId}?hl=en`, {
		headers: {
			'Accept-Language': 'en-US,en;q=0.9',
			'User-Agent': 'Mozilla/5.0 (compatible; Koutube/1.0; +https://github.com/igerman00/koutube)',
			Authorization: config.auth,
		},
	});

	const json = (await page.json()) as PlaylistInfo;

	return json;
}

export async function getChannelInfo(channelId: string): Promise<ChannelInfo> {
	const page = await fetch(`${config.api_base}/api/v1/channels/${channelId}?hl=en`, {
		headers: {
			'Accept-Language': 'en-US,en;q=0.9',
			'User-Agent': 'Mozilla/5.0 (compatible; Koutube/1.0; +https://github.com/igerman00/koutube)',
			Authorization: config.auth,
		},
	});

	const json = (await page.json()) as ChannelInfo;

	return json;
}

export async function isMix(playlistId: string, request: Request): Promise<boolean> {
	// return true; // for testing
	const isMusic = request.url.startsWith('https://music') || request.url.startsWith('https://www.music');
	return isMusic;

	// not sure if to include the rest, for now no need

	const page = await fetch(`${config.api_base}/api/v1/playlists/${playlistId}?hl=en`, {
		headers: {
			'Accept-Language': 'en-US,en;q=0.9',
			'User-Agent': 'Mozilla/5.0 (compatible; Koutube/1.0; +https://github.com/igerman00/koutube)',
			Authorization: config.auth,
		},
	});
	const url = new URL(page.url);
	const isMix = url.pathname.startsWith('/api/v1/mixes');
	return isMix;
}

export function stripTracking(link: string) {
	const url = new URL(link);
	url.searchParams.delete('feature');
	url.searchParams.delete('pp');
	url.searchParams.delete('si');
	url.searchParams.delete('a');
	url.searchParams.delete('embeds_referring_euri');
	url.searchParams.delete('embeds_referring_origin');
	url.searchParams.delete('embeds_euri');
	url.searchParams.delete('embeds_origin');
	url.searchParams.delete('embeds_widget_referrer');
	url.searchParams.delete('source_ve_path');
	url.searchParams.delete('iv_load_policy');
	url.searchParams.delete('rel');
	url.searchParams.delete('lc');
	url.searchParams.delete('ab_channel');
	// just to be safe:
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
				'User-Agent': 'Mozilla/5.0 (compatible; Koutube/1.0; +https://github.com/igerman00/koutube)',
			},
		});
		const json: RYDResponse = (await page.json()) as RYDResponse;
		return json;
	} catch (error: any) {
		console.error(error);
		return undefined;
	}
}

export async function getDearrowBranding(videoId: string): Promise<DeArrowResponse | undefined> {
	try {
		const url = new URL(`https://sponsor.ajay.app/api/branding`);
		url.searchParams.set('videoID', videoId);
		const page = await fetch(url, {
			headers: {
				'Accept-Language': 'en-US,en;q=0.9',
				'User-Agent': 'Mozilla/5.0 (compatible; Koutube/1.0; +https://github.com/igerman00/koutube)',
			},
		});
		const json = (await page.json()) as DeArrowResponse;
		return json;
	} catch (error: any) {
		console.error(error);
		return undefined;
	}
}

export async function getDearrowThumbnail(timestamp: number, videoId: string): Promise<string | undefined> {
	try {
		let url = new URL(`https://dearrow-thumb.ajay.app/api/v1/getThumbnail`);
		url.searchParams.set('videoID', videoId);
		url.searchParams.set('time', timestamp.toString());
		const page = await fetch(url, {
			headers: {
				'Accept-Language': 'en-US,en;q=0.9',
				'User-Agent': 'Mozilla/5.0 (compatible; Koutube/1.0; +https://github.com/igerman00/koutube)',
			},
		});
		if (page.status === 204) return undefined;
		// simply return our input url
		return page.url;
	} catch (error: any) {
		console.error(error);
		return undefined;
	}
}

export function userAgentType(userAgent: string | null): string {
	if (!userAgent) return 'unknown';
	const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
	return mobileRegex.test(userAgent) ? 'mobile' : 'desktop';
}

export function scrapeChannelId(html: string): string | null {
	// <link rel="canonical" href="https://www.youtube.com/channel/UC_x5XG1OV2P6uZZ5FSM9Ttw">
	// need to get the id from the link tag
	const match = html.match(/<link rel="canonical" href="https:\/\/www.youtube.com\/channel\/(.*?)">/);
	return match ? match[1] : null;
}

export function renderGenericTemplate(
	info: string,
	redirectUrl: string,
	request: Request,
	title: string,
	showStock?: boolean,
	id?: string
) {
	return `
<!DOCTYPE html>
<html lang="en">
<head>
<title>${config.appName}</title>
<style>body{background-color:#1f1f1f;color:white;}a{color:#ff5d5b;}</style>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<meta name="theme-color" content="#ff5d5b" />
<meta name="color-scheme" content="dark" />
<meta property="og:site_name" content="">
${
	showStock && id
		? `
<meta name="twitter:card" content="player" />
<meta name="twitter:image" content="https://i.ytimg.com/vi/${id}/hqdefault.jpg">
<meta property="twitter:player" content="https://www.youtube.com/embed/${id}" />
<meta property="twitter:player:width" content="1280" />
<meta property="twitter:player:height" content="720" />
`
		: ''
}
<meta property="og:description" content="${info.substring(0, 140) + (info.length > 140 ? '...' : '')}" />
<link rel="alternate" href="${
		new URL(request.url).origin +
		'/oembed.json?' +
		new URLSearchParams({
			author_name: showStock && id ? 'No info supported' : '',
			author_url: '',
			provider_name: config.appName,
			provider_url: config.appLink,
			title: title,
			type: 'video',
			version: '1.0',
		}).toString()
	}" type="application/json+oembed" title="d"/>
<meta http-equiv="refresh" content="0;url=${redirectUrl}">
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
		'>': '&gt;',
	};

	return String(html).replace(regex_html_characters_to_escape, (match) => escaped[match]);
}

// D1 DB functions

export async function getCacheEntry(db: D1Database, key: string): Promise<CacheData | undefined> {
	if (!db) {
		console.error('No database');
		return undefined;
	}
	const row = (await db.prepare('SELECT Entry FROM CacheEntries WHERE EntryKey = ?').bind(key).first()) as CacheDataEntry;
	if (!row) return undefined;
	try {
		return JSON.parse(row.Entry);
	} catch (error: any) {
		console.error(error);
		return undefined;
	}
}

export async function listCacheEntries(db: D1Database) {
	if (!db) {
		console.error('No database');
		return [];
	}

	try {
		const query = `
		SELECT
		  EntryKey,
		  json_extract(Entry, '$.headers.Cached-On') as CachedOn,
		  json_extract(Entry, '$.headers.Content-Type') as ContentType,
		  Entry,
		  (
			strftime('%s', json_extract(Entry, '$.headers.Cached-On')) +
			CASE
			  WHEN json_extract(Entry, '$.headers.Content-Type') LIKE 'image/%' THEN 365*24*60*60
			  ELSE 7*24*60*60
			END
		  ) as Expiration,
		  (
			strftime('%s', 'now') > (
			  strftime('%s', json_extract(Entry, '$.headers.Cached-On')) +
			  CASE
				WHEN json_extract(Entry, '$.headers.Content-Type') LIKE 'image/%' THEN 365*24*60*60
				ELSE 7*24*60*60
			  END
			)
		  ) as Expired
		FROM CacheEntries
	  `;

		const rows = await db.prepare(query).all();

		return rows.results.map((row) => {
			const entryKey = row.EntryKey as string;
			const entry = JSON.parse(row.Entry as string);
			return {
				name: entryKey,
				value: entry,
				expiration: Number(row.Expiration),
				expired: Boolean(row.Expired),
			};
		});
	} catch (error: any) {
		console.error(error);
		return [];
	}
}

export async function deleteExpiredCacheEntries(db: D1Database) {
	if (!db) {
		console.error('No database');
		return 0;
	}
	try {
		const result = await db.prepare("DELETE FROM CacheEntries WHERE Expiration < strftime('%s', 'now')").run();
		return result.meta.changes;
	} catch (error: any) {
		console.error(error);
		return 0;
	}
}

export async function listCacheEntriesPaginated(db: D1Database, page: number = 1, limit: number = 10) {
	if (!db) {
		console.error('No database');
		return { entries: [], total: 0 };
	}
	const offset = (page - 1) * limit;

	try {
		const query = `
		SELECT
		  EntryKey,
		  json_extract(Entry, '$.headers.Cached-On') as CachedOn,
		  json_extract(Entry, '$.headers.Content-Type') as ContentType,
		  (
			strftime('%s', json_extract(Entry, '$.headers.Cached-On')) +
			CASE
			  WHEN json_extract(Entry, '$.headers.Content-Type') LIKE 'image/%' THEN 365*24*60*60
			  ELSE 7*24*60*60
			END
		  ) as Expiration,
		  (
			strftime('%s', 'now') > (
			  strftime('%s', json_extract(Entry, '$.headers.Cached-On')) +
			  CASE
				WHEN json_extract(Entry, '$.headers.Content-Type') LIKE 'image/%' THEN 365*24*60*60
				ELSE 7*24*60*60
			  END
			)
		  ) as Expired
		FROM CacheEntries
		ORDER BY EntryKey
		LIMIT ? OFFSET ?
	  `;

		const countQuery = 'SELECT COUNT(*) as total FROM CacheEntries';

		const [rows, countResult] = await Promise.all([db.prepare(query).bind(limit, offset).all(), db.prepare(countQuery).first()]);

		const entries = rows.results.map((row) => {
			return {
				name: row.EntryKey as string,
				cachedOn: row.CachedOn as string,
				contentType: row.ContentType as string,
				expiration: Number(row.Expiration),
				expired: Boolean(row.Expired),
			};
		});

		return {
			entries,
			total: countResult ? (countResult.total as number) : 0,
		};
	} catch (error: any) {
		console.error(error);
		return { entries: [], total: 0 };
	}
}

export async function getCountCacheEntries(db: D1Database) {
	if (!db) {
		console.error('No database');
		return 0;
	}
	try {
		const row = await db.prepare('SELECT COUNT(*) AS total FROM CacheEntries').first();
		return row ? row.total : 0;
	} catch (error: any) {
		console.error(error);
		return 0;
	}
}

export async function putCacheEntry(db: D1Database, key: string, value: CacheData, expiration: number) {
	if (!db) {
		console.error('No database');
		return;
	}
	expiration = Math.floor(Date.now() / 1000) + expiration; // expiration is relative in seconds
	await db
		.prepare('INSERT INTO CacheEntries (EntryKey, Entry, Expiration) VALUES (?, ?, ?)')
		.bind(key, JSON.stringify(value), expiration)
		.run();
}

export async function deleteCacheEntry(db: D1Database, key: string) {
	if (!db) {
		console.error('No database');
		return;
	}
	await db.prepare('DELETE FROM CacheEntries WHERE EntryKey = ?').bind(key).run();
}
