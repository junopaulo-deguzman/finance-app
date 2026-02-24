PRAGMA foreign_keys=OFF;

CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  provider TEXT NOT NULL DEFAULT 'manual',
  type TEXT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'PHP',
  is_archived INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

INSERT INTO accounts (id, name, provider, type, currency, is_archived, created_at, updated_at)
SELECT 'legacy-default-account', 'Primary Checking', 'legacy', 'checking', 'PHP', 0,
       CAST(strftime('%s','now') * 1000 AS INTEGER),
       CAST(strftime('%s','now') * 1000 AS INTEGER)
WHERE NOT EXISTS (SELECT 1 FROM accounts);

ALTER TABLE transactions RENAME TO transactions_old;

CREATE TABLE transactions (
  id TEXT PRIMARY KEY NOT NULL,
  date TEXT NOT NULL,
  type TEXT NOT NULL,
  account_id TEXT NOT NULL REFERENCES accounts(id),
  to_account_id TEXT REFERENCES accounts(id),
  amount REAL NOT NULL CHECK(amount > 0),
  amount_signed REAL,
  note TEXT NOT NULL DEFAULT '',
  category_id TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  CONSTRAINT transactions_transfer_shape_chk CHECK (
    (type = 'transfer' AND to_account_id IS NOT NULL AND to_account_id <> account_id)
    OR
    (type <> 'transfer' AND to_account_id IS NULL)
  ),
  CONSTRAINT transactions_adjustment_signed_chk CHECK (
    (type <> 'adjustment' AND amount_signed IS NULL)
    OR
    (type = 'adjustment' AND amount_signed IS NOT NULL AND amount_signed <> 0)
  )
);

INSERT INTO transactions (
  id, date, type, account_id, to_account_id, amount, amount_signed, note, category_id, created_at, updated_at
)
SELECT
  id,
  date,
  CASE
    WHEN type = 'save' THEN 'transfer'
    ELSE type
  END AS type,
  'legacy-default-account' AS account_id,
  NULL AS to_account_id,
  ABS(amount) AS amount,
  NULL AS amount_signed,
  COALESCE(note, '') AS note,
  category AS category_id,
  created_at,
  COALESCE(created_at, CAST(strftime('%s','now') * 1000 AS INTEGER)) AS updated_at
FROM transactions_old;

UPDATE transactions
SET type = 'expense',
    category_id = 'goal_funding',
    note = CASE WHEN note = '' THEN 'Converted from legacy save transaction' ELSE note END
WHERE type = 'transfer';

DROP TABLE transactions_old;

CREATE INDEX transactions_account_date_idx ON transactions(account_id, date);
CREATE INDEX transactions_to_account_date_idx ON transactions(to_account_id, date);
CREATE INDEX transactions_type_date_idx ON transactions(type, date);

PRAGMA foreign_keys=ON;
