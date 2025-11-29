# Koutube API Documentation

> [!WARNING]
> This API is a work in progress. Please report any issues you encounter that do not occur on the main service. Do not report Invidious problems here.

Koutube provides a JSON API on all domains that mirrors the functionality of the main service. It allows you to retrieve metadata about YouTube videos, playlists, channels, and mixes in a machine-readable format.

## Base URL

The API is available at `/api`. You can append any supported YouTube URL path to this base.

Example: `https://koutube.com/api/watch?v=dQw4w9WgXcQ`

## Endpoints

The API supports the following content types:
- **Videos**: `/api/watch?v=...` or `/api/dQw4w9WgXcQ` (short links)
- **Playlists**: `/api/playlist?list=...`
- **Channels**: `/api/channel/...`, `/api/c/...`, `/api/@...`, `/api/user/...`
- **Mixes**: `/api/watch?v=...&list=...` (currently only handled as mix if requested from `music.koutube.com`)
- **Images**: `/api/img/watch?v=...`

## Parameters

The API supports the same parameters as the main service:

- `dearrow`: Requests the thumbnail and title from DeArrow.
- `direct`: Bypasses cache and metadata, returns direct link (if applicable).
- `dislikes`: Shows dislikes (from Return YouTube Dislike).
- `itag`: Forces a specific video quality (`22` for 720p, `18` for 360p).
- `nocache`: Disables fetching the cached version.
- `nothumb`: Disable embedding the thumbnail.
- `shorts`: Treats the video as shorts.
- `stock`: Embed the regular YouTube embed.

## Response Schema

The API returns a JSON object with the following fields. Note that fields may be `null` if not applicable to the content type or not available. Additionally, fields might be like when YouTube Music links return no image URL. A lot of fields are strings, not numbers - check types on your side because it's too much effort to fix all that 🤷‍♂️.

Real example:
```json
{
  "siteName": "Koutube - use s/y/k",
  "contentType": "video",
  "themeColor": "#ff5d5b",
  "playerStreamUrl": "https://invidious-instance.com/latest_version?id=dQw4w9WgXcQ&itag=18&local=false",
  "videoWidth": 640,
  "videoHeight": 360,
  "image": "https://invidious-instance.com/vi/dQw4w9WgXcQ/maxres.jpg",
  "description": "The official video for &#x201C;Never Gonna Give You Up&#x201D; by Rick Astley. \n\nNever: The Autobiography &#x1F4DA; OUT NOW! \nFollow this link to get your copy a...",
  "originalUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "authorName": "Rick Astley",
  "uploadDate": "Uploaded 16 years ago",
  "likeCount": "18,655,379",
  "dislikeCount": 499174,
  "subscriberCount": "4.43M",
  "followersCount": "4.43M",
  "viewCount": "1,717,762,702",
  "videoCount": null,
  "songCount": null,
  "imageData": null,
  "error": null
}
```

<details>
<summary>Real example response</summary>
```json

```
</details>

### Error Response

If an error occurs, the `error` field will contain a description, and other fields may be null.

```json
{
  "error": "Invalid Video ID"
}
```

## Caching

API responses are cached separately from the HTML responses. The cache duration depends on the content type (typically 1 week).

They **do not** appear in the public cache listing, but are still stored in the database.

All requests (normal and API) that were returned from the cache will include a `Cached-On` header. If it is not present, the response was generated fresh.

## Rate Limiting

All API requests are subject to rate limiting to prevent abuse and overwhelming my tiny Invidious instance. Please be respectful and avoid making excessive requests, otherwise I may have to implement authentication or disable the API altogether.

- 10 requests per second (RPS) maximum
- Exceeding the limit results in a temporary block of 10 seconds, Cloudflare-side
- After the block period, requests are allowed again

| Time (s) | Request Count | Result |
|-----------|----------------|--------|
| 0–1       | 10             | ✅ OK |
| 1–2       | +5 (total 15)  | ❌ Blocked |
| 1–10      | Any requests   | ❌ Blocked |
| 11        | Request        | ✅ Allowed again |
