import {
  users,
  grievances,
  verifications,
  blockchainRecords,
  escalationHistory,
  type User,
  type InsertUser,
  type Grievance,
  type InsertGrievance,
  type Verification,
  type InsertVerification,
  type BlockchainRecord,
  type InsertBlockchainRecord,
  type EscalationHistory,
  type InsertEscalationHistory,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, or, lt, gt, isNull } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getAllGrievances(): Promise<Grievance[]>;
  getGrievance(id: string): Promise<Grievance | undefined>;
  getGrievancesByUser(userId: string): Promise<Grievance[]>;
  getAssignedGrievances(officerId: string): Promise<Grievance[]>;
  createGrievance(grievance: Omit<InsertGrievance, 'userId'>, userId: string, fullName: string, mobileNumber: string): Promise<Grievance>;
  updateGrievanceStatus(id: string, status: string, updates?: Partial<Grievance>): Promise<Grievance | undefined>;
  acceptGrievance(id: string, officerId: string, resolutionTimeline: number): Promise<Grievance | undefined>;
  
  createVerification(verification: InsertVerification, userId: string): Promise<Verification>;
  getVerificationsByGrievance(grievanceId: string): Promise<Verification[]>;
  
  createBlockchainRecord(record: InsertBlockchainRecord): Promise<BlockchainRecord>;
  getBlockchainRecordsByGrievance(grievanceId: string): Promise<BlockchainRecord[]>;
  
  // Community Verification & User Satisfaction
  submitUserSatisfaction(grievanceId: string, satisfaction: "satisfied" | "not_satisfied"): Promise<Grievance | undefined>;
  submitCommunityVote(grievanceId: string, voteType: "verify" | "dispute", userId: string, comments?: string): Promise<Grievance | undefined>;
  getPendingVerificationGrievances(): Promise<Grievance[]>;
  
  // Escalation Management
  escalateGrievance(grievanceId: string, reason: string, officerId?: string): Promise<Grievance | undefined>;
  createEscalationHistory(history: InsertEscalationHistory): Promise<EscalationHistory>;
  getEscalationHistory(grievanceId: string): Promise<EscalationHistory[]>;
  cannotResolve(grievanceId: string, reason: string, officerId: string): Promise<Grievance | undefined>;
  
  // Admin Panel
  getDisputedGrievances(): Promise<Grievance[]>;
  getOverdueGrievances(): Promise<Grievance[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getAllGrievances(): Promise<Grievance[]> {
    return await db.select().from(grievances).orderBy(desc(grievances.createdAt));
  }

  async getGrievance(id: string): Promise<Grievance | undefined> {
    const [grievance] = await db.select().from(grievances).where(eq(grievances.id, id));
    return grievance || undefined;
  }

  async getGrievancesByUser(userId: string): Promise<Grievance[]> {
    return await db
      .select()
      .from(grievances)
      .where(eq(grievances.userId, userId))
      .orderBy(desc(grievances.createdAt));
  }

  async getAssignedGrievances(officerId: string): Promise<Grievance[]> {
    return await db
      .select()
      .from(grievances)
      .where(eq(grievances.assignedTo, officerId))
      .orderBy(desc(grievances.createdAt));
  }

  async createGrievance(
    grievance: Omit<InsertGrievance, 'userId'>,
    userId: string,
    fullName: string,
    mobileNumber: string
  ): Promise<Grievance> {
    let user = await this.getUserByUsername(mobileNumber);
    
    if (!user) {
      user = await this.createUser({
        username: mobileNumber,
        password: "temp",
        fullName,
        mobileNumber,
        email: null,
        villageName: grievance.villageName,
        role: "citizen",
      });
    }

    const grievanceNumber = `GR${new Date().getFullYear()}${String(Math.floor(Math.random() * 100000)).padStart(5, '0')}`;

    const [newGrievance] = await db
      .insert(grievances)
      .values({
        ...grievance,
        userId: user.id,
        grievanceNumber,
        status: "pending",
        priority: "medium",
      })
      .returning();

    const transactionHash = `0x${Math.random().toString(16).substring(2, 66)}`;
    await this.createBlockchainRecord({
      grievanceId: newGrievance.id,
      transactionHash,
      blockNumber: String(Math.floor(Math.random() * 1000000)),
      eventType: "GRIEVANCE_SUBMITTED",
      eventData: JSON.stringify({
        grievanceNumber: newGrievance.grievanceNumber,
        category: newGrievance.category,
        timestamp: new Date().toISOString(),
      }),
    });

    return newGrievance;
  }

  async updateGrievanceStatus(
    id: string,
    status: string,
    updates?: Partial<Grievance>
  ): Promise<Grievance | undefined> {
    const [updated] = await db
      .update(grievances)
      .set({
        status,
        updatedAt: new Date(),
        ...updates,
      })
      .where(eq(grievances.id, id))
      .returning();

    if (updated) {
      const transactionHash = `0x${Math.random().toString(16).substring(2, 66)}`;
      await this.createBlockchainRecord({
        grievanceId: updated.id,
        transactionHash,
        blockNumber: String(Math.floor(Math.random() * 1000000)),
        eventType: "STATUS_UPDATED",
        eventData: JSON.stringify({
          grievanceNumber: updated.grievanceNumber,
          newStatus: status,
          timestamp: new Date().toISOString(),
        }),
      });
    }

    return updated || undefined;
  }

  async acceptGrievance(
    id: string,
    officerId: string,
    resolutionTimeline: number
  ): Promise<Grievance | undefined> {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + resolutionTimeline);

    const [updated] = await db
      .update(grievances)
      .set({
        status: "in_progress",
        assignedTo: officerId,
        resolutionTimeline,
        dueDate,
        updatedAt: new Date(),
      })
      .where(eq(grievances.id, id))
      .returning();

    if (updated) {
      const transactionHash = `0x${Math.random().toString(16).substring(2, 66)}`;
      await this.createBlockchainRecord({
        grievanceId: updated.id,
        transactionHash,
        blockNumber: String(Math.floor(Math.random() * 1000000)),
        eventType: "TASK_ACCEPTED",
        eventData: JSON.stringify({
          grievanceNumber: updated.grievanceNumber,
          officerId,
          resolutionTimeline,
          dueDate: dueDate.toISOString(),
          timestamp: new Date().toISOString(),
        }),
      });
    }

    return updated || undefined;
  }

  async createVerification(verification: InsertVerification, userId: string): Promise<Verification> {
    const [newVerification] = await db
      .insert(verifications)
      .values({
        ...verification,
        userId,
      })
      .returning();

    const grievance = await this.getGrievance(verification.grievanceId);
    if (grievance) {
      const transactionHash = `0x${Math.random().toString(16).substring(2, 66)}`;
      await this.createBlockchainRecord({
        grievanceId: grievance.id,
        transactionHash,
        blockNumber: String(Math.floor(Math.random() * 1000000)),
        eventType: "COMMUNITY_VERIFICATION",
        eventData: JSON.stringify({
          grievanceNumber: grievance.grievanceNumber,
          verificationType: verification.verificationType,
          status: verification.status,
          timestamp: new Date().toISOString(),
        }),
      });
    }

    return newVerification;
  }

  async getVerificationsByGrievance(grievanceId: string): Promise<Verification[]> {
    return await db
      .select()
      .from(verifications)
      .where(eq(verifications.grievanceId, grievanceId))
      .orderBy(desc(verifications.createdAt));
  }

  async createBlockchainRecord(record: InsertBlockchainRecord): Promise<BlockchainRecord> {
    const [newRecord] = await db
      .insert(blockchainRecords)
      .values(record)
      .returning();

    return newRecord;
  }

  async getBlockchainRecordsByGrievance(grievanceId: string): Promise<BlockchainRecord[]> {
    return await db
      .select()
      .from(blockchainRecords)
      .where(eq(blockchainRecords.grievanceId, grievanceId))
      .orderBy(desc(blockchainRecords.timestamp));
  }

  // Community Verification & User Satisfaction
  async submitUserSatisfaction(
    grievanceId: string,
    satisfaction: "satisfied" | "not_satisfied"
  ): Promise<Grievance | undefined> {
    const [updated] = await db
      .update(grievances)
      .set({
        userSatisfaction: satisfaction,
        userSatisfactionAt: new Date(),
        status: satisfaction === "satisfied" ? "resolved" : "in_progress",
        updatedAt: new Date(),
      })
      .where(eq(grievances.id, grievanceId))
      .returning();

    if (updated) {
      const transactionHash = `0x${Math.random().toString(16).substring(2, 66)}`;
      await this.createBlockchainRecord({
        grievanceId: updated.id,
        transactionHash,
        blockNumber: String(Math.floor(Math.random() * 1000000)),
        eventType: "USER_SATISFACTION",
        eventData: JSON.stringify({
          grievanceNumber: updated.grievanceNumber,
          satisfaction,
          timestamp: new Date().toISOString(),
        }),
      });
    }

    return updated || undefined;
  }

  async submitCommunityVote(
    grievanceId: string,
    voteType: "verify" | "dispute",
    userId: string,
    comments?: string
  ): Promise<Grievance | undefined> {
    const grievance = await this.getGrievance(grievanceId);
    if (!grievance) return undefined;

    if (grievance.userSatisfaction) {
      return grievance;
    }

    const verifyCount = voteType === "verify" ? grievance.communityVerifyCount + 1 : grievance.communityVerifyCount;
    const disputeCount = voteType === "dispute" ? grievance.communityDisputeCount + 1 : grievance.communityDisputeCount;

    let newStatus = grievance.status;
    if (voteType === "dispute") {
      newStatus = "in_progress";
    } else if (verifyCount >= 3) {
      newStatus = "resolved";
    }

    const [updated] = await db
      .update(grievances)
      .set({
        communityVerifyCount: verifyCount,
        communityDisputeCount: disputeCount,
        status: newStatus,
        updatedAt: new Date(),
      })
      .where(eq(grievances.id, grievanceId))
      .returning();

    await this.createVerification(
      {
        grievanceId,
        verificationType: voteType,
        status: voteType === "verify" ? "verified" : "disputed",
        comments: comments || null,
        evidenceFiles: [],
      },
      userId
    );

    return updated || undefined;
  }

  async getPendingVerificationGrievances(): Promise<Grievance[]> {
    return await db
      .select()
      .from(grievances)
      .where(eq(grievances.status, "pending_verification"))
      .orderBy(desc(grievances.resolvedAt));
  }

  // Escalation Management
  async escalateGrievance(
    grievanceId: string,
    reason: string,
    officerId?: string
  ): Promise<Grievance | undefined> {
    const grievance = await this.getGrievance(grievanceId);
    if (!grievance) return undefined;

    const authorityLevels = ["panchayat", "block", "district", "state"];
    const currentIndex = authorityLevels.indexOf(grievance.currentAuthorityLevel);
    const nextLevel = authorityLevels[Math.min(currentIndex + 1, authorityLevels.length - 1)];

    const escalationDueDate = new Date();
    escalationDueDate.setDate(escalationDueDate.getDate() + 10);

    const [updated] = await db
      .update(grievances)
      .set({
        currentAuthorityLevel: nextLevel,
        escalationCount: grievance.escalationCount + 1,
        escalationReason: reason,
        escalationDueDate,
        isEscalated: true,
        escalatedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(grievances.id, grievanceId))
      .returning();

    if (updated) {
      await this.createEscalationHistory({
        grievanceId,
        fromLevel: grievance.currentAuthorityLevel,
        toLevel: nextLevel,
        reason,
        escalatedBy: officerId || null,
        autoEscalated: !officerId,
      });

      const transactionHash = `0x${Math.random().toString(16).substring(2, 66)}`;
      await this.createBlockchainRecord({
        grievanceId: updated.id,
        transactionHash,
        blockNumber: String(Math.floor(Math.random() * 1000000)),
        eventType: "GRIEVANCE_ESCALATED",
        eventData: JSON.stringify({
          grievanceNumber: updated.grievanceNumber,
          fromLevel: grievance.currentAuthorityLevel,
          toLevel: nextLevel,
          reason,
          autoEscalated: !officerId,
          timestamp: new Date().toISOString(),
        }),
      });
    }

    return updated || undefined;
  }

  async createEscalationHistory(history: InsertEscalationHistory): Promise<EscalationHistory> {
    const [newHistory] = await db
      .insert(escalationHistory)
      .values(history)
      .returning();

    return newHistory;
  }

  async getEscalationHistory(grievanceId: string): Promise<EscalationHistory[]> {
    return await db
      .select()
      .from(escalationHistory)
      .where(eq(escalationHistory.grievanceId, grievanceId))
      .orderBy(desc(escalationHistory.createdAt));
  }

  async cannotResolve(
    grievanceId: string,
    reason: string,
    officerId: string
  ): Promise<Grievance | undefined> {
    const [updated] = await db
      .update(grievances)
      .set({
        canResolve: false,
        escalationReason: reason,
        updatedAt: new Date(),
      })
      .where(eq(grievances.id, grievanceId))
      .returning();

    if (updated) {
      await this.escalateGrievance(grievanceId, reason, officerId);
    }

    return updated || undefined;
  }

  // Admin Panel
  async getDisputedGrievances(): Promise<Grievance[]> {
    return await db
      .select()
      .from(grievances)
      .where(or(
        eq(grievances.userSatisfaction, "not_satisfied"),
        gt(grievances.communityDisputeCount, 0)
      ))
      .orderBy(desc(grievances.updatedAt));
  }

  async getOverdueGrievances(): Promise<Grievance[]> {
    const now = new Date();
    return await db
      .select()
      .from(grievances)
      .where(
        and(
          lt(grievances.dueDate, now),
          or(
            eq(grievances.status, "pending"),
            eq(grievances.status, "in_progress")
          )
        )
      )
      .orderBy(desc(grievances.dueDate));
  }
}

export const storage = new DatabaseStorage();
