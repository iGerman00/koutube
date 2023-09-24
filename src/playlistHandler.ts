import { Env, CacheData, PlaylistInfo, PlaylistEmbedData } from "./types";
import { embedUserAgents, config } from "./constants";
import he from 'he';
import { isChannelVerified } from "./utils";

export default {
    async handlePlaylist(request: Request, env: Env): Promise<Response> {
		const originalPath = request.url.replace(new URL(request.url).origin, '');

		function getOriginalUrl() {
			return `https://www.youtube.com${originalPath}`;
		}

        const parserRe = /(.*?)(^|\/|list=)([a-zA-Z0-9_-]{18,})(.*)?/gim;
		const match = parserRe.exec(getOriginalUrl());
		const playlistId = match ? match[3] : null;

		if (!playlistId) {
			return new Response('Playlist ID not found!', { status: 400 });
		}

		const userAgent = request.headers.get('User-Agent');
		const isBot = embedUserAgents.some((agent) => userAgent?.includes(agent));

		if (!isBot) return Response.redirect(getOriginalUrl(), 302);

		const info = await getPlaylistInfo(playlistId);

		const embedData: PlaylistEmbedData = {
			appTitle: config.appName,
			// url escape emojis and such
			title: he.encode(info.title),
			author: he.encode(info.author),
			description: he.encode(info.description),
			viewCount: info.viewCount,
			lastUpdated: new Date(info.updated * 1000),
			videoCount: info.videoCount,
			ownerProfileUrl: 'https://youtube.com' + info.authorUrl,
			bestThumbnail: info.playlistThumbnail,
			videos: info.videos,
			isVerified: await isChannelVerified(info.authorId),
			youtubeUrl: getOriginalUrl(),
			videoId: playlistId,
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

function renderTemplate(info: PlaylistEmbedData) {
    function constructProviderString(info: PlaylistEmbedData) {
        let string = `${config.appName}\n`;
        string += `Updated ${info.lastUpdated.toDateString().substring(4, 99)}\n`;
        string += `&#x1F441;&#xFE0E; ${info.viewCount} `;
        string += `&#x1F3AC;&#xFE0E; ${info.videoCount} `;
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
			description += info.description.substring(0, 170) + '...\n\n';
		}
		description += constructVideoList(5);
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
<meta property="og:site_name" 					content="${constructProviderString(info)}">

<meta name="twitter:card" 						content="card" />
<meta name="twitter:title" 						content="${info.title}" />
<meta name="twitter:image" 						content="${info.bestThumbnail}" />

<meta property="og:url" 						content="${info.youtubeUrl}" />
<meta property="og:image" 						content="${info.bestThumbnail}" />

<meta property="og:description" content="${constructDescription(info)}" />

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

async function getPlaylistInfo(playlistId: string): Promise<PlaylistInfo> {
	const page = await fetch(`https://iteroni.com/api/v1/playlists/${playlistId}?hl=en`, {
		headers: {
			// set language to english
			'Accept-Language': 'en-US,en;q=0.9',
			'User-Agent': 'Mozilla/5.0 (compatible; Yockstube/1.0; +https://github.com/igerman00/yockstube)',
		},
	});

	const json: PlaylistInfo = await page.json();

	return json;
}