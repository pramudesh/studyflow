// eslint-disable-next-line @typescript-eslint/no-explicit-any
const { DatabaseSync } = (require as any)("node:sqlite");
import crypto from "node:crypto";
import path from "node:path";
import fs from "node:fs";
import { ApiError } from "../utils/ApiError";

const dataDir = path.resolve(__dirname, "../../data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "studyflow.db");
const db = new DatabaseSync(dbPath);

// Initialize database schema matching 001_schema.sql and GoTrue
db.exec(`
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL COLLATE NOCASE,
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS profiles (
    id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS sessions (
    access_token TEXT PRIMARY KEY,
    refresh_token TEXT UNIQUE NOT NULL,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS subjects (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    code TEXT,
    name TEXT NOT NULL,
    instructor TEXT,
    credits INTEGER,
    color TEXT NOT NULL DEFAULT '#2563EB',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject_id TEXT REFERENCES subjects(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    notes TEXT,
    priority TEXT NOT NULL DEFAULT 'medium',
    due_date TEXT,
    due_time TEXT,
    duration_minutes INTEGER,
    reminder_enabled INTEGER NOT NULL DEFAULT 0,
    is_completed INTEGER NOT NULL DEFAULT 0,
    completed_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString("hex");
}

export const localDb = {
  // --- Auth & Users ---
  createUser(data: { email: string; password: string; fullName?: string }) {
    const existing = db
      .prepare("SELECT id FROM users WHERE email = ?")
      .get(data.email);
    if (existing) {
      throw ApiError.badRequest("User already registered with this email address");
    }

    const id = crypto.randomUUID();
    const salt = crypto.randomBytes(16).toString("hex");
    const passwordHash = hashPassword(data.password, salt);
    const now = new Date().toISOString();

    const insertUser = db.prepare(`
      INSERT INTO users (id, email, password_hash, salt, full_name, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    insertUser.run(id, data.email.toLowerCase(), passwordHash, salt, data.fullName || null, now, now);

    const insertProfile = db.prepare(`
      INSERT INTO profiles (id, full_name, created_at, updated_at)
      VALUES (?, ?, ?, ?)
    `);
    insertProfile.run(id, data.fullName || null, now, now);

    const accessToken = `sf_at_${crypto.randomBytes(32).toString("hex")}`;
    const refreshToken = `sf_rt_${crypto.randomBytes(32).toString("hex")}`;
    const expiresAt = Date.now() + 3600 * 24 * 7 * 1000; // 7 days

    db.prepare(`
      INSERT INTO sessions (access_token, refresh_token, user_id, expires_at)
      VALUES (?, ?, ?, ?)
    `).run(accessToken, refreshToken, id, expiresAt);

    const userObj = {
      id,
      email: data.email.toLowerCase(),
      user_metadata: {
        full_name: data.fullName || null,
        avatar_url: null,
      },
      created_at: now,
    };

    return {
      user: userObj,
      session: {
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_in: 3600 * 24 * 7,
      },
      requiresEmailConfirmation: false,
    };
  },

  loginUser(data: { email: string; password: string }) {
    const row = db
      .prepare("SELECT * FROM users WHERE email = ?")
      .get(data.email.toLowerCase()) as
      | {
          id: string;
          email: string;
          password_hash: string;
          salt: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
        }
      | undefined;

    if (!row) {
      throw ApiError.unauthorized("Invalid login credentials");
    }

    const testHash = hashPassword(data.password, row.salt);
    if (testHash !== row.password_hash) {
      throw ApiError.unauthorized("Invalid login credentials");
    }

    const accessToken = `sf_at_${crypto.randomBytes(32).toString("hex")}`;
    const refreshToken = `sf_rt_${crypto.randomBytes(32).toString("hex")}`;
    const expiresAt = Date.now() + 3600 * 24 * 7 * 1000;

    db.prepare(`
      INSERT INTO sessions (access_token, refresh_token, user_id, expires_at)
      VALUES (?, ?, ?, ?)
    `).run(accessToken, refreshToken, row.id, expiresAt);

    return {
      user: {
        id: row.id,
        email: row.email,
        user_metadata: {
          full_name: row.full_name,
          avatar_url: row.avatar_url,
        },
        created_at: row.created_at,
      },
      session: {
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_in: 3600 * 24 * 7,
      },
    };
  },

  refreshSession(refreshToken: string) {
    const sess = db
      .prepare("SELECT * FROM sessions WHERE refresh_token = ?")
      .get(refreshToken) as { user_id: string; expires_at: number } | undefined;

    if (!sess) {
      throw ApiError.unauthorized("Invalid refresh token");
    }

    if (Date.now() > sess.expires_at) {
      db.prepare("DELETE FROM sessions WHERE refresh_token = ?").run(refreshToken);
      throw ApiError.unauthorized("Session expired");
    }

    const user = db
      .prepare("SELECT * FROM users WHERE id = ?")
      .get(sess.user_id) as {
      id: string;
      email: string;
      full_name: string | null;
      avatar_url: string | null;
      created_at: string;
    };

    const newAccessToken = `sf_at_${crypto.randomBytes(32).toString("hex")}`;
    const newRefreshToken = `sf_rt_${crypto.randomBytes(32).toString("hex")}`;
    const expiresAt = Date.now() + 3600 * 24 * 7 * 1000;

    db.prepare("DELETE FROM sessions WHERE refresh_token = ?").run(refreshToken);
    db.prepare(`
      INSERT INTO sessions (access_token, refresh_token, user_id, expires_at)
      VALUES (?, ?, ?, ?)
    `).run(newAccessToken, newRefreshToken, user.id, expiresAt);

    return {
      user: {
        id: user.id,
        email: user.email,
        user_metadata: {
          full_name: user.full_name,
          avatar_url: user.avatar_url,
        },
        created_at: user.created_at,
      },
      session: {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
        expires_in: 3600 * 24 * 7,
      },
    };
  },

  getUserFromToken(accessToken: string) {
    const sess = db
      .prepare("SELECT user_id, expires_at FROM sessions WHERE access_token = ?")
      .get(accessToken) as { user_id: string; expires_at: number } | undefined;

    if (!sess || Date.now() > sess.expires_at) {
      return null;
    }

    const row = db
      .prepare("SELECT * FROM users WHERE id = ?")
      .get(sess.user_id) as
      | {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
        }
      | undefined;

    if (!row) return null;

    return {
      id: row.id,
      email: row.email,
      user_metadata: {
        full_name: row.full_name,
        avatar_url: row.avatar_url,
      },
      created_at: row.created_at,
    };
  },

  deleteSession(accessToken: string) {
    db.prepare("DELETE FROM sessions WHERE access_token = ?").run(accessToken);
  },

  updateUserPassword(userId: string, newPassword: string) {
    const salt = crypto.randomBytes(16).toString("hex");
    const passwordHash = hashPassword(newPassword, salt);
    db.prepare(
      "UPDATE users SET password_hash = ?, salt = ?, updated_at = ? WHERE id = ?"
    ).run(passwordHash, salt, new Date().toISOString(), userId);
  },

  // --- Subjects (Strictly Scoped to userId) ---
  listSubjects(userId: string) {
    return db
      .prepare("SELECT * FROM subjects WHERE user_id = ? ORDER BY created_at ASC")
      .all(userId);
  },

  getSubject(id: string, userId: string) {
    return db
      .prepare("SELECT * FROM subjects WHERE id = ? AND user_id = ?")
      .get(id, userId);
  },

  createSubject(
    userId: string,
    data: {
      code?: string | null;
      name: string;
      instructor?: string | null;
      credits?: number | null;
      color?: string;
    }
  ) {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO subjects (id, user_id, code, name, instructor, credits, color, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      userId,
      data.code ?? null,
      data.name,
      data.instructor ?? null,
      data.credits ?? null,
      data.color ?? "#2563EB",
      now,
      now
    );

    return db.prepare("SELECT * FROM subjects WHERE id = ?").get(id);
  },

  updateSubject(
    id: string,
    userId: string,
    updates: Record<string, unknown>
  ) {
    const existing = db
      .prepare("SELECT id FROM subjects WHERE id = ? AND user_id = ?")
      .get(id, userId);
    if (!existing) return null;

    const allowed = ["code", "name", "instructor", "credits", "color"];
    const setClauses: string[] = [];
    const values: unknown[] = [];

    for (const key of allowed) {
      if (key in updates) {
        setClauses.push(`${key} = ?`);
        values.push(updates[key] ?? null);
      }
    }

    if (setClauses.length === 0) return this.getSubject(id, userId);

    setClauses.push("updated_at = ?");
    values.push(new Date().toISOString());
    values.push(id);
    values.push(userId);

    db.prepare(`
      UPDATE subjects
      SET ${setClauses.join(", ")}
      WHERE id = ? AND user_id = ?
    `).run(...values);

    return this.getSubject(id, userId);
  },

  deleteSubject(id: string, userId: string) {
    const existing = db
      .prepare("SELECT id FROM subjects WHERE id = ? AND user_id = ?")
      .get(id, userId);
    if (!existing) return false;

    db.prepare("UPDATE tasks SET subject_id = NULL WHERE subject_id = ? AND user_id = ?").run(id, userId);
    db.prepare("DELETE FROM subjects WHERE id = ? AND user_id = ?").run(id, userId);
    return true;
  },

  // --- Tasks (Strictly Scoped to userId with Subjects Joined) ---
  listTasks(
    userId: string,
    params: {
      subjectId?: string;
      priority?: string;
      completed?: boolean;
      dueBefore?: string;
      dueAfter?: string;
      search?: string;
      sortBy?: string;
      sortDir?: string;
      limit?: number;
      offset?: number;
    }
  ) {
    let sql = `
      SELECT
        t.*,
        s.id as s_id,
        s.name as s_name,
        s.code as s_code,
        s.color as s_color
      FROM tasks t
      LEFT JOIN subjects s ON t.subject_id = s.id
      WHERE t.user_id = ?
    `;
    const values: unknown[] = [userId];

    if (params.subjectId) {
      sql += " AND t.subject_id = ?";
      values.push(params.subjectId);
    }
    if (params.priority) {
      sql += " AND t.priority = ?";
      values.push(params.priority);
    }
    if (params.completed !== undefined) {
      sql += " AND t.is_completed = ?";
      values.push(params.completed ? 1 : 0);
    }
    if (params.dueBefore) {
      sql += " AND t.due_date <= ?";
      values.push(params.dueBefore);
    }
    if (params.dueAfter) {
      sql += " AND t.due_date >= ?";
      values.push(params.dueAfter);
    }
    if (params.search) {
      sql += " AND t.title LIKE ?";
      values.push(`%${params.search}%`);
    }

    const sortCol = ["due_date", "priority", "created_at", "title"].includes(params.sortBy || "")
      ? params.sortBy
      : "created_at";
    const sortOrder = params.sortDir === "asc" ? "ASC" : "DESC";

    sql += ` ORDER BY t.${sortCol} ${sortOrder}`;

    const limit = params.limit ?? 50;
    const offset = params.offset ?? 0;
    sql += ` LIMIT ? OFFSET ?`;
    values.push(limit, offset);

    const rows = db.prepare(sql).all(...values) as Array<Record<string, unknown>>;

    const tasks = rows.map((r) => {
      const { s_id, s_name, s_code, s_color, ...taskData } = r;
      return {
        ...taskData,
        reminder_enabled: Boolean(taskData.reminder_enabled),
        is_completed: Boolean(taskData.is_completed),
        subjects: s_id
          ? {
              id: s_id,
              name: s_name,
              code: s_code,
              color: s_color,
            }
          : null,
      };
    });

    const totalCountRow = db
      .prepare("SELECT COUNT(*) as count FROM tasks WHERE user_id = ?")
      .get(userId) as { count: number };

    return {
      tasks,
      total: totalCountRow.count,
      limit,
      offset,
    };
  },

  getTask(id: string, userId: string) {
    const row = db
      .prepare(`
        SELECT
          t.*,
          s.id as s_id,
          s.name as s_name,
          s.code as s_code,
          s.color as s_color
        FROM tasks t
        LEFT JOIN subjects s ON t.subject_id = s.id
        WHERE t.id = ? AND t.user_id = ?
      `)
      .get(id, userId) as Record<string, unknown> | undefined;

    if (!row) return null;

    const { s_id, s_name, s_code, s_color, ...taskData } = row;
    return {
      ...taskData,
      reminder_enabled: Boolean(taskData.reminder_enabled),
      is_completed: Boolean(taskData.is_completed),
      subjects: s_id
        ? {
            id: s_id,
            name: s_name,
            code: s_code,
            color: s_color,
          }
        : null,
    };
  },

  createTask(
    userId: string,
    data: {
      subjectId?: string | null;
      title: string;
      notes?: string | null;
      priority?: string;
      dueDate?: string | null;
      dueTime?: string | null;
      durationMinutes?: number | null;
      reminderEnabled?: boolean;
    }
  ) {
    if (data.subjectId) {
      const sub = db
        .prepare("SELECT id FROM subjects WHERE id = ? AND user_id = ?")
        .get(data.subjectId, userId);
      if (!sub) {
        throw ApiError.badRequest("Subject does not belong to this user");
      }
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO tasks (
        id, user_id, subject_id, title, notes, priority, due_date, due_time,
        duration_minutes, reminder_enabled, is_completed, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
    `).run(
      id,
      userId,
      data.subjectId ?? null,
      data.title,
      data.notes ?? null,
      data.priority ?? "medium",
      data.dueDate ?? null,
      data.dueTime ?? null,
      data.durationMinutes ?? null,
      data.reminderEnabled ? 1 : 0,
      now,
      now
    );

    return this.getTask(id, userId);
  },

  updateTask(
    id: string,
    userId: string,
    updates: Record<string, unknown>
  ) {
    const existing = db
      .prepare("SELECT id FROM tasks WHERE id = ? AND user_id = ?")
      .get(id, userId);
    if (!existing) return null;

    const keyMap: Record<string, string> = {
      subjectId: "subject_id",
      title: "title",
      notes: "notes",
      priority: "priority",
      dueDate: "due_date",
      dueTime: "due_time",
      durationMinutes: "duration_minutes",
      reminderEnabled: "reminder_enabled",
    };

    const setClauses: string[] = [];
    const values: unknown[] = [];

    for (const [bodyKey, col] of Object.entries(keyMap)) {
      if (bodyKey in updates) {
        setClauses.push(`${col} = ?`);
        let val = updates[bodyKey];
        if (bodyKey === "reminderEnabled") val = val ? 1 : 0;
        values.push(val ?? null);
      }
    }

    if (setClauses.length === 0) return this.getTask(id, userId);

    setClauses.push("updated_at = ?");
    values.push(new Date().toISOString());
    values.push(id);
    values.push(userId);

    db.prepare(`
      UPDATE tasks
      SET ${setClauses.join(", ")}
      WHERE id = ? AND user_id = ?
    `).run(...values);

    return this.getTask(id, userId);
  },

  setTaskCompletion(id: string, userId: string, isCompleted: boolean) {
    const existing = db
      .prepare("SELECT is_completed FROM tasks WHERE id = ? AND user_id = ?")
      .get(id, userId) as { is_completed: number } | undefined;

    if (!existing) return null;

    const completedAt = isCompleted ? new Date().toISOString() : null;
    const now = new Date().toISOString();

    db.prepare(`
      UPDATE tasks
      SET is_completed = ?, completed_at = ?, updated_at = ?
      WHERE id = ? AND user_id = ?
    `).run(isCompleted ? 1 : 0, completedAt, now, id, userId);

    return this.getTask(id, userId);
  },

  deleteTask(id: string, userId: string) {
    const existing = db
      .prepare("SELECT id FROM tasks WHERE id = ? AND user_id = ?")
      .get(id, userId);
    if (!existing) return false;

    db.prepare("DELETE FROM tasks WHERE id = ? AND user_id = ?").run(id, userId);
    return true;
  },

  // --- Dashboard Aggregates (Strictly Isolated to userId) ---
  getDashboardStats(userId: string) {
    const today = new Date().toISOString().slice(0, 10);
    const weekOut = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);

    const row = db
      .prepare(`
        SELECT
          COUNT(CASE WHEN is_completed = 1 THEN 1 END) as completed_count,
          COUNT(CASE WHEN is_completed = 0 THEN 1 END) as pending_count,
          COUNT(CASE WHEN is_completed = 0 AND due_date = ? THEN 1 END) as due_today_count,
          COUNT(CASE WHEN is_completed = 0 AND due_date < ? THEN 1 END) as overdue_count,
          COUNT(CASE WHEN is_completed = 0 AND due_date >= ? AND due_date < ? THEN 1 END) as due_this_week_count,
          COUNT(CASE WHEN is_completed = 0 AND priority = 'high' THEN 1 END) as high_priority_open_count,
          COUNT(CASE WHEN is_completed = 1 AND completed_at >= datetime('now', '-7 days') THEN 1 END) as completed_this_week_count
        FROM tasks
        WHERE user_id = ?
      `)
      .get(today, today, today, weekOut, userId) as Record<string, number>;

    return {
      user_id: userId,
      completed_count: row?.completed_count || 0,
      pending_count: row?.pending_count || 0,
      due_today_count: row?.due_today_count || 0,
      overdue_count: row?.overdue_count || 0,
      due_this_week_count: row?.due_this_week_count || 0,
      high_priority_open_count: row?.high_priority_open_count || 0,
      completed_this_week_count: row?.completed_this_week_count || 0,
    };
  },

  getSubjectProgress(userId: string) {
    const rows = db
      .prepare(`
        SELECT
          s.id as subject_id,
          s.user_id,
          s.name,
          s.code,
          s.color,
          COUNT(t.id) as total_tasks,
          COUNT(CASE WHEN t.is_completed = 1 THEN 1 END) as completed_tasks
        FROM subjects s
        LEFT JOIN tasks t ON t.subject_id = s.id AND t.user_id = s.user_id
        WHERE s.user_id = ?
        GROUP BY s.id, s.user_id, s.name, s.code, s.color
        ORDER BY s.name ASC
      `)
      .all(userId) as Array<{
      subject_id: string;
      user_id: string;
      name: string;
      code: string | null;
      color: string;
      total_tasks: number;
      completed_tasks: number;
    }>;

    return rows.map((r) => ({
      ...r,
      completion_percent:
        r.total_tasks === 0
          ? 0
          : Math.round((r.completed_tasks / r.total_tasks) * 1000) / 10,
    }));
  },

  getUpcoming(userId: string) {
    const today = new Date().toISOString().slice(0, 10);
    const weekOut = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);

    const rows = db
      .prepare(`
        SELECT
          t.*,
          s.id as s_id,
          s.name as s_name,
          s.code as s_code,
          s.color as s_color
        FROM tasks t
        LEFT JOIN subjects s ON t.subject_id = s.id
        WHERE t.user_id = ?
          AND t.is_completed = 0
          AND t.due_date >= ?
          AND t.due_date <= ?
        ORDER BY t.due_date ASC, t.due_time ASC
      `)
      .all(userId, today, weekOut) as Array<Record<string, unknown>>;

    return rows.map((r) => {
      const { s_id, s_name, s_code, s_color, ...taskData } = r;
      return {
        ...taskData,
        reminder_enabled: Boolean(taskData.reminder_enabled),
        is_completed: false,
        subjects: s_id
          ? {
              id: s_id,
              name: s_name,
              code: s_code,
              color: s_color,
            }
          : null,
      };
    });
  },

  getOverdue(userId: string) {
    const today = new Date().toISOString().slice(0, 10);

    const rows = db
      .prepare(`
        SELECT
          t.*,
          s.id as s_id,
          s.name as s_name,
          s.code as s_code,
          s.color as s_color
        FROM tasks t
        LEFT JOIN subjects s ON t.subject_id = s.id
        WHERE t.user_id = ?
          AND t.is_completed = 0
          AND t.due_date < ?
        ORDER BY t.due_date ASC
      `)
      .all(userId, today) as Array<Record<string, unknown>>;

    return rows.map((r) => {
      const { s_id, s_name, s_code, s_color, ...taskData } = r;
      return {
        ...taskData,
        reminder_enabled: Boolean(taskData.reminder_enabled),
        is_completed: false,
        subjects: s_id
          ? {
              id: s_id,
              name: s_name,
              code: s_code,
              color: s_color,
            }
          : null,
      };
    });
  },
};
