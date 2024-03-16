import playlistHandler from './handlers/playlistHandler';
import videoHandler from './handlers/videoHandler';
import { Env, CacheData, PublicCacheEntry } from './types';
import { getURLType, renderGenericTemplate, stripTracking } from './utils';
import template from './templates/db_listing.html';
import { config } from './constants';
import embedImageHandler from './handlers/embedImageHandler';
import channelHandler from './handlers/channelHandler';

//@ts-ignore // installing node types messes with cloudflare env type
import { Buffer } from 'node:buffer';

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		try {
			const url = stripTracking(request.url);
			const cache = await env.YT_CACHE_DB.get(url);
			const shouldCache = new URL(request.url).searchParams.get('noCache') === null;
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
			originalPath.startsWith('/c') ||
			originalPath.startsWith('/@') ||
			originalPath.startsWith('/user/');

		if (new URL(request.url).pathname === '/') {
			const listCache = () => env.YT_CACHE_DB.list();
			async function getListing(_request: Request) {
				const list = await listCache();
				let obj = list.keys.map((key) => {
					if (key.name.startsWith('rateLimit:')) return;

					const url = new URL(key.name);
					const timecode = url.searchParams.get('t') || url.searchParams.get('time_continue')

					const obj: PublicCacheEntry = {
						url: url.href.replace(url.origin, '').replace('/', ''),
						type: getURLType(url),
						timecode: timecode || 'N/A',
						expiration: key.expiration,
						size: url.searchParams.get('size') || 'N/A',
					};

					return obj;
				});

				obj = obj.filter(Boolean);

				const body = template.replace('$CACHE_ENTRIES', JSON.stringify(obj));

				return new Response(body, {
					headers: { 'Content-Type': 'text/html' },
				});
			}

			// return Response.redirect('https://github.com/iGerman00/koutube', 302);
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
			console.error('Error', e);
			const template = renderGenericTemplate('Could not fetch. This response was not cached', config.appLink, request);
			return new Response(template, {
				status: 200,
			});
		}
	},
};
