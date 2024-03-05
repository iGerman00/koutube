import playlistHandler from './playlistHandler';
import videoHandler from './videoHandler';
import { Env, CacheData, PublicCacheEntry } from './types';
import { getURLType, renderGenericTemplate, stripTracking } from './utils';
import template from './templates/db_listing.html';
import { config } from './constants';

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		try {
			const url = stripTracking(request.url);
			const cache = await env.YT_CACHE_DB.get(url);
			const shouldCache = new URL(request.url).searchParams.get('noCache') === null;
			if (cache && shouldCache) {
				console.info('Cache hit');
				const cacheData: CacheData = JSON.parse(cache);
				return new Response(cacheData.response, {
					headers: cacheData.headers,
				});
			}
		} catch (e) {
			console.error("Cache error", e);
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

		if (new URL(request.url).pathname === '/') {
			const listCache = () => env.YT_CACHE_DB.list();
			async function getListing(_request: Request) {
				const list = await listCache();
				let obj = list.keys.map(key => {
					if (key.name.startsWith('rateLimit:')) return;

					const url = new URL(key.name);
					// url.searchParams.delete('t');

					const obj: PublicCacheEntry = {
						url: url.href.replace(url.origin, '').replace('/', ''),
						type: getURLType(url),
						timecode: url.searchParams.get('t') || 'N/A',
						expiration: key.expiration,
					};

					return obj;
				});

				obj = obj.filter(Boolean);

				const body = template.replace('$CACHE_ENTRIES', JSON.stringify(obj));

				return new Response(body, {
					headers: { 'Content-Type': 'text/html' }
				});
			}

			// return Response.redirect('https://github.com/iGerman00/koutube', 302);
			return getListing(request)
		}
		
		try {
			let result;
			if (isPlaylist) {
				result = await playlistHandler.handlePlaylist(request, env);
			} else {
				result = await videoHandler.handleVideo(request, env);
			}
			return result;
		} catch (e) {
			console.error('Error', e);
			const template = renderGenericTemplate('Could not fetch the video. This response was not cached', config.appLink, request);
			return new Response(template, {
				status: 200,
			});
		}
	}
}