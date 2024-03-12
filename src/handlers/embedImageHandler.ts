import { Env } from '../types';
import { stripTracking } from '../utils';
import puppeteer from '@cloudflare/puppeteer';

export default {
	async handleEmbedImage(request: Request, env: Env): Promise<Response> {
		console.log('Handling embed image request');
		const overrideShorts = new URL(request.url).searchParams.get('shorts') !== null;
		const overrideWidth = new URL(request.url).searchParams.get('width');
		const overrideHeight = new URL(request.url).searchParams.get('height');
		const overrideSize = new URL(request.url).searchParams.get('size');

		const originalPath = request.url.replace(new URL(request.url).origin, '');
		const isShorts = originalPath.startsWith('/shorts') || overrideShorts;
		const isWatch = originalPath.startsWith('/watch');
		const isEmbed = originalPath.startsWith('/embed');
		const isMusic = request.url.startsWith('https://music') || request.url.startsWith('https://www.music');

		function getOriginalUrl() {
			if (isShorts || isWatch || isEmbed) {
				return stripTracking(`https://www.youtube.com${originalPath}`);
			}
			if (isMusic) {
				return stripTracking(`https://music.youtube.com${originalPath}`);
			}
			return stripTracking(`https://youtu.be${originalPath}`);
		}

		let [width, height] = isShorts ? [360, 640] : [640, 360];
		if (overrideWidth && overrideHeight) {
			// check if number
			if (isNaN(parseInt(overrideWidth)) || isNaN(parseInt(overrideHeight))) {
				return new Response('Width and height must be numbers', { status: 400 });
			}
			if (parseInt(overrideWidth) > 1920 || parseInt(overrideHeight) > 1080) {
				return new Response('Max width is 1920 and max height is 1080', { status: 400 });
			}
			width = parseInt(overrideWidth);
			height = parseInt(overrideHeight);
		}
		if (overrideSize) {
			switch (overrideSize) {
				case 'small':
					width = 320;
					height = 180;
					break;
				case 'medium':
					width = 640;
					height = 360;
					break;
				case 'large':
					width = 854;
					height = 480;
					break;
				case 'hd720':
					width = 1280;
					height = 720;
					break;
				case 'hd1080':
					width = 1920;
					height = 1080;
					break;
				default:
					break;
			}
		}

		const parserRe = /(.*?)(^|\/|v=)([a-z0-9_-]{11})(.*)?/gim;
		const match = parserRe.exec(getOriginalUrl());
		const videoId = match ? match[3] : null;

		if (!videoId) {
			return new Response('Video ID not found!', { status: 400 });
		}
		try {
			const url = `https://youtube.com/embed/${videoId}`;

			const browser = await puppeteer.launch(env.BROWSER);
			const page = await browser.newPage();
			await page.setViewport({ width, height }); // set viewport size
			await page.goto(url);
			await page.evaluate(() => {
				//@ts-ignore
				const toast = document.createElement('div');
				toast.style.position = 'fixed';
				toast.style.bottom = '10px';
				toast.style.right = '10px';
				toast.style.padding = '10px';
				toast.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
				toast.style.color = 'white';
				toast.style.fontFamily = 'Arial, sans-serif';
				toast.style.fontSize = '14px';
				toast.innerText = 'Powered by Koutube';
				//@ts-ignore
				document.body.appendChild(toast);
			});
			const screenshot = await page.screenshot();
			await browser.close();

			return new Response(screenshot, {
				status: 200,
				headers: {
					'Content-Type': 'image/png',
					'Cache-Control': `public, max-age=31536000`, // 1 year, screw it
				},
			});
		} catch (e) {
			console.error(e);
			return new Response('Failed to render embed', { status: 500 });
		}
	},
};
