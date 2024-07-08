export const api_instances = [
	// no trailing slash
	'https://iteroni.com',
	'https://invidious.einfachzocken.eu',
	'https://iv.nboeck.de',
];

export function getRandomApiInstance() {
	return api_instances[Math.floor(Math.random() * api_instances.length)];
}

export const config = {
    appName: 'Koutube - embed using s/y/k',
	appLink: 'https://koutube.com',

	enableTickCheck: false, // costs an extra request to the iteroni api
	enableDislikes: true, // costs a request to the RYD api
	enableImageEmbeds: true, // requires browser rendering api which is waitlisted as of now

	api_base: getRandomApiInstance(),
	auth: '',

	viewEmoji: '&#x1F441;&#xFE0E;', // 👁️
	likeEmoji: '&#x1F44D;&#xFE0E;', // 👍
	dislikeEmoji: '&#x1F44E;&#xFE0E;', // 👎
	subscriberEmoji: '&#x1F465;&#xFE0E;', // 👥
	videoEmoji: '&#x1F3AC;&#xFE0E;', // 🎬
	songEmoji: '&#x1F3B6;&#xFE0E;', // 🎶
	timecodeEmoji: '&#x1F554;&#xFE0E;', // 🕔
	checkmarkEmoji: '&#x2713;&#xFE0E;', // ✓
	tvEmoji: '&#x1F4FA;&#xFE0E;', // 📺

	emptyString: '&#xFEFF;', // zero width no-break space

	channelExpireTime: 60 * 60 * 24 * 7, // 1 week
	videoExpireTime: 60 * 60 * 24 * 7, // 1 week
	playlistExpireTime: 60 * 60 * 24 * 7, // 1 week
	mixExpireTime: 60 * 60 * 24 * 7, // 1 week
	imageExpireTime: 60 * 60 * 24 * 365, // 1 year
};

export const embedUserAgents = [
	'facebookexternalhit/1.1',
	'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.57 Safari/537.36',
	'Mozilla/5.0 (Windows; U; Windows NT 10.0; en-US; Valve Steam Client/default/1596241936; ) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.117 Safari/537.36',
	'Mozilla/5.0 (Windows; U; Windows NT 10.0; en-US; Valve Steam Client/default/0; ) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.117 Safari/537.36',
	'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/601.2.4 (KHTML, like Gecko) Version/9.0.1 Safari/601.2.4 facebookexternalhit/1.1 Facebot Twitterbot/1.0',
	'Facebot',
	'Twitterbot/1.0',
	'WhatsApp',
	'facebookexternalhit/1.1',
	'Mozilla/5.0 (Windows; U; Windows NT 6.1; en-US; Valve Steam FriendsUI Tenfoot/0; ) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.105 Safari/537.36',
	'Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)',
	'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.10; rv:38.0) Gecko/20100101 Firefox/38.0',
	'Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)',
	'TelegramBot (like TwitterBot)',
	'Mozilla/5.0 (compatible; January/1.0; +https://gitlab.insrt.uk/revolt/january)',
	'test'
];

export const robots = 
`
User-agent: dotbot
Disallow: /
`