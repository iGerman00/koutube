# yockstube

Yockstube is a web service, running in Cloudflare Workers, that fixes YouTube embeds on messenger platforms like Discord. It allows you to watch YouTube videos directly on Discord without opening a new tab or window. 

## Usage

```
s/u/cks
```

## Installation

To install yockstube, you need to have Node and [Cloudflare's wrangler tool](https://developers.cloudflare.com/workers/wrangler/) installed on your system. You also need to have a Cloudflare account and enabled Workers. 

To install wrangler, run the following command in your terminal:

```bash
npm install -g @cloudflare/wrangler
```

Once you have everything set up, you can clone this repository and deploy yockstube to your own Workers domain.

```bash
git clone https://github.com/yocks/yockstube.git
cd yockstube
npm i
wrangler deploy
```

You should see a message like this:

```bash
 ⛅️ wrangler 3.9.0
------------------
Total Upload: 7.10 KiB / gzip: 2.45 KiB
Uploaded yockstube (1.96 sec)
Published yockstube (1.43 sec)
  https://yockstube.yourdomain.workers.dev
Current Deployment ID: 1234abcd-5678-efgh-9012-ijklmnopqrst
```

Now you can use yockstube by replacing `https://www.youtube.com/watch?v=` with `https://yockstube.yourdomain.workers.dev/watch?v=` in any YouTube video URL and sending it to Discord.

## Development

To run yockstube locally for development, simply run:
```bash
wrangler dev
```

You should see a message like this:

```bash
⛅️ wrangler 3.9.0
------------------
wrangler dev now uses local mode by default, powered by 🔥 Miniflare and 👷 workerd.
To run an edge preview session for your Worker, use wrangler dev --remote
⎔ Starting local server...
[mf:inf] Ready on http://0.0.0.0:8787 
╭─────────────────────────────────────────────────────────────────────────────────╮
│ [b open a       [d] open        [l] turn off local   [c] clear       [x] to     │
│   browser,         Devtools,       mode,                console,        exit    │
╰─────────────────────────────────────────────────────────────────────────────────╯
```

## License

yockstube is licensed under the GPL-3.0 License.

## Credits
@dylanpdx' [vxtiktok](https://github.com/dylanpdx/vxtiktok) for some embed template inspiration and bot user-agent list