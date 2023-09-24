export async function isChannelVerified(channelId: string): Promise<boolean> {
    console.log('checking verification')
	const page = await fetch(`https://iteroni.com/api/v1/channels/${channelId}?hl=en&fields=authorVerified`, {
		headers: {
			// set language to english
			'Accept-Language': 'en-US,en;q=0.9',
			'User-Agent': 'Mozilla/5.0 (compatible; Yockstube/1.0; +https://github.com/igerman00/yockstube)',
		},
	});
	const json: { authorVerified: boolean; } = await page.json();
	return json.authorVerified;
}