import he from "he";
export interface Env {
}

const embedUserAgents = [
	"facebookexternalhit/1.1",
	"Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.57 Safari/537.36",
	"Mozilla/5.0 (Windows; U; Windows NT 10.0; en-US; Valve Steam Client/default/1596241936; ) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.117 Safari/537.36",
	"Mozilla/5.0 (Windows; U; Windows NT 10.0; en-US; Valve Steam Client/default/0; ) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.117 Safari/537.36",
	"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/601.2.4 (KHTML, like Gecko) Version/9.0.1 Safari/601.2.4 facebookexternalhit/1.1 Facebot Twitterbot/1.0",
	"facebookexternalhit/1.1",
	"Mozilla/5.0 (Windows; U; Windows NT 6.1; en-US; Valve Steam FriendsUI Tenfoot/0; ) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.105 Safari/537.36",
	"Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)",
	"Mozilla/5.0 (Macintosh; Intel Mac OS X 10.10; rv:38.0) Gecko/20100101 Firefox/38.0",
	"Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)",
	"TelegramBot (like TwitterBot)",
	"Mozilla/5.0 (compatible; January/1.0; +https://gitlab.insrt.uk/revolt/january)",
	"test"
]

interface VideoInfo {
	streamingData: {
		formats: {
			itag: number;
			width: number;
			height: number;
			url: string;
		}[];
	};
	videoDetails: {
		title: string;
		author: string;
		shortDescription: string;
		viewCount: number;
	};
	microformat: {
		playerMicroformatRenderer: {
			publishDate: string;
			category: string;
			ownerProfileUrl: string;
		};
	};
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		// if we fetch oembed, get all params and return them as json
		if (request.url.includes("oembed.json")) {
			let params: { [key: string]: string } = {};
			// get all params
			new URL(request.url).searchParams.forEach((value, key) => {
				// @ts-ignore
				params[key] = value;
			}
			);
			// return them as json
			return new Response(JSON.stringify(params), {
				headers: {
					"Content-Type": "application/json",
				},
			});
		}

		const url = request.url;
		const youtubeUrl = url.replace(new URL(url).host.toString(), "youtube.com");

		const parserRe = /(.*?)(^|\/|v=)([a-z0-9_-]{11})(.*)?/gim;
		const match = parserRe.exec(youtubeUrl);
		const videoId = match ? match[3] : null;

		if (!videoId) {
			return new Response("Video ID not found!", { status: 400 });
		}

		const userAgent = request.headers.get("User-Agent");
		const isBot = embedUserAgents.some((agent) => userAgent?.includes(agent));

