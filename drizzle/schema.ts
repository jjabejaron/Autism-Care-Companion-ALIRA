import {
  boolean,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  date,
  bigint,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  // Extended profile fields
  fullName: varchar("fullName", { length: 256 }),
  birthdate: date("birthdate"),
  address: text("address"),
  phone: varchar("phone", { length: 32 }),
  passwordHash: varchar("passwordHash", { length: 256 }),
  language: mysqlEnum("language", ["en", "fil"]).default("en").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const children = mysqlTable("children", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 256 }).notNull(),
  age: int("age").notNull(),
  birthdate: date("birthdate").notNull(),
  gender: mysqlEnum("gender", ["male", "female", "other"]).notNull(),
  isClinicallyDiagnosed: boolean("isClinicallyDiagnosed").default(false).notNull(),
  diagnosisDetails: text("diagnosisDetails"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Child = typeof children.$inferSelect;
export type InsertChild = typeof children.$inferInsert;

export const modules = mysqlTable("modules", {
  id: int("id").autoincrement().primaryKey(),
  ageGroup: mysqlEnum("ageGroup", ["toddler", "early_childhood"]).notNull(),
  skillCategory: mysqlEnum("skillCategory", ["cognitive", "social", "integrative"]).notNull(),
  moduleNumber: int("moduleNumber").notNull(),
  title: varchar("title", { length: 256 }).notNull(),
  subtitle: varchar("subtitle", { length: 512 }),
  description: text("description"),
  content: text("content").notNull(),
  weeklyTip: text("weeklyTip"),
  theoreticalFoundations: text("theoreticalFoundations"),
  frequency: varchar("frequency", { length: 256 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Module = typeof modules.$inferSelect;
export type InsertModule = typeof modules.$inferInsert;

export const activityScores = mysqlTable("activity_scores", {
  id: int("id").autoincrement().primaryKey(),
  childId: int("childId").notNull(),
  userId: int("userId").notNull(),
  moduleId: int("moduleId").notNull(),
  score: int("score").notNull(), // 0-100
  notes: text("notes"),
  completedAt: timestamp("completedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ActivityScore = typeof activityScores.$inferSelect;
export type InsertActivityScore = typeof activityScores.$inferInsert;

export const appointments = mysqlTable("appointments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  childId: int("childId").notNull(),
  clinicName: varchar("clinicName", { length: 512 }).notNull(),
  clinicAddress: text("clinicAddress"),
  appointmentDate: date("appointmentDate").notNull(),
  preferredTime: varchar("preferredTime", { length: 64 }).notNull(),
  guardianName: varchar("guardianName", { length: 256 }).notNull(),
  guardianPhone: varchar("guardianPhone", { length: 32 }).notNull(),
  status: mysqlEnum("status", ["pending", "confirmed", "cancelled", "completed"]).default("pending").notNull(),
  notes: text("notes"),
  reminderSent: boolean("reminderSent").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = typeof appointments.$inferInsert;

export const chatMessages = mysqlTable("chat_messages", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  role: mysqlEnum("role", ["user", "assistant"]).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;

export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 256 }).notNull(),
  message: text("message").notNull(),
  type: mysqlEnum("type", ["appointment_booked", "appointment_upcoming", "appointment_followup", "general"]).default("general").notNull(),
  isRead: boolean("isRead").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;
