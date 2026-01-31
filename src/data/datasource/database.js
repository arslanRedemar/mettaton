const Database = require('better-sqlite3');

let db = null;

function initializeDatabase(dbPath) {
  db = new Database(dbPath);

  // Enable WAL mode for better performance
  db.pragma('journal_mode = WAL');

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS lectures (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      start TEXT NOT NULL,
      end TEXT NOT NULL,
      location TEXT NOT NULL,
      teacher TEXT NOT NULL,
      message_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS lecture_attendees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lecture_id INTEGER NOT NULL,
      user_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (lecture_id) REFERENCES lectures(id) ON DELETE CASCADE,
      UNIQUE(lecture_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      author TEXT NOT NULL,
      question TEXT NOT NULL,
      answer TEXT,
      answered_by TEXT,
      message_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS question_attendees (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question_id INTEGER NOT NULL,
      user_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
      UNIQUE(question_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS meeting_config (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      channel_id TEXT NOT NULL,
      schedule_hour INTEGER NOT NULL DEFAULT 20,
      schedule_minute INTEGER NOT NULL DEFAULT 58,
      meeting_start_time TEXT NOT NULL DEFAULT '23:00',
      meeting_end_time TEXT NOT NULL DEFAULT '24:00',
      location TEXT NOT NULL DEFAULT '음성 채널 수행방(온라인)',
      activity TEXT NOT NULL DEFAULT '각자 수행 및 일지 작성',
      enabled INTEGER NOT NULL DEFAULT 0,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS bot_strings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      params TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS member_activity (
      user_id TEXT PRIMARY KEY,
      last_active_at DATETIME NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS activity_points (
      user_id TEXT PRIMARY KEY,
      points INTEGER NOT NULL DEFAULT 0,
      last_accumulated_at DATETIME,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS point_config (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      points_per_action INTEGER NOT NULL DEFAULT 100,
      cooldown_minutes INTEGER NOT NULL DEFAULT 5,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Initialize settings if not exists
    INSERT OR IGNORE INTO settings (key, value) VALUES ('meeting_count', '0');
    INSERT OR IGNORE INTO settings (key, value) VALUES ('inactive_days', '90');

    -- Initialize point config with defaults
    INSERT OR IGNORE INTO point_config (id, points_per_action, cooldown_minutes)
    VALUES (1, 100, 5);
  `);

  console.log('✅ 데이터베이스 초기화 완료');
  return db;
}

function getDatabase() {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase first.');
  }
  return db;
}

function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}

module.exports = {
  initializeDatabase,
  getDatabase,
  closeDatabase,
};
