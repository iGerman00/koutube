<div align="center">	

  [![Badge indicating Invidious instance status](https://status.igerman.cc/api/badge/40/status?upColor=%233d843b&pendingColor=b57602&style=for-the-badge&label=Invidious)](https://koutube.com)
  [![Badge indicating count of items cached](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fkoutube.com%2Fstatus&query=%24.count&style=for-the-badge&label=Items%20cached&color=%23ff5d5b)](https://koutube.com)

</div>

<div align="center">

  [![GitHub License](https://img.shields.io/github/license/iGerman00/koutube?style=for-the-badge&color=%233d843b)](https://github.com/iGerman00/koutube)
	[![GitHub Sponsors](https://img.shields.io/github/sponsors/iGerman00?style=for-the-badge)](https://github.com/sponsors/iGerman00)

</div>

# Koutube
> pronounced a bit like "cool tube"


Koutube is a web service, running in [Cloudflare Workers](https://workers.cloudflare.com/), that fixes YouTube embeds on messenger platforms like Discord. It allows you to watch YouTube videos directly on Discord without opening a new tab or window.

## Usage 💡

```
s/y/k
```
> (sounds like SIKE very funny)

## Features 🌟
- 📊 Displays likes, subscribers, publish/last update date, and view count on videos
- 📦 [Public database listing](https://koutube.com)
- ⏯️ Supports YouTube Music (`music.koutube.com`), including mixes
- Ⓜ️ Supports `m.youtube.com`
- 📱 Supports shorts
- 📺 Supports channels
- 🎶 Supports playlists
- 🤳 Supports livestreams
- 👎 Supports [Return YouTube Dislike](https://github.com/Anarios/return-youtube-dislike)
- 🧿 Supports [DeArrow](https://dearrow.ajay.app/)
- 📼 Supports embedding with the regular player
- 🕔 Displays timecodes, including the format `1h2m3s`
- ✔️ Displays channel verification
- 📲 Automatically opens the YouTube app on mobile
- 🎞️ Natively embeds videos on Discord
- 🌐 Easily improve `youtu.be` links using [https://koutu.be](https://koutu.be)
- 🛡️ Removes tracking on redirects
- 🧪 **(BETA)** `/img/` endpoint for generating embed images
- 💥 No random explosions (fixed!)

## Caching 🚀
This project uses a 7-day cache of every URL that it processes to avoid hammering any services. Subject to change.  
For image embeds, the cache is 1 year since I expect it to be used in more static applications.

I often clear the cache when I push a new update.

## Parameters
> Not case-sensitive
- `nocache` - disables fetching the cached version
- `nothumb` - disable embedding the thumbnail, may help fix video cropping on mobile Discord clients
- `shorts` - treats the video as shorts
- `dislikes` - shows dislikes, requests from [Return YouTube Dislike](https://github.com/Anarios/return-youtube-dislike)
- `itag` - forces a specific video quality, only `itag=22` for 720p and `itag=18` for 360p are allowed
- `dearrow` - requests the thumbnail and title from [DeArrow](https://dearrow.ajay.app/)
- `stock` - embed the regular YouTube embed. Automatically set to true for some content like livestreams and premieres

> The `dearrow` parameter uses SponsorBlock data licensed used under CC BY-NC-SA 4.0 from https://sponsor.ajay.app/.  

> Shorts and non-16:9 videos are not going to have a thumbnail in the embed due to the Discord embed prioritizing the image's aspect ratio over the video and cropping it incorrectly on mobile.

Example usage:
```
https://koutu.be/dQw4w9WgXcQ?nothumb&shorts
```
Note: remember URL param syntax, the first param is always defined by a question mark, the subsequent ones - by an ampersand.

## Image Embeds 🖼️
This is an endpoint to generate embed images, for example for embedding into markdown. It renders the real YouTube embed as an image.
```
https://koutu.be/img/watch?v=dQw4w9WgXcQ
```
### Params:
- `?size=hd720` - preset sizes:
  - `small` - 320x180
  - `medium` - 640x360
  - `large` - 854x480
  - `hd720` - 1280x720
  - `hd1080` - 1920x1080

Default is `medium`.

#### Demo:
```md
[![Alt Text](https://koutu.be/img/watch?v=CpJSgoOD1-Y&size=small)](https://koutu.be/watch?v=CpJSgoOD1-Y)
```
<div align="center">

  [![KouTube image generation demonstration, "autism creature (yipee)"](https://koutu.be/img/watch?v=CpJSgoOD1-Y&size=small)](https://koutu.be/watch?v=CpJSgoOD1-Y)

</div>

## Installation ⚙️

To install Koutube, you need to have Node and [Cloudflare's wrangler tool](https://developers.cloudflare.com/workers/wrangler/) installed on your system. You also need to have a Cloudflare account and enabled Workers, as well as a [Workers D1 database](https://developers.cloudflare.com/d1/) in Cloudflare. The [Browser Rendering API](https://developers.cloudflare.com/browser-rendering/) is used for the image embed function.

To install wrangler, run the following command in your terminal:

```bash
npm install -g wrangler
```

Replace the binding in `wrangler.toml` with your own ID:
```yaml
[[d1_databases]]
binding = "D1_DB"
database_id = "1234abcd-5678-ef90-1234-5678ef901234" # <-- Replace with your D1 database ID
database_name = "koutube-db"
```

You will need to initialize the database with the following command:
```bash
npm run init-remote-db
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
  https://koutube.yourdomain.workers.dev
Current Deployment ID: 1234abcd-5678-efgh-9012-ijklmnopqrst
```

Now you can use Koutube by replacing `https://www.youtube.com/watch?v=` with `https://koutube.yourdomain.workers.dev/watch?v=` in any YouTube video URL and sending it to Discord.

---

## Optional: Private Invidious Instance

Koutube is capable of working with a semi-private Invidious instance. All that is required for that is to define the secrets and Koutube will automatically pick your instance over every other.

To configure your own:
1. Follow the [Invidious installation guide](https://docs.invidious.io/installation/)
2. Optionally restrict the instance to require an `Authorization` header  
   Sidenote: `/vi*` and `/latest_version*` must be publicly accessible for Discord to validate the embed
3. Deploy secrets using Wrangler:
```bash
npx wrangler secret put IV_AUTH
# Follow the steps and enter your token value
npx wrangler secret put IV_DOMAIN
# Do the same but for your domain. For example, invidious.yourdoma.in
```

> If you do not want to keep your instance private, you can either just add it in `constants.ts` or specify any authorization token value

If you want your secrets to be accessible during developement, create a file named `.dev.vars` and populate it as such:
```bash
IV_DOMAIN=invidious.yourdoma.in
IV_AUTH=YourTok3n
```

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

To **manually purge** the production database, run:
```bash
npm run init-remote-db
```

To purge the local database, run:
```bash
npm run init-db
```

This will remove everything and initialize an empty D1 database.

## License 📄

Koutube is licensed under the GPL-3.0 License.

## Privacy 🔒

- The cache listing, which is a list of the vast majority of links processed by Koutube [is public](https://koutu.be)

- I try not to log anything I don't need, but I log some errors here and there and whenever a cached response is returned. The processing time of the request is also logged, for me to debug any anomalies.  

- A private Invidious instance that I host is used. No logging is configured on it. 

> I have to actively enable log streaming by typing a command or logging into the Cloudflare dashboard. As you can imagine, I don't do that unless I am debugging an error.  

## Credits 👏

- [@dylanpdx](https://github.com/dylanpdx)' [vxtiktok](https://github.com/dylanpdx/vxtiktok) for some embed template inspiration and bot user-agent list
- [Invidious](https://invidious.io/) team for the easy-to-use API
- [Return YouTube Dislike](https://github.com/Anarios/return-youtube-dislike) by [@Anarios](https://github.com/Anarios)
- [DeArrow](https://dearrow.ajay.app/) by [@ajayyy](https://github.com/ajayyy)
- [Cloudflare](https://cloudflare.com/), for providing the free and easy-to-use serverless architecture and D1 database API for this project
