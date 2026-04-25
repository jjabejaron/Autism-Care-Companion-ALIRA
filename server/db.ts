import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  ActivityScore,
  Appointment,
  ChatMessage,
  Child,
  InsertActivityScore,
  InsertAppointment,
  InsertChatMessage,
  InsertChild,
  InsertModule,
  InsertNotification,
  InsertUser,
  Module,
  Notification,
  User,
  activityScores,
  appointments,
  chatMessages,
  children,
  modules,
  notifications,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};

  const textFields = ["name", "email", "loginMethod"] as const;
  type TextField = (typeof textFields)[number];
  const assignNullable = (field: TextField) => {
    const value = user[field];
    if (value === undefined) return;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  };
  textFields.forEach(assignNullable);

  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string): Promise<User | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function getUserById(id: number): Promise<User | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0];
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result[0];
}

export async function createLocalUser(data: {
  email: string;
  passwordHash: string;
  fullName: string;
}): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Use email as the openId for local accounts (prefixed to avoid collision)
  const openId = `local:${data.email}`;
  const result = await db.insert(users).values({
    openId,
    email: data.email,
    name: data.fullName,
    fullName: data.fullName,
    passwordHash: data.passwordHash,
    loginMethod: "email",
    lastSignedIn: new Date(),
  });
  return (result[0] as { insertId: number }).insertId;
}

export async function updateUserProfile(
  id: number,
  data: Partial<Pick<User, "fullName" | "email" | "phone" | "address" | "birthdate" | "language" | "passwordHash">>
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set(data).where(eq(users.id, id));
}

export async function getAllUsers(): Promise<User[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(desc(users.createdAt));
}

// ─── Children ─────────────────────────────────────────────────────────────────

export async function getChildrenByUserId(userId: number): Promise<Child[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(children).where(eq(children.userId, userId)).orderBy(children.createdAt);
}

export async function getChildById(id: number): Promise<Child | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(children).where(eq(children.id, id)).limit(1);
  return result[0];
}

export async function createChild(data: InsertChild): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(children).values(data);
  return (result[0] as { insertId: number }).insertId;
}

export async function updateChild(id: number, data: Partial<InsertChild>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(children).set(data).where(eq(children.id, id));
}

export async function deleteChild(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(children).where(eq(children.id, id));
}

export async function getAllChildren(): Promise<Child[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(children).orderBy(desc(children.createdAt));
}

// ─── Modules ──────────────────────────────────────────────────────────────────

export async function getAllModules(): Promise<Module[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(modules).orderBy(modules.ageGroup, modules.skillCategory, modules.moduleNumber);
}

export async function getModuleById(id: number): Promise<Module | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(modules).where(eq(modules.id, id)).limit(1);
  return result[0];
}

export async function seedModules(data: InsertModule[]): Promise<void> {
  const db = await getDb();
  if (!db) return;
  for (const m of data) {
    await db.insert(modules).values(m).onDuplicateKeyUpdate({ set: { title: m.title } });
  }
}

export async function getModuleCount(): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select().from(modules);
  return result.length;
}

// ─── Activity Scores ──────────────────────────────────────────────────────────

export async function getActivityScoresByChild(childId: number): Promise<ActivityScore[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(activityScores)
    .where(eq(activityScores.childId, childId))
    .orderBy(desc(activityScores.completedAt));
}

export async function createActivityScore(data: InsertActivityScore): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(activityScores).values(data);
  return (result[0] as { insertId: number }).insertId;
}

export async function getAllActivityScores(): Promise<ActivityScore[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(activityScores).orderBy(desc(activityScores.completedAt));
}

// ─── Appointments ─────────────────────────────────────────────────────────────

export async function getAppointmentsByUserId(userId: number): Promise<Appointment[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(appointments)
    .where(eq(appointments.userId, userId))
    .orderBy(desc(appointments.createdAt));
}

export async function getAppointmentById(id: number): Promise<Appointment | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(appointments).where(eq(appointments.id, id)).limit(1);
  return result[0];
}

export async function createAppointment(data: InsertAppointment): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(appointments).values(data);
  return (result[0] as { insertId: number }).insertId;
}

export async function updateAppointmentStatus(
  id: number,
  status: "pending" | "confirmed" | "cancelled" | "completed"
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(appointments).set({ status }).where(eq(appointments.id, id));
}

export async function getAllAppointments(): Promise<Appointment[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(appointments).orderBy(desc(appointments.createdAt));
}

// ─── Chat Messages ────────────────────────────────────────────────────────────

export async function getChatHistory(userId: number, limit = 50): Promise<ChatMessage[]> {
  const db = await getDb();
  if (!db) return [];
  const msgs = await db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.userId, userId))
    .orderBy(desc(chatMessages.createdAt))
    .limit(limit);
  return msgs.reverse();
}

export async function saveChatMessage(data: InsertChatMessage): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(chatMessages).values(data);
}

export async function clearChatHistory(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(chatMessages).where(eq(chatMessages.userId, userId));
}

// ─── Notifications ────────────────────────────────────────────────────────────

export async function getNotificationsByUserId(userId: number): Promise<Notification[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt));
}

export async function createNotification(data: InsertNotification): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(notifications).values(data);
}

export async function markNotificationRead(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id));
}

export async function markAllNotificationsRead(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db
    .update(notifications)
    .set({ isRead: true })
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
}
