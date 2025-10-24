import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull().default("citizen"),
  mobileNumber: text("mobile_number").notNull(),
  email: text("email"),
  villageName: text("village_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const grievances = pgTable("grievances", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  grievanceNumber: text("grievance_number").notNull().unique(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  villageName: text("village_name").notNull(),
  status: text("status").notNull().default("pending"),
  priority: text("priority").notNull().default("medium"),
  evidenceFiles: text("evidence_files").array(),
  voiceRecordingUrl: text("voice_recording_url"),
  voiceTranscription: text("voice_transcription"),
  assignedTo: varchar("assigned_to").references(() => users.id),
  resolutionTimeline: integer("resolution_timeline"),
  dueDate: timestamp("due_date"),
  resolvedAt: timestamp("resolved_at"),
  resolutionNotes: text("resolution_notes"),
  resolutionEvidence: text("resolution_evidence").array(),
  verificationDeadline: timestamp("verification_deadline"),
  isEscalated: boolean("is_escalated").default(false),
  escalatedAt: timestamp("escalated_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const verifications = pgTable("verifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  grievanceId: varchar("grievance_id").references(() => grievances.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  verificationType: text("verification_type").notNull(),
  status: text("status").notNull(),
  comments: text("comments"),
  evidenceFiles: text("evidence_files").array(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const blockchainRecords = pgTable("blockchain_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  grievanceId: varchar("grievance_id").references(() => grievances.id).notNull(),
  transactionHash: text("transaction_hash").notNull().unique(),
  blockNumber: text("block_number"),
  eventType: text("event_type").notNull(),
  eventData: text("event_data").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  grievances: many(grievances),
  verifications: many(verifications),
}));

export const grievancesRelations = relations(grievances, ({ one, many }) => ({
  user: one(users, {
    fields: [grievances.userId],
    references: [users.id],
  }),
  assignedOfficer: one(users, {
    fields: [grievances.assignedTo],
    references: [users.id],
  }),
  verifications: many(verifications),
  blockchainRecords: many(blockchainRecords),
}));

export const verificationsRelations = relations(verifications, ({ one }) => ({
  grievance: one(grievances, {
    fields: [verifications.grievanceId],
    references: [grievances.id],
  }),
  user: one(users, {
    fields: [verifications.userId],
    references: [users.id],
  }),
}));

export const blockchainRecordsRelations = relations(blockchainRecords, ({ one }) => ({
  grievance: one(grievances, {
    fields: [blockchainRecords.grievanceId],
    references: [grievances.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertGrievanceSchema = createInsertSchema(grievances).omit({
  id: true,
  grievanceNumber: true,
  status: true,
  isEscalated: true,
  escalatedAt: true,
  createdAt: true,
  updatedAt: true,
  userId: true,
  assignedTo: true,
  resolvedAt: true,
  verificationDeadline: true,
}).extend({
  title: z.string().min(10, "Title must be at least 10 characters"),
  description: z.string().min(50, "Description must be at least 50 characters"),
  category: z.enum([
    "Water Supply",
    "Road & Infrastructure",
    "Electricity",
    "Sanitation & Waste Management",
    "Healthcare",
    "Education",
    "Agriculture Support",
    "Social Welfare Schemes",
    "Other"
  ]),
});

export const insertVerificationSchema = createInsertSchema(verifications).omit({
  id: true,
  createdAt: true,
  userId: true,
}).extend({
  verificationType: z.enum(["verify", "dispute"]),
  status: z.enum(["verified", "disputed"]),
});

export const insertBlockchainRecordSchema = createInsertSchema(blockchainRecords).omit({
  id: true,
  timestamp: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertGrievance = z.infer<typeof insertGrievanceSchema>;
export type Grievance = typeof grievances.$inferSelect;
export type InsertVerification = z.infer<typeof insertVerificationSchema>;
export type Verification = typeof verifications.$inferSelect;
export type InsertBlockchainRecord = z.infer<typeof insertBlockchainRecordSchema>;
export type BlockchainRecord = typeof blockchainRecords.$inferSelect;
