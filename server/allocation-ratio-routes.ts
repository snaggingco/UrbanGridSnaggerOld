import { Router } from "express";
import { storage } from "./storage";
import { insertEntityAllocationRatioSchema, insertEntityRatioValueSchema, insertSharedAreaInclusionSchema } from "@shared/schema";
import { z } from "zod";

export const allocationRatioRouter = Router();

// Entity Allocation Ratio Routes
allocationRatioRouter.post("/ratios", async (req, res) => {
  try {
    const validatedData = insertEntityAllocationRatioSchema.parse(req.body);
    const ratio = await storage.createEntityAllocationRatio(validatedData);
    res.status(201).json(ratio);
  } catch (error) {
    console.error("Error creating entity allocation ratio:", error);
    res.status(400).json({ error: "Invalid data for entity allocation ratio" });
  }
});

allocationRatioRouter.get("/ratios/project/:projectId", async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const ratios = await storage.getEntityAllocationRatiosByProjectId(projectId);
    res.json(ratios);
  } catch (error) {
    console.error("Error fetching entity allocation ratios:", error);
    res.status(500).json({ error: "Failed to fetch entity allocation ratios" });
  }
});

allocationRatioRouter.get("/ratios/core/:projectId", async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const ratios = await storage.getCoreEntityAllocationRatios(projectId);
    res.json(ratios);
  } catch (error) {
    console.error("Error fetching core entity allocation ratios:", error);
    res.status(500).json({ error: "Failed to fetch core entity allocation ratios" });
  }
});

allocationRatioRouter.get("/ratios/type/:projectId/:uomType", async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const uomType = req.params.uomType;
    const ratios = await storage.getEntityAllocationRatiosByUomType(projectId, uomType);
    res.json(ratios);
  } catch (error) {
    console.error("Error fetching entity allocation ratios by UOM type:", error);
    res.status(500).json({ error: "Failed to fetch entity allocation ratios by UOM type" });
  }
});

allocationRatioRouter.get("/ratios/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const ratio = await storage.getEntityAllocationRatioById(id);
    if (!ratio) {
      return res.status(404).json({ error: "Entity allocation ratio not found" });
    }
    res.json(ratio);
  } catch (error) {
    console.error("Error fetching entity allocation ratio:", error);
    res.status(500).json({ error: "Failed to fetch entity allocation ratio" });
  }
});

allocationRatioRouter.put("/ratios/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const validatedData = insertEntityAllocationRatioSchema.partial().parse(req.body);
    const ratio = await storage.updateEntityAllocationRatio(id, validatedData);
    res.json(ratio);
  } catch (error) {
    console.error("Error updating entity allocation ratio:", error);
    res.status(400).json({ error: "Invalid data for entity allocation ratio update" });
  }
});

allocationRatioRouter.delete("/ratios/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await storage.deleteEntityAllocationRatio(id);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting entity allocation ratio:", error);
    res.status(500).json({ error: "Failed to delete entity allocation ratio" });
  }
});

// Entity Ratio Value Routes
allocationRatioRouter.post("/values", async (req, res) => {
  try {
    const validatedData = insertEntityRatioValueSchema.parse(req.body);
    const value = await storage.createEntityRatioValue(validatedData);
    res.status(201).json(value);
  } catch (error) {
    console.error("Error creating entity ratio value:", error);
    res.status(400).json({ error: "Invalid data for entity ratio value" });
  }
});

// Get ratio values with calculated percentages for allocation
allocationRatioRouter.get("/ratios/:ratioId/values", async (req, res) => {
  try {
    const ratioId = parseInt(req.params.ratioId);
    const values = await storage.getEntityRatioValuesByRatioId(ratioId);
    
    if (!values || values.length === 0) {
      return res.json([]);
    }
    
    // Calculate total value sum
    const totalValue = values.reduce((sum, val) => {
      const numericValue = parseFloat(val.value || '0');
      return sum + (isNaN(numericValue) ? 0 : numericValue);
    }, 0);
    
    // Add percentage to each value
    const valuesWithPercentages = values.map(val => {
      const numericValue = parseFloat(val.value || '0');
      const percentage = totalValue > 0 ? (numericValue / totalValue) * 100 : 0;
      
      return {
        ...val,
        percentage: percentage.toFixed(4)
      };
    });
    
    res.json(valuesWithPercentages);
  } catch (error) {
    console.error("Error fetching entity ratio values with percentages:", error);
    res.status(500).json({ error: "Failed to fetch entity ratio values with percentages" });
  }
});

allocationRatioRouter.get("/values/ratio/:ratioId", async (req, res) => {
  try {
    const ratioId = parseInt(req.params.ratioId);
    const values = await storage.getEntityRatioValuesByRatioId(ratioId);
    res.json(values);
  } catch (error) {
    console.error("Error fetching entity ratio values:", error);
    res.status(500).json({ error: "Failed to fetch entity ratio values" });
  }
});

allocationRatioRouter.get("/values/entity/:entityId", async (req, res) => {
  try {
    const entityId = parseInt(req.params.entityId);
    const values = await storage.getEntityRatioValuesByEntityId(entityId);
    res.json(values);
  } catch (error) {
    console.error("Error fetching entity ratio values by entity:", error);
    res.status(500).json({ error: "Failed to fetch entity ratio values by entity" });
  }
});

