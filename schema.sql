DROP TABLE IF EXISTS CacheEntries;
CREATE TABLE IF NOT EXISTS CacheEntries (EntryKey TEXT PRIMARY KEY, Entry TEXT, Expiration INTEGER);