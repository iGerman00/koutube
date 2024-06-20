import playlistHandler from './handlers/playlistHandler';
import videoHandler from './handlers/videoHandler';
import { Env, CacheData, PublicCacheEntry } from './types/types';
import { getURLType, renderGenericTemplate, stripTracking } from './utils';
import template from './templates/db_listing.html';
import { config, getRandomApiInstance } from './constants';
import embedImageHandler from './handlers/embedImageHandler';
import channelHandler from './handlers/channelHandler';

import { Buffer } from 'node:buffer';

declare global {
	interface URLSearchParams {
		getCaseInsensitive(param: string): string | null;
	}
}

URLSearchParams.prototype.getCaseInsensitive = function(param) {
    const lowercasedParam = param.toLowerCase();
    for (const [key, value] of this.entries()) {
        if (key.toLowerCase() === lowercasedParam) {
            return value;
        }
    }
    return null;
};

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
		config.api_base = getRandomApiInstance();

		if (env.IV_AUTH && env.IV_DOMAIN) {
			config.api_base = 'https://' + env.IV_DOMAIN;
			config.auth = env.IV_AUTH;;
		}

        const MAX_RETRIES = 3;
        const RETRY_DELAY_MS = 1000;

        for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
			try {
				const url = stripTracking(request.url);
				const cache = await env.YT_CACHE_DB.get(url);
				const shouldCache = new URL(request.url).searchParams.getCaseInsensitive('nocache') === null;
				if (cache && shouldCache) {
					console.info('Cache hit');
					const cacheData: CacheData = JSON.parse(cache);
					if (cacheData.headers['Content-Type'] === 'image/png') {
						const binaryData = Buffer.from(cacheData.response, 'base64');
						return new Response(binaryData, {
							headers: cacheData.headers,
						});
					}
					return new Response(cacheData.response, {
						headers: cacheData.headers, 
					});
				}
			} catch (e) {
				console.error('Cache error', e);
			}

		// if subdomain is img, embedImageHandler
		if (new URL(request.url).pathname.startsWith('/img/') && config.enableImageEmbeds) {
			return embedImageHandler.handleEmbedImage(request, env);
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

		const originalPath = request.url.replace(new URL(request.url).origin, '');
		const isPlaylist = originalPath.startsWith('/playlist');
		const isChannel =
			originalPath.startsWith('/channel') ||
			originalPath.startsWith('/c/') ||
			originalPath.startsWith('/@') ||
			originalPath.startsWith('/user/');

		if (new URL(request.url).pathname === '/') {
			const listCache = () => env.YT_CACHE_DB.list();
			async function getListing(_request: Request) {
				const list = await listCache();
				let obj = list.keys.map((key) => {
					if (key.name.startsWith('rateLimit:')) return;

					const url = new URL(key.name);
					const timecode = url.searchParams.getCaseInsensitive('t') || url.searchParams.getCaseInsensitive('time_continue')

					const obj: PublicCacheEntry = {
						url: url.href.replace(url.origin, '').replace('/', ''),
						type: getURLType(url),
						timecode: timecode || '',
						expiration: key.expiration,
						size: url.searchParams.getCaseInsensitive('size') || '',
						itag: function () {
							const itag = url.searchParams.getCaseInsensitive('itag')
							// return 360p if itag is 18 or '18', 720p if itag is 22 or '22'
							if (itag === '18') return '360p'
							if (itag === '22') return '720p'
							return itag || ''
						}(),
						dearrow: url.searchParams.getCaseInsensitive('dearrow') || '',
					};

					return obj;
				});

				obj = obj.filter(Boolean);

				const body = template.replace('$CACHE_ENTRIES', JSON.stringify(obj));

				return new Response(body, {
					headers: { 'Content-Type': 'text/html' },
				});
			}

			return getListing(request);
		}

		try {
			let result;
			if (isPlaylist) {
				result = await playlistHandler.handlePlaylist(request, env);
			} else if (isChannel) {
				result = await channelHandler.handleChannel(request, env);
			} else {
				result = await videoHandler.handleVideo(request, env);
			}
			return result;
		} catch (e) {
			if ((e as Error).message === 'Invidious seems to have died' && attempt < MAX_RETRIES - 1) {
				console.log(`Retrying request, attempt ${attempt + 1}`);
				await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
				continue;
			} else {
				let errorMessage = 'Could not fetch. This response was not cached';

				if ((e as Error).message === 'Invidious seems to have died') 
					errorMessage = 'Invidious returned an error indicating that YouTube is fighting unofficial access to their API. This response was not cached.'

				const template = renderGenericTemplate(errorMessage, config.appLink, request, 'Error');
				return new Response(template, {
					status: 200,
					headers: {
						'Content-Type': 'text/html',
					},
				});
			}
		}
	}

	const errorMessage = 'Could not fetch after several retries. This response was not cached.';
	const errorTemplate = renderGenericTemplate(errorMessage, config.appLink, request, 'Error');
	return new Response(errorTemplate, {
		status: 200,
		headers: {
			'Content-Type': 'text/html',
		},
	});
},
};
