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
  currentAuthorityLevel: text("current_authority_level").notNull().default("panchayat"),
  escalationCount: integer("escalation_count").notNull().default(0),
  escalationReason: text("escalation_reason"),
  escalationDueDate: timestamp("escalation_due_date"),
  canResolve: boolean("can_resolve"),
  userSatisfaction: text("user_satisfaction"),
  userSatisfactionAt: timestamp("user_satisfaction_at"),
  communityVerifyCount: integer("community_verify_count").notNull().default(0),
  communityDisputeCount: integer("community_dispute_count").notNull().default(0),
  autoCloseAt: timestamp("auto_close_at"),
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

export const escalationHistory = pgTable("escalation_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  grievanceId: varchar("grievance_id").references(() => grievances.id).notNull(),
  fromLevel: text("from_level").notNull(),
  toLevel: text("to_level").notNull(),
  reason: text("reason").notNull(),
  escalatedBy: varchar("escalated_by").references(() => users.id),
  autoEscalated: boolean("auto_escalated").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
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
  escalationHistory: many(escalationHistory),
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

export const escalationHistoryRelations = relations(escalationHistory, ({ one }) => ({
  grievance: one(grievances, {
    fields: [escalationHistory.grievanceId],
    references: [grievances.id],
  }),
  escalatedByUser: one(users, {
    fields: [escalationHistory.escalatedBy],
    references: [users.id],
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
  currentAuthorityLevel: true,
  escalationCount: true,
  escalationReason: true,
  escalationDueDate: true,
  canResolve: true,
  userSatisfaction: true,
  userSatisfactionAt: true,
  communityVerifyCount: true,
  communityDisputeCount: true,
  autoCloseAt: true,
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

export const insertEscalationHistorySchema = createInsertSchema(escalationHistory).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertGrievance = z.infer<typeof insertGrievanceSchema>;
export type Grievance = typeof grievances.$inferSelect;
export type InsertVerification = z.infer<typeof insertVerificationSchema>;
export type Verification = typeof verifications.$inferSelect;
export type InsertBlockchainRecord = z.infer<typeof insertBlockchainRecordSchema>;
export type BlockchainRecord = typeof blockchainRecords.$inferSelect;
export type InsertEscalationHistory = z.infer<typeof insertEscalationHistorySchema>;
export type EscalationHistory = typeof escalationHistory.$inferSelect;
