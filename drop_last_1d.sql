DELETE FROM CacheEntries WHERE datetime(json_extract(Entry, '$.headers.Cached-On')) > datetime('now', '-1 day');
