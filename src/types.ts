export type Env = {
	YT_CACHE_DB: KVNamespace;
	BROWSER: Fetcher;
};

export type CacheData = {
	response: string;
	headers: {
		'Content-Type': string;
		'Cached-On': string;
	};
};

type ThumbnailObject = {
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

export type Video = {
	title: string;
	type?: string;
	error?: string;
	videoThumbnails: ThumbnailObject[];
	description: string;
	publishedText: string;
	viewCount: number;
	likeCount: number;
	dislikeCount: number;
	author: string;
	authorUrl: string;
	authorId: string;
	subCountText: string;
	isListed: boolean;
	liveNow: boolean;
	isUpcoming: boolean;
	formatStreams: FormatStream[];
};

export type RYDResponse = {
	id: string;
	dateCreated: string;
	likes: number;
	dislikes: number;
	rating: number
	viewCount: number;
	deleted: boolean;
};

export type VideoEmbedData = {
	appTitle: string;
	type?: string;
	error?: string;
	title: string;
	formatStreams: FormatStream[];
	author: string;
	isVerified: boolean;
	description: string;
	viewCount: string;
	publishedAt: string;
	subscriberCountText: string;
	likeCount: string;
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
	rydResponse?: RYDResponse; 
	request: Request;
};

type PlaylistVideo = {
	title: string;
	videoId: string;
	author: string;
	authorUrl: string;
	authorId: string;
	videoThumbnails: ThumbnailObject[];
	index: number;
	lengthSeconds: number;
};

export type PlaylistInfo = {
	title: string;
	playlistThumbnail: string;
	description: string;
	author: string;
	authorUrl: string;
	authorId: string;
	videoCount: number;
	viewCount: number;
	updated: number;
	videos: PlaylistVideo[];
};

export type PlaylistEmbedData = {
	appTitle: string;
    title: string;
    author: string;
	isVerified: boolean;
    description: string;
    viewCount: string;
    lastUpdated: Date;
    videoCount: string;
    ownerProfileUrl: string;
    bestThumbnail: string;
    videos: PlaylistVideo[];
    youtubeUrl: string;
    videoId?: string;
	playlistId?: string;
    request: Request;
};

export type ChannelInfo = {
	author: string;
	authorId: string;
	authorUrl: string;
	authorBanners: ThumbnailObject[];
	authorThumbnails: ThumbnailObject[];
	subCount: number;
	totalViews: number;
	joined: number;
	autoGenerated: boolean;
	isFamilyFriendly: boolean;
	description: string;
	descriptionHtml: string;
	allowedRegions: string[];
	tabs: string[];
	authorVerified: boolean;
	latestVideos: Video[];
	relatedChannels: unknown[];
};

export type ChannelEmbedData = {
	appTitle: string;
	description: string;
	author: string;
	bestThumbnail: string;
	subCount: string;
	isVerified: boolean;
	latestVideos: Video[];
	youtubeUrl: string;
	authorId: string;
	request: Request;
}

export type MixInfo = {
	title: string;
	mixId: string;
	videos: PlaylistVideo[];
};

export type MixEmbedData = {
	appTitle: string;
	title: string;
	videos: PlaylistVideo[];
	youtubeUrl: string;
	mixId: string;
	request: Request;
	songCount: string;
};

export type PublicCacheEntry = {
	url: string;
	type: string;
	timecode?: string;
	expiration?: number;
	size: string | null;
	itag: string | null;
};