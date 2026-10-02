CREATE TABLE IF NOT EXISTS submissions (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  pathway    TEXT NOT NULL CHECK (pathway IN ('red', 'yellow', 'green')),
  answers    TEXT NOT NULL -- JSON: {"q1":"25-39","q2":"no",...}; query with json_extract(answers, '$.q3')
);
