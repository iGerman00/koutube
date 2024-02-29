# Koutube (ex YocksTube)
*pronounced a bit like "cool tube"*

Koutube is a web service, running in [Cloudflare Workers](https://workers.cloudflare.com/), that fixes YouTube embeds on messenger platforms like Discord. It allows you to watch YouTube videos directly on Discord without opening a new tab or window.

## Usage 💡

```
s/y/k
```
(sounds like SIKE very funny)

Alternatively:
```
https://koutube.com/https://www.youtube.com/watch?v=dQw4w9WgXcQ
```

It should work with YouTube Music as well, that includes `music.koutube.com` for easy replacement.

## Features 🌟
- 📊 Displays likes, subscribers, publish/last update date, and view count
- 📦 Public database listing [on /](https://koutube.com)
- 🎵 Supports `music.youtube.com`
- ⏯️ Supports YouTube Music mixes
- 📱 Supports shorts
- 🌐 Covers `youtu.be` links using [https://koutu.be](https://koutu.be)
- 🎞️ Natively embeds videos
- 🎶 Handles playlists
- 🤳 Handles livestreams
- ✔️ Displays channel verification status
- 🚀 *May* bypass age restrictions
- 🛡️ Removes tracking on redirects
- 👎 Supports dislikes via RYD
- 📲 Automatically redirects to the YouTube app on mobile
- 🕔 Displays timecodes
- 💥 No random explosions (fixed!)

## Caching 🚀
This project uses a 7-day cache of every URL that it processes to avoid hammering any services. Subject to change.  
To disable fetching the cached version, append `?noCache` or `&noCache` if your URL already has a param like `?v`

## Parameters
- `nothumb` to disable embedding the thumbnail, may help fix video cropping on mobile Discord clients
- `shorts` - treats the video as shorts

Example usage:
```
https://koutu.be/dQw4w9WgXcQ?nothumb&shorts
```
Note: remember URL param syntax, the first param is always defined by a question mark, the subsequent ones - by an apersand.

## Installation ⚙️

To install Koutube, you need to have Node and [Cloudflare's wrangler tool](https://developers.cloudflare.com/workers/wrangler/) installed on your system. You also need to have a Cloudflare account and enabled Workers, as well as a [Workers KV database](https://developers.cloudflare.com/workers/wrangler/workers-kv/) in Cloudflare.

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

Once you have everything set up, you can clone this repository and deploy Koutube to your own Workers domain.

```bash
git clone https://github.com/igerman00/koutube.git
cd koutube
npm i
wrangler deploy
```

You should see a message like this:

```bash
 ⛅️ wrangler 3.9.0
------------------
Total Upload: 7.10 KiB / gzip: 2.45 KiB
Uploaded Koutube (1.96 sec)
Published Koutube (1.43 sec)
  https://Koutube.yourdomain.workers.dev
Current Deployment ID: 1234abcd-5678-efgh-9012-ijklmnopqrst
```

Now you can use Koutube by replacing `https://www.youtube.com/watch?v=` with `https://Koutube.yourdomain.workers.dev/watch?v=` in any YouTube video URL and sending it to Discord.

## Development 🧑‍💻

To run Koutube locally for development, simply run:

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

To **manually purge** the database, run:
```bash
npm run purge-db
```
This will remove all keys from the cache KV database

Note: if you have changed the binding name, you will also need to change it in `scripts/purgeDb.js`

## License 📄

Koutube is licensed under the GPL-3.0 License.

## Privacy 🔒

Nothing is logged explicitly, however I have full access to the KV database, meaning I am able to see what links are generated - not that I would have any reason to look through them.  
The one piece of logging that is present is a "Cache hit" log with no additional information.  

[Iteroni](https://iteroni.com)'s API is used, their [privacy policy](https://iteroni.com/privacy) applies.

## Credits 👏

- [@dylanpdx](https://github.com/dylanpdx)' [vxtiktok](https://github.com/dylanpdx/vxtiktok) for some embed template inspiration and bot user-agent list
- [Iteroni](https://iteroni.com) Invidious Instance and Invidious team for the easy-to-use API
- [Return YouTube Dislike](https://github.com/Anarios/return-youtube-dislike) by [@Anarios](https://github.com/Anarios)
- [Cloudflare](https://cloudflare.com/), for providing the free and easy-to-use serverless architecture and KV database API for this project