allocationRatioRouter.get("/values/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const value = await storage.getEntityRatioValueById(id);
    if (!value) {
      return res.status(404).json({ error: "Entity ratio value not found" });
    }
    res.json(value);
  } catch (error) {
    console.error("Error fetching entity ratio value:", error);
    res.status(500).json({ error: "Failed to fetch entity ratio value" });
  }
});

allocationRatioRouter.put("/values/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const validatedData = insertEntityRatioValueSchema.partial().parse(req.body);
    const value = await storage.updateEntityRatioValue(id, validatedData);
    res.json(value);
  } catch (error) {
    console.error("Error updating entity ratio value:", error);
    res.status(400).json({ error: "Invalid data for entity ratio value update" });
  }
});

allocationRatioRouter.delete("/values/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await storage.deleteEntityRatioValue(id);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting entity ratio value:", error);
    res.status(500).json({ error: "Failed to delete entity ratio value" });
  }
});

// Shared Area Inclusion Routes
allocationRatioRouter.post("/inclusions", async (req, res) => {
  try {
    const validatedData = insertSharedAreaInclusionSchema.parse(req.body);
    const inclusion = await storage.createSharedAreaInclusion(validatedData);
    res.status(201).json(inclusion);
  } catch (error) {
    console.error("Error creating shared area inclusion:", error);
    res.status(400).json({ error: "Invalid data for shared area inclusion" });
  }
});

allocationRatioRouter.get("/inclusions/area/:sharedAreaId", async (req, res) => {
  try {
    const sharedAreaId = parseInt(req.params.sharedAreaId);
    const inclusions = await storage.getSharedAreaInclusionsBySharedAreaId(sharedAreaId);
    res.json(inclusions);
  } catch (error) {
    console.error("Error fetching shared area inclusions by area:", error);
    res.status(500).json({ error: "Failed to fetch shared area inclusions by area" });
  }
});

allocationRatioRouter.get("/inclusions/entity/:entityId", async (req, res) => {
  try {
    const entityId = parseInt(req.params.entityId);
    const inclusions = await storage.getSharedAreaInclusionsByEntityId(entityId);
    res.json(inclusions);
  } catch (error) {
    console.error("Error fetching shared area inclusions by entity:", error);
    res.status(500).json({ error: "Failed to fetch shared area inclusions by entity" });
  }
});

allocationRatioRouter.get("/inclusions/ratio/:ratioId", async (req, res) => {
  try {
    const ratioId = parseInt(req.params.ratioId);
    const inclusions = await storage.getSharedAreaInclusionsByRatioId(ratioId);
    res.json(inclusions);
  } catch (error) {
    console.error("Error fetching shared area inclusions by ratio:", error);
    res.status(500).json({ error: "Failed to fetch shared area inclusions by ratio" });
  }
});

allocationRatioRouter.get("/inclusions/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const inclusion = await storage.getSharedAreaInclusionById(id);
    if (!inclusion) {
      return res.status(404).json({ error: "Shared area inclusion not found" });
    }
    res.json(inclusion);
  } catch (error) {
    console.error("Error fetching shared area inclusion:", error);
    res.status(500).json({ error: "Failed to fetch shared area inclusion" });
  }
});

allocationRatioRouter.put("/inclusions/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const validatedData = insertSharedAreaInclusionSchema.partial().parse(req.body);
    const inclusion = await storage.updateSharedAreaInclusion(id, validatedData);
    res.json(inclusion);
  } catch (error) {
    console.error("Error updating shared area inclusion:", error);
    res.status(400).json({ error: "Invalid data for shared area inclusion update" });
  }
});

allocationRatioRouter.delete("/inclusions/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await storage.deleteSharedAreaInclusion(id);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting shared area inclusion:", error);
    res.status(500).json({ error: "Failed to delete shared area inclusion" });
  }
});

// Core Ratio Generation & Calculation Routes
allocationRatioRouter.post("/generate-core-ratios/:projectId", async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const ratios = await storage.generateCoreRatios(projectId);
    res.json(ratios);
  } catch (error) {
    console.error("Error generating core ratios:", error);
    res.status(500).json({ error: "Failed to generate core ratios" });
  }
});

allocationRatioRouter.post("/calculate-ratio/:ratioId", async (req, res) => {
  try {
    const ratioId = parseInt(req.params.ratioId);
    const values = await storage.calculateEntityRatios(ratioId);
    res.json(values);
  } catch (error) {
    console.error("Error calculating entity ratios:", error);
    res.status(500).json({ error: "Failed to calculate entity ratios" });
  }
});

// Unit Conversion Route
allocationRatioRouter.post("/convert-units/:projectId", async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const schema = z.object({
      fromUnit: z.string(),
      toUnit: z.string(),
    });
    const { fromUnit, toUnit } = schema.parse(req.body);
    const success = await storage.convertUnitOfMeasurement(projectId, fromUnit, toUnit);
    if (success) {
      res.json({ success: true, message: `Units converted from ${fromUnit} to ${toUnit}` });
    } else {
      res.status(400).json({ success: false, error: "Unit conversion failed" });
    }
  } catch (error) {
    console.error("Error converting units:", error);
    res.status(500).json({ error: "Failed to convert units" });
  }
});