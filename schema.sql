DROP TABLE IF EXISTS CacheEntries;
CREATE TABLE IF NOT EXISTS CacheEntries (EntryKey TEXT PRIMARY KEY, Entry TEXT, Expiration INTEGER);
CREATE INDEX idx_entrykey ON CacheEntries(EntryKey);
CREATE INDEX idx_expiration ON CacheEntries(Expiration);