# Yockstube

### I'm looking for a domain! if you would like to help out by sponsoring or providing a domain like https://yockstube.com or https://bettrtube.com, or something you suggest - feel free to make an issue with your contact details and I will reach out.

Yockstube is a web service, running in Cloudflare Workers, that fixes YouTube embeds on messenger platforms like Discord. It allows you to watch YouTube videos directly on Discord without opening a new tab or window.

## Usage

```
s/youtube.com/yt.igerman.cc
```

Alternatively:
```
https://yt.igerman.cc/https://www.youtube.com/watch?v=dQw4w9WgXcQ
```

It should work with YouTube Music as well, that includes the horrid domain of `music.yt.igerman.cc` for easy replacement.

## Caching
This project uses a 7-day cache of every URL that it processes to avoid hammering YouTube. Subject to change.

## Installation

To install Yockstube, you need to have Node and [Cloudflare's wrangler tool](https://developers.cloudflare.com/workers/wrangler/) installed on your system. You also need to have a Cloudflare account and enabled Workers, as well as a [Workers KV database](https://developers.cloudflare.com/workers/wrangler/workers-kv/) in Cloudflare.

To install wrangler, run the following command in your terminal:

```bash
npm install -g wrangler
```

Replace the binding in `wrangler.toml` with your own ID:
```yaml
[[kv_namespaces]]
binding = "YT_CACHE_DB"
id = "your KV namespace ID" # <-- Replace This
```

Once you have everything set up, you can clone this repository and deploy Yockstube to your own Workers domain.

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

Now you can use Yockstube by replacing `https://www.youtube.com/watch?v=` with `https://yockstube.yourdomain.workers.dev/watch?v=` in any YouTube video URL and sending it to Discord.

## Development

To run Yockstube locally for development, simply run:

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

Yockstube is licensed under the GPL-3.0 License.

## Privacy

Nothing is logged explicitly, however I have full access to the KV database, meaning I am able to see what links are generated - not that I would have any reason to look through them.  
The one piece of logging that is present is a "Cache hit" log with no additional information.

## Credits

@dylanpdx' [vxtiktok](https://github.com/dylanpdx/vxtiktok) for some embed template inspiration and bot user-agent list