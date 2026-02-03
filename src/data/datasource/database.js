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

    CREATE TABLE IF NOT EXISTS personal_practice_plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      content TEXT NOT NULL,
      daily_goal INTEGER NOT NULL,
      unit TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      message_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS personal_practice_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      plan_id INTEGER NOT NULL,
      user_id TEXT NOT NULL,
      check_date TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (plan_id) REFERENCES personal_practice_plans(id) ON DELETE CASCADE,
      UNIQUE(plan_id, check_date)
    );

    CREATE TABLE IF NOT EXISTS activity_type_config (
      activity_type TEXT PRIMARY KEY,
      points INTEGER NOT NULL,
      cooldown_minutes INTEGER NOT NULL,
      daily_cap INTEGER,
      enabled INTEGER NOT NULL DEFAULT 1,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS point_accumulation_log (
      user_id TEXT NOT NULL,
      activity_type TEXT NOT NULL,
      last_accumulated_at DATETIME NOT NULL,
      daily_count INTEGER NOT NULL DEFAULT 0,
      daily_date TEXT NOT NULL,
      PRIMARY KEY (user_id, activity_type)
    );

    CREATE TABLE IF NOT EXISTS point_award_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      activity_type TEXT NOT NULL,
      points_awarded INTEGER NOT NULL,
      awarded_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS quiz_questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL,
      question TEXT NOT NULL,
      option_1 TEXT NOT NULL,
      option_2 TEXT NOT NULL,
      option_3 TEXT NOT NULL,
      option_4 TEXT NOT NULL,
      option_5 TEXT NOT NULL,
      answer INTEGER NOT NULL,
      explanation TEXT NOT NULL,
      created_by TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS quiz_config (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      quiz_channel_id TEXT,
      quiz_time TEXT DEFAULT '09:00',
      explanation_time TEXT DEFAULT '21:00',
      enabled INTEGER DEFAULT 1,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS quiz_categories (
      name TEXT PRIMARY KEY,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS quiz_publish_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question_id INTEGER NOT NULL,
      published_date TEXT NOT NULL,
      message_id TEXT,
      explanation_revealed INTEGER DEFAULT 0,
      published_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (question_id) REFERENCES quiz_questions(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS quiz_answers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question_id INTEGER NOT NULL,
      user_id TEXT NOT NULL,
      selected_option INTEGER NOT NULL,
      is_correct INTEGER NOT NULL,
      points_awarded INTEGER DEFAULT 0,
      submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME,
      FOREIGN KEY (question_id) REFERENCES quiz_questions(id) ON DELETE CASCADE,
      UNIQUE (question_id, user_id)
    );

    -- Initialize settings if not exists
    INSERT OR IGNORE INTO settings (key, value) VALUES ('meeting_count', '0');
    INSERT OR IGNORE INTO settings (key, value) VALUES ('inactive_days', '90');

    -- Initialize point config with defaults
    INSERT OR IGNORE INTO point_config (id, points_per_action, cooldown_minutes)
    VALUES (1, 100, 5);

    -- Initialize activity type configs with defaults
    INSERT OR IGNORE INTO activity_type_config (activity_type, points, cooldown_minutes, daily_cap)
    VALUES
      ('FORUM_POST', 300, 5, NULL),
      ('QUESTION_ANSWER', 300, 5, NULL),
      ('MEETING_ATTEND', 250, 5, NULL),
      ('PERSONAL_PRACTICE', 150, 1440, 1),
      ('GENERAL', 50, 5, NULL),
      ('QUIZ_PARTICIPATE', 150, 0, 1),
      ('QUIZ_CORRECT', 200, 0, 1);

    -- Initialize quiz config with defaults
    INSERT OR IGNORE INTO quiz_config (id, quiz_time, explanation_time, enabled)
    VALUES (1, '09:00', '21:00', 1);
  `);

  console.log('✅ Database initialization complete');
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
