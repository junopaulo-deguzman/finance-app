PRAGMA foreign_keys=OFF;

ALTER TABLE accounts RENAME TO accounts_old;

CREATE TABLE accounts (
  id TEXT PRIMARY KEY NOT NULL,
  house_id TEXT NOT NULL,
  name TEXT NOT NULL,
  provider TEXT NOT NULL DEFAULT 'manual',
  type TEXT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'PHP',
  is_archived INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

INSERT INTO accounts (id, house_id, name, provider, type, currency, is_archived, created_at, updated_at)
SELECT
  id,
  COALESCE(NULLIF(TRIM(house_id), ''), 'default-house') AS house_id,
  name,
  provider,
  type,
  currency,
  is_archived,
  created_at,
  updated_at
FROM (
  SELECT id, '' as house_id, name, provider, type, currency, is_archived, created_at, updated_at FROM accounts_old
);

DROP TABLE accounts_old;

CREATE INDEX accounts_house_idx ON accounts(house_id);
CREATE INDEX accounts_archived_idx ON accounts(is_archived);

PRAGMA foreign_keys=ON;
