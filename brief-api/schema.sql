CREATE TABLE IF NOT EXISTS operating_briefs (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  profession TEXT NOT NULL,
  raw_data TEXT NOT NULL,
  current_layer TEXT NOT NULL,
  bottleneck TEXT NOT NULL,
  unlock TEXT NOT NULL,
  next_move TEXT NOT NULL,
  dimensions TEXT NOT NULL,
  origin TEXT NOT NULL,
  user_agent TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS operating_briefs_created_at
  ON operating_briefs (created_at DESC);