		if (isBot) {
			const json = await getVideoInfo(videoId);
			const directUrl = json.streamingData.formats.find((format: { itag: number; }) => format.itag === 22) ||
				json.streamingData.formats.find((format: { itag: number; }) => format.itag === 18) || null;

			const vFormat = {
				width: directUrl?.width,
				height: directUrl?.height,
				itag: directUrl?.itag
			};

			console.log(json.initialDataFromMyShittyScript)

			const essentialData = {
				appTitle: "YocksTube",
				// url escape emojis and such
				title: he.encode(json.videoDetails.title),
				author: he.encode(json.videoDetails.author),
				description: he.encode(json.videoDetails.shortDescription),
				viewCount: json.videoDetails.viewCount,
				publishedAt: json.initialDataFromMyShittyScript.contents.twoColumnWatchNextResults.results.results.contents[0].videoPrimaryInfoRenderer.dateText.simpleText,
				subscriberCountText: json.initialDataFromMyShittyScript.contents.twoColumnWatchNextResults.results.results.contents[1].videoSecondaryInfoRenderer.owner.videoOwnerRenderer.subscriberCountText.accessibility.accessibilityData.label,
				likeCount: json.initialDataFromMyShittyScript.contents.twoColumnWatchNextResults.results.results.contents[0].videoPrimaryInfoRenderer.videoActions.menuRenderer.topLevelButtons[0].segmentedLikeDislikeButtonRenderer.likeCount,
				category: json.microformat.playerMicroformatRenderer.category,
				ownerProfileUrl: json.microformat.playerMicroformatRenderer.ownerProfileUrl,
				bestThumbnail: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
				directUrl: `https://iteroni.com/latest_version?id=${videoId}&itag=${vFormat.itag}`,
				vFormat,
				youtubeUrl: `https://www.youtube.com/watch?v=${videoId}`,
				videoId: videoId,
				isDiscordBot: userAgent?.includes("Discord") || false,
				request: request
			};

			const html = renderTemplate(essentialData);
			return new Response(html, {
				status: 200,
				headers: {
					"Content-Type": "text/html",
					"Location": directUrl?.url || `https://www.youtube.com/watch?v=${videoId}`,
				},
			});
		} else {
			return Response.redirect(`https://www.youtube.com/watch?v=${videoId}`, 302);
		}
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
	vFormat: { width: number | undefined; height: number | undefined, itag: number | undefined };
	youtubeUrl: string;
	videoId: string;
	isDiscordBot: boolean;
	request: Request;
	likeCount: string;
	subscriberCountText: string;
}) {
	return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta content='text/html; charset=UTF-8' http-equiv='Content-Type' />
<meta content="#FF0000" name="theme-color" />
<meta property="og:site_name" content="${data.appTitle + `\non ${data.publishedAt}\n&#x1F441;&#xFE0E; ${data.viewCount} &#x2764;&#xFE0E; ${data.likeCount} &#x1F465;&#xFE0E; ${data.subscriberCountText.replace(' subscribers', '')}`}">

<meta name="twitter:card" content="player" />
<meta name="twitter:title" content="${data.title}" />
<meta name="twitter:player:width" content="${data.vFormat.width}" />
<meta name="twitter:player:height" content="${data.vFormat.height}" />
<meta name="twitter:player:stream" content="${data.directUrl}" />
<meta name="twitter:image" content="${data.bestThumbnail}" />
<meta name="twitter:player:stream:content_type" content="video/mp4" />

<meta property="og:url" content="${data.youtubeUrl}" />
<meta property="og:video" content="${data.directUrl}" />
<meta property="og:video:secure_url" content="${data.directUrl}" />
<meta property="og:video:type" content="video/mp4" />
<meta property="og:video:width" content="${data.vFormat.width}" />
<meta property="og:video:height" content="${data.vFormat.height}" />
<meta property="og:image" content="${data.bestThumbnail}" />

<meta property="og:description" content="${(data.description as string).substring(0, 200)}" />
// get base url
<link rel="alternate" href="${new URL(data.request.url).origin + "/oembed.json?" + new URLSearchParams({
	"author_name": data.author,
    "author_url": data.ownerProfileUrl,
    "provider_name": data.appTitle + `\non ${data.publishedAt}\n&#x1F441;&#xFE0E; ${data.viewCount} &#x2764;&#xFE0E; ${data.likeCount} &#x1F465;&#xFE0E; ${data.subscriberCountText.replace(' subscribers', '')}`,
    "provider_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "title": data.appTitle + ` - ${data.viewCount} \uD83D\uDC41\uFE0F, in ${data.category}`,
    "type": "video",
    "version": "1.0"
}).toString()}" type="application/json+oembed" title="${data.author}"/>


<meta http-equiv="refresh" content="0; url = ${data.youtubeUrl}" />
</head>
<body>
Please wait...
<a href="${data.youtubeUrl}">Or click here.</a>
</body>
</html>
`
}

async function getVideoInfo(videoId: string) {
	const page = await fetch(`https://www.youtube.com/watch?v=${videoId}?hl=en&gl=US&has_verified=1&bpctr=9999999999`, {
		headers: {
			// set language to english
			"Accept-Language": "en-US,en;q=0.9",
		},
	})
	const pageText = await page.text();
	const regex = pageText.match(`var ytInitialPlayerResponse = (.*);<\/script>`);
	const regex2 = pageText.match(`var ytInitialData = (.*);<\/script>`);
	if (!regex || !regex2) throw new Error("Unable to find video data");

	const json = JSON.parse(regex[1]);
	const json2 = JSON.parse(regex2[1]);
	// unite both jsons
	json.initialDataFromMyShittyScript = json2;
	return json;
}