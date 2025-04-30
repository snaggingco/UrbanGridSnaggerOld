import express, { Router, Request, Response, NextFunction } from "express";
import type { Express } from "express";
import { storage } from "./storage";
import {
  insertAmcContractSchema,
  insertProjectEntitySchema,
  insertSharedAreaSchema,
  insertSharedAreaBeneficiarySchema,
  insertAmcEntityUomValueSchema,
  insertAmcAllocationSchema
} from "@shared/schema";
import { requireAuth, requireAdmin } from "./middleware";

/**
 * Setup AMC Cost Allocation API Routes
 * @param app Express application instance
 */
export function setupAmcRoutes(app: Express): void {
  const amcRouter = Router();

  // Budget Item Management Routes
  // Get all RERA budget items
  amcRouter.get("/budget-items", async (req: Request, res: Response) => {
    try {
      const budgetItems = await storage.getReraBudgetItems();
      res.json(budgetItems);
    } catch (error) {
      console.error("Error fetching budget items:", error);
      res.status(500).json({ error: "Failed to fetch budget items" });
    }
  });

  // Search RERA budget items
  amcRouter.get("/budget-items/search", async (req: Request, res: Response) => {
    try {
      const { query, category } = req.query;
      const searchTerm = query ? String(query) : "";
      const categoryFilter = category ? String(category) : undefined;
      
      // Implement search logic
      const budgetItems = await storage.getReraBudgetItems();
      
      // Filter items based on search term and category
      const filteredItems = budgetItems.filter(item => {
        const matchesSearch = searchTerm ? 
          (item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.code.toLowerCase().includes(searchTerm.toLowerCase())) : 
          true;
          
        const matchesCategory = categoryFilter ? 
          item.category === categoryFilter : 
          true;
          
        return matchesSearch && matchesCategory;
      });
      
      res.json(filteredItems);
    } catch (error) {
      console.error("Error searching budget items:", error);
      res.status(500).json({ error: "Failed to search budget items" });
    }
  });

  // Get budget categories for filtering
  amcRouter.get("/budget-items/categories", async (req: Request, res: Response) => {
    try {
      // Get unique categories from budget items
      const budgetItems = await storage.getReraBudgetItems();
      const categories = [...new Set(budgetItems.map(item => item.category))];
      
      res.json(categories);
    } catch (error) {
      console.error("Error fetching budget categories:", error);
      res.status(500).json({ error: "Failed to fetch budget categories" });
    }
  });

  // CRUD operations for AMC Contracts
  // Create a new AMC contract
  amcRouter.post("/contracts", requireAuth, async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const amcData = insertAmcContractSchema.parse(req.body);
      const contract = await storage.createAmcContract({
        ...amcData,
        userId: user.id
      });
      
      res.status(201).json(contract);
    } catch (error) {
      console.error("Error creating AMC contract:", error);
      res.status(400).json({ error: "Invalid AMC contract data" });
    }
  });
  
  // Get all AMC contracts (admin) or user's contracts
  amcRouter.get("/contracts", requireAuth, async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      let contracts;
      
      if (user.role === 'admin') {
        // For admin, get all contracts
        contracts = await storage.getAllAmcContracts();
      } else {
        // For regular users, get only their contracts by project
        const projects = await storage.getProjectsByUserId(user.id);
        contracts = [];
        
        for (const project of projects) {
          const projectContracts = await storage.getAmcContractsByProjectId(project.id);
          contracts = [...contracts, ...projectContracts];
        }
      }
      
      res.json(contracts);
    } catch (error) {
      console.error("Error fetching AMC contracts:", error);
      res.status(500).json({ error: "Failed to fetch AMC contracts" });
    }
  });
  
  // Get AMC contract by ID
  amcRouter.get("/contracts/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const contractId = parseInt(req.params.id);
      const contract = await storage.getAmcContractById(contractId);
      
      if (!contract) {
        return res.status(404).json({ error: "AMC contract not found" });
      }
      
      // Check authorization
      const user = (req as any).user;
      const project = await storage.getProjectById(contract.projectId);
      
      if (user.role !== 'admin' && (!project || project.userId !== user.id)) {
        return res.status(403).json({ error: "Not authorized to view this contract" });
      }
      
      res.json(contract);
    } catch (error) {
      console.error("Error fetching AMC contract:", error);
      res.status(500).json({ error: "Failed to fetch AMC contract" });
    }
  });
  
  // Update AMC contract
  amcRouter.patch("/contracts/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const contractId = parseInt(req.params.id);
      const contract = await storage.getAmcContractById(contractId);
      
      if (!contract) {
        return res.status(404).json({ error: "AMC contract not found" });
      }
      
      // Check authorization
      const user = (req as any).user;
      const project = await storage.getProjectById(contract.projectId);
      
      if (user.role !== 'admin' && (!project || project.userId !== user.id)) {
        return res.status(403).json({ error: "Not authorized to update this contract" });
      }
      
      const updatedContract = await storage.updateAmcContract(contractId, req.body);
      res.json(updatedContract);
    } catch (error) {
      console.error("Error updating AMC contract:", error);
      res.status(500).json({ error: "Failed to update AMC contract" });
    }
  });
  
  // CRUD operations for Project Entities
  // Create a new project entity
  amcRouter.post("/contracts/:contractId/entities", requireAuth, async (req: Request, res: Response) => {
    try {
      const contractId = parseInt(req.params.contractId);
      
      // Check if contract exists and user has access
      const contract = await storage.getAmcContractById(contractId);
      if (!contract) {
        return res.status(404).json({ error: "AMC contract not found" });
      }
      
      // Authorization check
      const user = (req as any).user;
      const project = await storage.getProjectById(contract.projectId);
      
      if (user.role !== 'admin' && (!project || project.userId !== user.id)) {
        return res.status(403).json({ error: "Not authorized for this contract" });
      }
      
      const entityData = insertProjectEntitySchema.parse({
        ...req.body,
        projectId: contract.projectId // Link to same project as the contract
      });
      
      const entity = await storage.createProjectEntity(entityData);
      res.status(201).json(entity);
    } catch (error) {
      console.error("Error creating project entity:", error);
      res.status(400).json({ error: "Invalid project entity data" });
    }
  });
  
  // Get all entities for a contract
  amcRouter.get("/contracts/:contractId/entities", requireAuth, async (req: Request, res: Response) => {
    try {
      const contractId = parseInt(req.params.contractId);
      
      // Check if contract exists and user has access
      const contract = await storage.getAmcContractById(contractId);
      if (!contract) {
        return res.status(404).json({ error: "AMC contract not found" });
      }
      
      // Authorization check
      const user = (req as any).user;
      const project = await storage.getProjectById(contract.projectId);
      
      if (user.role !== 'admin' && (!project || project.userId !== user.id)) {
        return res.status(403).json({ error: "Not authorized for this contract" });
      }
      
      const entities = await storage.getProjectEntitiesByProjectId(contract.projectId);
      res.json(entities);
    } catch (error) {
      console.error("Error fetching project entities:", error);
      res.status(500).json({ error: "Failed to fetch project entities" });
    }
  });
  
  // Shared Areas Management
  // Create a new shared area
  amcRouter.post("/contracts/:contractId/shared-areas", requireAuth, async (req: Request, res: Response) => {
    try {
      const contractId = parseInt(req.params.contractId);
      
      // Check if contract exists and user has access
      const contract = await storage.getAmcContractById(contractId);
      if (!contract) {
        return res.status(404).json({ error: "AMC contract not found" });
      }
      
      // Authorization check
      const user = (req as any).user;
      const project = await storage.getProjectById(contract.projectId);
      
      if (user.role !== 'admin' && (!project || project.userId !== user.id)) {
        return res.status(403).json({ error: "Not authorized for this contract" });
      }
      
      const areaData = insertSharedAreaSchema.parse({
        ...req.body,
        projectId: contract.projectId // Link to same project as the contract
      });
      
      const sharedArea = await storage.createSharedArea(areaData);
      res.status(201).json(sharedArea);
    } catch (error) {
      console.error("Error creating shared area:", error);
      res.status(400).json({ error: "Invalid shared area data" });
    }
  });
  
  // Get all shared areas for a contract
  amcRouter.get("/contracts/:contractId/shared-areas", requireAuth, async (req: Request, res: Response) => {
    try {
      const contractId = parseInt(req.params.contractId);
      
      // Check if contract exists and user has access
      const contract = await storage.getAmcContractById(contractId);
      if (!contract) {
        return res.status(404).json({ error: "AMC contract not found" });
      }
      
      // Authorization check
      const user = (req as any).user;
      const project = await storage.getProjectById(contract.projectId);
      
      if (user.role !== 'admin' && (!project || project.userId !== user.id)) {
        return res.status(403).json({ error: "Not authorized for this contract" });
      }
      
      const sharedAreas = await storage.getSharedAreasByProjectId(contract.projectId);
      res.json(sharedAreas);
    } catch (error) {
      console.error("Error fetching shared areas:", error);
      res.status(500).json({ error: "Failed to fetch shared areas" });
    }
  });
  
  // Shared Area Beneficiaries
  // Create a new beneficiary allocation
  amcRouter.post("/shared-areas/:areaId/beneficiaries", requireAuth, async (req: Request, res: Response) => {
    try {
      const areaId = parseInt(req.params.areaId);
      
      // Check if shared area exists
      const sharedArea = await storage.getSharedAreaById(areaId);
      if (!sharedArea) {
        return res.status(404).json({ error: "Shared area not found" });
      }
      
      // Check if user has access to the project
      const project = await storage.getProjectById(sharedArea.projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      // Authorization check
      const user = (req as any).user;
      if (user.role !== 'admin' && project.userId !== user.id) {
        return res.status(403).json({ error: "Not authorized for this project" });
      }
      
      const beneficiaryData = insertSharedAreaBeneficiarySchema.parse({
        ...req.body,
        sharedAreaId: areaId
      });
      
      const beneficiary = await storage.createSharedAreaBeneficiary(beneficiaryData);
      res.status(201).json(beneficiary);
    } catch (error) {
      console.error("Error creating shared area beneficiary:", error);
      res.status(400).json({ error: "Invalid beneficiary data" });
    }
  });
  
  // Get beneficiaries for a shared area
  amcRouter.get("/shared-areas/:areaId/beneficiaries", requireAuth, async (req: Request, res: Response) => {
    try {
      const areaId = parseInt(req.params.areaId);
      
      // Check if shared area exists
      const sharedArea = await storage.getSharedAreaById(areaId);
      if (!sharedArea) {
        return res.status(404).json({ error: "Shared area not found" });
      }
      
      // Check if user has access to the project
      const project = await storage.getProjectById(sharedArea.projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      // Authorization check
      const user = (req as any).user;
      if (user.role !== 'admin' && project.userId !== user.id) {
        return res.status(403).json({ error: "Not authorized for this project" });
      }
      
      const beneficiaries = await storage.getSharedAreaBeneficiariesBySharedAreaId(areaId);
      res.json(beneficiaries);
    } catch (error) {
      console.error("Error fetching shared area beneficiaries:", error);
      res.status(500).json({ error: "Failed to fetch beneficiaries" });
    }
  });
  
  // Entity UOM Values (Measurements)
  // Create a new UOM value
  amcRouter.post("/contracts/:contractId/uom-values", requireAuth, async (req: Request, res: Response) => {
    try {
      const contractId = parseInt(req.params.contractId);
      
      // Check if contract exists and user has access
      const contract = await storage.getAmcContractById(contractId);
      if (!contract) {
        return res.status(404).json({ error: "AMC contract not found" });
      }
      
      // Authorization check
      const user = (req as any).user;
      const project = await storage.getProjectById(contract.projectId);
      
      if (user.role !== 'admin' && (!project || project.userId !== user.id)) {
        return res.status(403).json({ error: "Not authorized for this contract" });
      }
      
      const uomValueData = insertAmcEntityUomValueSchema.parse({
        ...req.body,
        amcContractId: contractId
      });
      
      const uomValue = await storage.createAmcEntityUomValue(uomValueData);
      res.status(201).json(uomValue);
    } catch (error) {
      console.error("Error creating UOM value:", error);
      res.status(400).json({ error: "Invalid UOM value data" });
    }
  });
  
  // Get UOM values for a contract
  amcRouter.get("/contracts/:contractId/uom-values", requireAuth, async (req: Request, res: Response) => {
    try {
      const contractId = parseInt(req.params.contractId);
      
      // Check if contract exists and user has access
      const contract = await storage.getAmcContractById(contractId);
      if (!contract) {
        return res.status(404).json({ error: "AMC contract not found" });
      }
      
      // Authorization check
      const user = (req as any).user;
      const project = await storage.getProjectById(contract.projectId);
      
      if (user.role !== 'admin' && (!project || project.userId !== user.id)) {
        return res.status(403).json({ error: "Not authorized for this contract" });
      }
      
      const uomValues = await storage.getAmcEntityUomValuesByContractId(contractId);
      res.json(uomValues);
    } catch (error) {
      console.error("Error fetching UOM values:", error);
      res.status(500).json({ error: "Failed to fetch UOM values" });
    }
  });
  
  // AMC Allocations
  // Create/update allocation
  amcRouter.post("/contracts/:contractId/allocations", requireAuth, async (req: Request, res: Response) => {
    try {
      const contractId = parseInt(req.params.contractId);
      
      // Check if contract exists and user has access
      const contract = await storage.getAmcContractById(contractId);
      if (!contract) {
        return res.status(404).json({ error: "AMC contract not found" });
      }
      
      // Authorization check
      const user = (req as any).user;
      const project = await storage.getProjectById(contract.projectId);
      
      if (user.role !== 'admin' && (!project || project.userId !== user.id)) {
        return res.status(403).json({ error: "Not authorized for this contract" });
      }
      
      const allocationData = insertAmcAllocationSchema.parse({
        ...req.body,
        amcContractId: contractId
      });
      
      const allocation = await storage.createAmcAllocation(allocationData);
      res.status(201).json(allocation);
    } catch (error) {
      console.error("Error creating allocation:", error);
      res.status(400).json({ error: "Invalid allocation data" });
    }
  });
  
  // Get allocations for a contract
  amcRouter.get("/contracts/:contractId/allocations", requireAuth, async (req: Request, res: Response) => {
    try {
      const contractId = parseInt(req.params.contractId);
      
      // Check if contract exists and user has access
      const contract = await storage.getAmcContractById(contractId);
      if (!contract) {
        return res.status(404).json({ error: "AMC contract not found" });
      }
      
      // Authorization check
      const user = (req as any).user;
      const project = await storage.getProjectById(contract.projectId);
      
      if (user.role !== 'admin' && (!project || project.userId !== user.id)) {
        return res.status(403).json({ error: "Not authorized for this contract" });
      }
      
      const allocations = await storage.getAmcAllocationsByContractId(contractId);
      res.json(allocations);
    } catch (error) {
      console.error("Error fetching allocations:", error);
      res.status(500).json({ error: "Failed to fetch allocations" });
    }
  });
  
  // Calculate allocations
  amcRouter.post("/contracts/:contractId/calculate", requireAuth, async (req: Request, res: Response) => {
    try {
      const contractId = parseInt(req.params.contractId);
      
      // Check if contract exists and user has access
      const contract = await storage.getAmcContractById(contractId);
      if (!contract) {
        return res.status(404).json({ error: "AMC contract not found" });
      }
      
      // Authorization check
      const user = (req as any).user;
      const project = await storage.getProjectById(contract.projectId);
      
      if (user.role !== 'admin' && (!project || project.userId !== user.id)) {
        return res.status(403).json({ error: "Not authorized for this contract" });
      }
      
      // Call the storage method to calculate
      const allocations = await storage.calculateAmcAllocations(contractId);
      
      res.json(allocations);
    } catch (error) {
      console.error("Error calculating allocations:", error);
      res.status(500).json({ error: "Failed to calculate allocations" });
    }
  });

  // Register the AMC routes
  // Route to download/preview the generated report
  amcRouter.get("/reports/:filename", requireAuth, async (req: Request, res: Response) => {
    try {
      const { filename } = req.params;
      
      // In a real implementation, we would:
      // 1. Check if the file exists in storage
      // 2. Set appropriate content-type header
      // 3. Stream the file to the client
      
      // For this demonstration, we'll create a simple PDF-like response
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      
      // Create a simple text-based PDF-like content
      // This is just a placeholder - in a real implementation, we would serve a properly generated PDF
      const reportContent = `
%PDF-1.7
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources 4 0 R /MediaBox [0 0 612 792] /Contents 6 0 R >>
endobj
4 0 obj
<< /Font << /F1 5 0 R >> >>
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
6 0 obj
<< /Length 68 >>
stream
BT
/F1 24 Tf
100 700 Td
(AMC Cost Allocation Report) Tj
/F1 14 Tf
100 650 Td
(Generated on: ${new Date().toLocaleDateString()}) Tj
100 620 Td
(This is a sample report for demonstration purposes) Tj
100 590 Td
(In a real implementation, this would be a properly formatted PDF) Tj
100 560 Td
(with complete breakdown of cost allocations for each entity) Tj
ET
endstream
endobj
xref
0 7
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000210 00000 n
0000000251 00000 n
0000000318 00000 n
trailer
<< /Size 7 /Root 1 0 R >>
startxref
387
%%EOF
      `;
      
      res.send(reportContent);
    } catch (error) {
      console.error("Error serving report:", error);
      res.status(500).json({ error: "Failed to serve report" });
    }
  });

  // Report Generation Endpoint
  amcRouter.post("/contracts/:contractId/generate-report", requireAuth, async (req: Request, res: Response) => {
    try {
      const { contractId } = req.params;
      const reportOptions = req.body;
      
      // Get the contract details
      const contract = await storage.getAmcContractById(parseInt(contractId));
      if (!contract) {
        return res.status(404).json({ error: "Contract not found" });
      }
      
      // Get the entities for this contract
      const entities = await storage.getProjectEntitiesByProjectId(contract.projectId);
      
      // Get the allocations for this contract
      const allocations = await storage.getAmcAllocationsByContractId(parseInt(contractId));
      
      // Generate a unique filename for the report
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `cost_allocation_report_${contract.projectId}_${timestamp}.pdf`;
      
      // In a real implementation, we would:
      // 1. Generate PDF content using a library like pdfkit or html-pdf
      // 2. Store the PDF in a file or upload to cloud storage
      // 3. Return the URL to the generated PDF
      
      // For this demonstration, we'll simulate the report generation
      console.log(`Generating report for contract ${contractId} with options:`, reportOptions);
      
      // Simulate report generation delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Return a simulated report URL
      // In a real implementation, this would be a valid URL to download the report
      const reportUrl = `/api/amc/reports/${filename}`;
      
      res.json({
        success: true,
        reportUrl,
        message: "Report generated successfully",
        reportOptions
      });
    } catch (error) {
      console.error("Error generating report:", error);
      res.status(500).json({
        error: "Failed to generate report",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.use('/api/amc', amcRouter);
}