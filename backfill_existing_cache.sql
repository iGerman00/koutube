-- One-time backfill: populate ContentType and CachedOn columns from existing JSON blobs.
-- Run via: wrangler d1 execute koutube-db --remote --file=backfill_existing_cache.sql
ALTER TABLE CacheEntries ADD COLUMN ContentType TEXT;
ALTER TABLE CacheEntries ADD COLUMN CachedOn INTEGER;
CREATE INDEX IF NOT EXISTS idx_content_type ON CacheEntries(ContentType);

UPDATE CacheEntries
SET ContentType = json_extract(Entry, '$.headers.Content-Type'),
    CachedOn = strftime('%s', json_extract(Entry, '$.headers.Cached-On'))
WHERE ContentType IS NULL;
