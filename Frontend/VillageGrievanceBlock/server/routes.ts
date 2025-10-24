import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertGrievanceSchema, insertVerificationSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/grievances", async (req, res) => {
    try {
      const grievances = await storage.getAllGrievances();
      res.json(grievances);
    } catch (error) {
      console.error("Error fetching grievances:", error);
      res.status(500).json({ error: "Failed to fetch grievances" });
    }
  });

  app.get("/api/grievances/assigned", async (req, res) => {
    try {
      const grievances = await storage.getAllGrievances();
      const pendingOrAssigned = grievances.filter(
        g => g.status === "pending" || g.status === "in_progress"
      );
      res.json(pendingOrAssigned);
    } catch (error) {
      console.error("Error fetching assigned grievances:", error);
      res.status(500).json({ error: "Failed to fetch assigned grievances" });
    }
  });

  app.get("/api/grievances/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const grievance = await storage.getGrievance(id);
      
      if (!grievance) {
        return res.status(404).json({ error: "Grievance not found" });
      }
      
      res.json(grievance);
    } catch (error) {
      console.error("Error fetching grievance:", error);
      res.status(500).json({ error: "Failed to fetch grievance" });
    }
  });

  app.post("/api/grievances", async (req, res) => {
    try {
      const { fullName, mobileNumber, email, ...grievanceData } = req.body;
      
      const validatedData = insertGrievanceSchema.parse({
        ...grievanceData,
        email: email || null
      });
      
      if (!fullName || !mobileNumber) {
        return res.status(400).json({ error: "Full name and mobile number are required" });
      }

      const grievance = await storage.createGrievance(
        validatedData,
        "temp-user-id",
        fullName,
        mobileNumber
      );
      
      res.status(201).json(grievance);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Validation failed", 
          details: error.errors 
        });
      }
      console.error("Error creating grievance:", error);
      res.status(500).json({ error: "Failed to create grievance" });
    }
  });

  app.post("/api/grievances/:id/accept", async (req, res) => {
    try {
      const { id } = req.params;
      const { resolutionTimeline } = req.body;
      
      if (!resolutionTimeline || typeof resolutionTimeline !== 'number') {
        return res.status(400).json({ error: "Resolution timeline is required" });
      }

      let officer = await storage.getUserByUsername("panchayat-officer");
      if (!officer) {
        officer = await storage.createUser({
          username: "panchayat-officer",
          password: "temp",
          fullName: "Panchayat Officer",
          mobileNumber: "+919999999999",
          email: "officer@panchayat.gov.in",
          villageName: "Demo Village",
          role: "official",
        });
      }
      
      const grievance = await storage.acceptGrievance(id, officer.id, resolutionTimeline);
      
      if (!grievance) {
        return res.status(404).json({ error: "Grievance not found" });
      }
      
      res.json(grievance);
    } catch (error) {
      console.error("Error accepting grievance:", error);
      res.status(500).json({ error: "Failed to accept grievance" });
    }
  });

  app.patch("/api/grievances/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status, resolutionNotes, resolutionEvidence } = req.body;
      
      if (!status) {
        return res.status(400).json({ error: "Status is required" });
      }

      const updates: any = {};
      if (resolutionNotes) updates.resolutionNotes = resolutionNotes;
      if (resolutionEvidence) updates.resolutionEvidence = resolutionEvidence;
      
      if (status === "resolved") {
        updates.resolvedAt = new Date();
        const verificationDeadline = new Date();
        verificationDeadline.setDate(verificationDeadline.getDate() + 7);
        updates.verificationDeadline = verificationDeadline;
        updates.status = "pending_verification";
      }

      const grievance = await storage.updateGrievanceStatus(
        id,
        status === "resolved" ? "pending_verification" : status,
        updates
      );
      
      if (!grievance) {
        return res.status(404).json({ error: "Grievance not found" });
      }
      
      res.json(grievance);
    } catch (error) {
      console.error("Error updating grievance status:", error);
      res.status(500).json({ error: "Failed to update grievance status" });
    }
  });

  app.post("/api/verifications", async (req, res) => {
    try {
      const validatedData = insertVerificationSchema.parse(req.body);
      
      let verifier = await storage.getUserByUsername("community-verifier");
      if (!verifier) {
        verifier = await storage.createUser({
          username: "community-verifier",
          password: "temp",
          fullName: "Community Verifier",
          mobileNumber: "+919888888888",
          email: "verifier@community.local",
          villageName: "Demo Village",
          role: "citizen",
        });
      }
      
      const verification = await storage.createVerification(validatedData, verifier.id);

      if (validatedData.verificationType === "verify" && validatedData.status === "verified") {
        await storage.updateGrievanceStatus(validatedData.grievanceId, "resolved");
      } else if (validatedData.verificationType === "dispute" && validatedData.status === "disputed") {
        await storage.updateGrievanceStatus(validatedData.grievanceId, "in_progress");
      }
      
      res.status(201).json(verification);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Validation failed", 
          details: error.errors 
        });
      }
      console.error("Error creating verification:", error);
      res.status(500).json({ error: "Failed to create verification" });
    }
  });

  app.get("/api/verifications/:grievanceId", async (req, res) => {
    try {
      const { grievanceId } = req.params;
      const verifications = await storage.getVerificationsByGrievance(grievanceId);
      res.json(verifications);
    } catch (error) {
      console.error("Error fetching verifications:", error);
      res.status(500).json({ error: "Failed to fetch verifications" });
    }
  });

  app.get("/api/blockchain/:grievanceId", async (req, res) => {
    try {
      const { grievanceId } = req.params;
      const records = await storage.getBlockchainRecordsByGrievance(grievanceId);
      res.json(records);
    } catch (error) {
      console.error("Error fetching blockchain records:", error);
      res.status(500).json({ error: "Failed to fetch blockchain records" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const user = await storage.createUser(req.body);
      res.status(201).json(user);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
