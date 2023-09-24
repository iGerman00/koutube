export type Env = {
	YT_CACHE_DB: KVNamespace;
};

export type CacheData = {
	response: string;
	headers: {
		'Content-Type': string;
		'Cached-On': string;
	};
};

type VideoThumbnail = {
	url: string;
	width: number;
	height: number;
};

type FormatStream = {
	url: string;
	itag: string;
	type: string;
	quality: string;
	container: string;
	encoding: string;
	qualityLabel: string;
	resolution: string;
	size: string;
};

export type VideoInfo = {
	title: string;
	videoThumbnails: VideoThumbnail[];
	description: string;
	publishedText: string;
	viewCount: number;
	likeCount: number;
	dislikeCount: number;
	author: string;
	authorUrl: string;
	subCountText: string;
	isListed: boolean;
	liveNow: boolean;
	isUpcoming: boolean;
	formatStreams: FormatStream[];
};

export type VideoEmbedData = {
	appTitle: string;
	title: string;
	author: string;
	description: string;
	viewCount: number;
	publishedAt: string;
	subscriberCountText: string;
	likeCount: number;
	ownerProfileUrl: string;
	bestThumbnail: string;
	directUrl: string | null;
	isLive: boolean;
	resolution: {
		width: number;
		height: number;
	};
	youtubeUrl: string;
	videoId: string;
	request: Request;
};

type PlaylistVideo = {
	title: string;
	videoId: string;
	author: string;
	authorUrl: string;
	videoThumbnails: VideoThumbnail[];
	index: number;
	lengthSeconds: number;
};

export type PlaylistInfo = {
	title: string;
	playlistThumbnail: string;
	description: string;
	author: string;
	authorUrl: string;
	videoCount: number;
	viewCount: number;
	updated: number;
	videos: PlaylistVideo[];
};

export type PlaylistEmbedData = {
	appTitle: string;
    title: string;
    author: string;
    description: string;
    viewCount: number;
    lastUpdated: Date;
    videoCount: number;
    ownerProfileUrl: string;
    bestThumbnail: string;
    videos: PlaylistVideo[];
    youtubeUrl: string;
    videoId: string;
    request: Request;
};