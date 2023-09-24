import playlistHandler from './playlistHandler';
import { Env, CacheData } from './types';
import videoHandler from './videoHandler';


export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		try {
			const cache = await env.YT_CACHE_DB.get(request.url);
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

		if (new URL(request.url).pathname === '/') {
			return Response.redirect('https://github.com/iGerman00/yockstube', 302);
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

		if (isPlaylist) {
			return playlistHandler.handlePlaylist(request, env);
		}

		return videoHandler.handleVideo(request, env);
	}
}