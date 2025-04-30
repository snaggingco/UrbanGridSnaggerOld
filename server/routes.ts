import express, { Router } from "express";
import type { Express, Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { 
  insertInquirySchema, 
  insertBookingSchema, 
  insertUserSchema,
  loginSchema,
  insertProjectSchema,
  insertDefectSchema,
  insertImageSchema,
  insertReportSchema,
  insertLocationSchema,
  insertVisitorSchema,
  // SEO Intelligence schemas
  insertSeoCompetitorAnalysisSchema,
  insertSeoRecommendationSchema,
  insertAdSimulationSchema
} from "@shared/schema";
import path from "path";
import fs from "fs";
import pdfRouter from "./pdf-generator";
import reraRouter from "./rera-routes";
import { reraReportRouter } from "./rera-report-generator";
import { setupAmcRoutes } from "./amc-routes";
import { allocationRatioRouter } from "./allocation-ratio-routes";
import { seoIntelligenceRouter } from "./seo-intelligence-routes";
import { createGoogleSearchConsoleRoutes } from "./routes/google-search-console-routes";
import multer from "multer";
import { randomUUID } from "crypto";

// Configure storage for file uploads
const storageConfig = multer.diskStorage({
  destination: (req, file, cb) => {
    // Ensure the uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'client/public/uploads');
    fs.mkdirSync(uploadsDir, { recursive: true });
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate a unique filename to prevent overwriting
    const uniqueSuffix = randomUUID();
    const extension = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${extension}`);
  }
});

const upload = multer({ 
  storage: storageConfig,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Authentication middleware
function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: "Authentication required" });
  }
  
  const token = authHeader.split(' ')[1];
  
  storage.validateToken(token)
    .then(user => {
      if (!user) {
        return res.status(401).json({ error: "Invalid token" });
      }
      
      (req as any).user = user;
      next();
    })
    .catch(error => {
      res.status(500).json({ error: "Authentication error" });
    });
}

// Authorization middleware for admin only routes
function authorizeAdmin(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user;
  
  if (user.role !== 'admin') {
    return res.status(403).json({ error: "Admin access required" });
  }
  
  next();
}

// Visitor tracking API routes
const visitorRouter = Router();

// Track a new visitor or update an existing one
visitorRouter.post('/track', async (req: Request, res: Response) => {
  try {
    const { 
      visitedPage, 
      userAgent, 
      referrer, 
      queryParams, 
      browser, 
      device, 
      operatingSystem, 
      sessionId 
    } = req.body;
    
    // Get IP address from request, checking for forwarded headers which is common in proxy setups like Replit
    let ipAddress = 'unknown';
    
    // Check for X-Forwarded-For header which may contain the actual client IP
    const forwardedFor = req.headers['x-forwarded-for'];
    if (forwardedFor) {
      // X-Forwarded-For can contain multiple IPs - the leftmost is the original client
      if (typeof forwardedFor === 'string') {
        ipAddress = forwardedFor.split(',')[0].trim();
      } else if (Array.isArray(forwardedFor) && forwardedFor.length > 0) {
        ipAddress = forwardedFor[0].split(',')[0].trim();
      }
    } else {
      // Fallback to standard IP detection
      ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
    }
    
    // Use combined identifier with device info to distinguish between devices
    const deviceIdentifier = device || 'unknown-device';
    
    // Check if this visitor (IP + device + page) already exists - now includes device to differentiate
    const existingVisitor = await storage.findExistingVisitor(ipAddress, visitedPage, deviceIdentifier);
    
    if (existingVisitor) {
      // Update existing visitor with incremented click count
      await storage.incrementVisitorClicks(existingVisitor.id);
      res.status(201).json({ success: true, updated: true });
    } else {
      // Create a new visitor record
      const visitorData = {
        ipAddress,
        visitedPage,
        userAgent,
        referrer,
        queryParams,
        browser,
        device,
        operatingSystem,
        sessionId,
        country: undefined, // Could be populated by a geolocation service
        city: undefined,    // Could be populated by a geolocation service
      };
      
      await storage.trackVisitor(visitorData);
      res.status(201).json({ success: true, created: true });
    }
  } catch (error) {
    console.error('Error tracking visitor:', error);
    res.status(500).json({ error: 'Failed to track visitor data' });
  }
});

// Admin visitor tracking routes
const adminVisitorRouter = Router();

// Get all visitors
adminVisitorRouter.get('/', authenticate, authorizeAdmin, async (req: Request, res: Response) => {
  try {
    const visitors = await storage.getAllVisitors();
    res.status(200).json(visitors);
  } catch (error) {
    console.error('Error fetching visitors:', error);
    res.status(500).json({ error: 'Failed to fetch visitor data' });
  }
});

// Get suspicious visitors
adminVisitorRouter.get('/suspicious', authenticate, authorizeAdmin, async (req: Request, res: Response) => {
  try {
    const suspiciousVisitors = await storage.getSuspiciousVisitors();
    res.status(200).json(suspiciousVisitors);
  } catch (error) {
    console.error('Error fetching suspicious visitors:', error);
    res.status(500).json({ error: 'Failed to fetch suspicious visitor data' });
  }
});

// Get visitor statistics
adminVisitorRouter.get('/stats', authenticate, authorizeAdmin, async (req: Request, res: Response) => {
  try {
    const stats = await storage.getVisitorStats();
    res.status(200).json(stats);
  } catch (error) {
    console.error('Error fetching visitor stats:', error);
    res.status(500).json({ error: 'Failed to fetch visitor statistics' });
  }
});

// Get visitors by IP address
adminVisitorRouter.get('/ip', authenticate, authorizeAdmin, async (req: Request, res: Response) => {
  try {
    const { ip } = req.query;
    
    if (!ip) {
      return res.status(400).json({ error: 'IP address is required' });
    }
    
    const visitors = await storage.getVisitorsByIp(ip.toString());
    res.status(200).json(visitors);
  } catch (error) {
    console.error('Error fetching visitors by IP:', error);
    res.status(500).json({ error: 'Failed to fetch visitors by IP' });
  }
});

// Flag visitor as suspicious
adminVisitorRouter.patch('/:id/flag', authenticate, authorizeAdmin, async (req: Request, res: Response) => {
  try {
    const visitorId = parseInt(req.params.id, 10);
    const { reason } = req.body;
    
    if (!reason) {
      return res.status(400).json({ error: 'Reason for flagging is required' });
    }
    
    const visitor = await storage.flagSuspiciousVisitor(visitorId, reason);
    res.status(200).json(visitor);
  } catch (error) {
    console.error('Error flagging visitor:', error);
    res.status(500).json({ error: 'Failed to flag visitor' });
  }
});

// NRM3 Categories route
const nrm3Router = Router();

// Get all NRM3 categories
nrm3Router.get('/', async (req: Request, res: Response) => {
  try {
    // Read NRM3 classification JSON file
    const nrm3FilePath = path.join(process.cwd(), 'nrm3-classification.json');
    const nrm3Data = fs.readFileSync(nrm3FilePath, 'utf-8');
    const categories = JSON.parse(nrm3Data);
    
    res.json(categories);
  } catch (error) {
    console.error("Error fetching NRM3 categories:", error);
    res.status(500).json({ error: "Error fetching NRM3 categories" });
  }
});

export async function registerRoutes(app: Express) {
  // Public API routes
  app.post("/api/inquiries", async (req, res) => {
    try {
      const inquiry = insertInquirySchema.parse(req.body);
      const result = await storage.createInquiry(inquiry);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: "Invalid inquiry data" });
    }
  });

  // Booking routes handled below
  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const credentials = loginSchema.parse(req.body);
      const result = await storage.login(credentials);
      
      if (!result) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      // Don't send password in response
      const { user, token } = result;
      const { password, ...userWithoutPassword } = user;
      
      res.json({ user: userWithoutPassword, token });
    } catch (error) {
      res.status(400).json({ error: "Invalid login request" });
    }
  });
  
  // User management routes (admin only)
  app.post("/api/users", authenticate, authorizeAdmin, async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      
      // Don't send password in response
      const { password, ...userWithoutPassword } = user;
      
      res.status(201).json(userWithoutPassword);
    } catch (error: any) {
      if (error.message === "Username already exists") {
        return res.status(409).json({ error: error.message });
      }
      res.status(400).json({ error: "Invalid user data" });
    }
  });
  
  // Project routes
  app.post("/api/projects", authenticate, async (req, res) => {
    try {
      console.log("Project creation request:", req.body);
      const projectData = insertProjectSchema.parse(req.body);
      console.log("Parsed project data:", projectData);
      
      const project = await storage.createProject({
        ...projectData,
        userId: (req as any).user.id,
      });
      
      console.log("Project created:", project);
      res.status(201).json(project);
    } catch (error) {
      console.error("Project creation error:", error);
      if (error instanceof Error) {
        res.status(400).json({ error: `Invalid project data: ${error.message}` });
      } else {
        res.status(400).json({ error: "Invalid project data" });
      }
    }
  });
  
  app.get("/api/projects", authenticate, async (req, res) => {
    try {
      const { user } = req as any;
      let projects;
      
      if (user.role === 'admin') {
        // Admins can see all projects
        projects = await storage.getAllProjects();
      } else {
        // Regular users see only their projects
        projects = await storage.getProjectsByUserId(user.id);
      }
      
      res.json(projects);
    } catch (error) {
      res.status(500).json({ error: "Error fetching projects" });
    }
  });
  
  app.get("/api/projects/:id", authenticate, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProjectById(projectId);
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      // Check authorization
      const user = (req as any).user;
      if (user.role !== 'admin' && project.userId !== user.id) {
        return res.status(403).json({ error: "Not authorized to view this project" });
      }
      
      res.json(project);
    } catch (error) {
      res.status(500).json({ error: "Error fetching project" });
    }
  });
  
  // Update project properties
  app.patch("/api/projects/:id", authenticate, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProjectById(projectId);
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      // Check authorization
      const user = (req as any).user;
      if (user.role !== 'admin' && project.userId !== user.id) {
        return res.status(403).json({ error: "Not authorized to update this project" });
      }
      
      // Update project with the new properties
      const updatedProject = await storage.updateProject(projectId, req.body);
      
      res.json(updatedProject);
    } catch (error) {
      console.error("Error updating project:", error);
      res.status(500).json({ error: "Error updating project" });
    }
  });
  
  // Defect routes
  app.post("/api/projects/:projectId/defects", authenticate, async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      console.log("Creating defect for project:", projectId);
      console.log("Request body:", req.body);
      
      // Validate and sanitize the data
      const defectData = insertDefectSchema.parse({
        ...req.body,
        projectId // Ensure projectId is set from URL parameter
      });
      
      console.log("Validated defect data:", defectData);
      
      // Check if user has access to the project
      const project = await storage.getProjectById(projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      // Authorization check
      const user = (req as any).user;
      if (user.role !== 'admin' && project.userId !== user.id) {
        return res.status(403).json({ error: "Not authorized for this project" });
      }
      
      const defect = await storage.createDefect(defectData);
      console.log("Created defect:", defect);
      res.status(201).json(defect);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: `Invalid defect data: ${error.message}` });
      } else {
        res.status(400).json({ error: "Invalid defect data" });
      }
    }
  });
  
  // Create a new defect with images in a single request
  app.post("/api/projects/:projectId/defects-with-images", authenticate, upload.array('images', 10), async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      console.log("Creating defect with images for project:", projectId);
      
      // Parse JSON data from form
      const defectData = JSON.parse(req.body.defectData || '{}');
      console.log("Defect data:", defectData);
      
      // Validate and sanitize the data
      const validatedData = insertDefectSchema.parse({
        ...defectData,
        projectId // Ensure projectId is set from URL parameter
      });
      
      console.log("Validated defect data:", validatedData);
      
      // Check if user has access to the project
      const project = await storage.getProjectById(projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      // Authorization check
      const user = (req as any).user;
      if (user.role !== 'admin' && project.userId !== user.id) {
        return res.status(403).json({ error: "Not authorized for this project" });
      }
      
      // Create the defect
      const defect = await storage.createDefect(validatedData);
      console.log("Created defect:", defect);
      
      // Process uploaded images if any
      const uploadedImages = [];
      if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        const files = req.files as Express.Multer.File[];
        
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const imageUrl = `/uploads/${file.filename}`;
          
          // Parse annotations for this image, if any
          let annotations = [];
          try {
            const annotationsForImage = req.body[`annotations[${i}]`];
            if (annotationsForImage) {
              annotations = JSON.parse(annotationsForImage);
            }
          } catch (e) {
            console.error("Error parsing annotations:", e);
          }
          
          // Create the image record linked to the defect
          const image = await storage.uploadImage({
            projectId,
            defectId: defect.id,
            url: imageUrl,
            filename: file.filename,
            description: req.body[`description[${i}]`] || '',
            annotations: annotations.length > 0 ? JSON.stringify(annotations) : undefined,
            isAnnotated: annotations.length > 0,
          });
          
          uploadedImages.push(image);
        }
      }
      
      // Return the created defect along with any uploaded images
      res.status(201).json({
        defect,
        images: uploadedImages
      });
    } catch (error) {
      console.error("Error creating defect with images:", error);
      if (error instanceof Error) {
        res.status(400).json({ error: `Failed to create defect: ${error.message}` });
      } else {
        res.status(400).json({ error: "Failed to create defect" });
      }
    }
  });
  
  // Legacy route for backward compatibility
  app.post("/api/defects", authenticate, async (req, res) => {
    try {
      const defectData = insertDefectSchema.parse(req.body);
      
      // Check if user has access to the project
      const project = await storage.getProjectById(defectData.projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      // Authorization check
      const user = (req as any).user;
      if (user.role !== 'admin' && project.userId !== user.id) {
        return res.status(403).json({ error: "Not authorized for this project" });
      }
      
      const defect = await storage.createDefect(defectData);
      res.status(201).json(defect);
    } catch (error) {
      res.status(400).json({ error: "Invalid defect data" });
    }
  });
  
  app.get("/api/projects/:id/defects", authenticate, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const locationId = req.query.location ? String(req.query.location) : null;
      
      console.log("Fetching defects for project:", projectId, "locationId:", locationId);
      
      // Check if user has access to the project
      const project = await storage.getProjectById(projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      // Authorization check
      const user = (req as any).user;
      if (user.role !== 'admin' && project.userId !== user.id) {
        return res.status(403).json({ error: "Not authorized for this project" });
      }
      
      // Get all defects for this project
      const defects = await storage.getDefectsByProjectId(projectId);
      
      // If location filter is provided, we need to fetch all locations to do the location name matching
      const locations = locationId ? await storage.getLocationsByProjectId(projectId) : [];
      
      // Filter by locationId if provided
      const filteredDefects = locationId 
        ? defects.filter(d => {
            if ('locationId' in d && d.locationId !== undefined && d.locationId !== null) {
              return d.locationId === parseInt(locationId);
            } else {
              // If there's no locationId field, try to match by location name
              // This is for backward compatibility with existing defects
              const location = locations.find(l => l.id === parseInt(locationId));
              return location && d.location === location.name;
            }
          })
        : defects;
        
      // For debugging
      console.log(`Found ${filteredDefects.length} defects for locationId ${locationId} (out of ${defects.length} total)`);
      
        
      res.json(filteredDefects);
    } catch (error) {
      console.error("Error fetching defects:", error);
      res.status(500).json({ error: "Error fetching defects" });
    }
  });
  
  // Get a single defect 
  app.get("/api/projects/:projectId/defects/:id", authenticate, async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const defectId = parseInt(req.params.id);
      
      // Check if project exists
      const project = await storage.getProjectById(projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      // Authorization check
      const user = (req as any).user;
      if (user.role !== 'admin' && project.userId !== user.id) {
        return res.status(403).json({ error: "Not authorized for this project" });
      }
      
      const defect = await storage.getDefectById(defectId);
      
      if (!defect) {
        return res.status(404).json({ error: "Defect not found" });
      }
      
      // Verify defect belongs to the project
      if (defect.projectId !== projectId) {
        return res.status(404).json({ error: "Defect not found in this project" });
      }
      
      res.json(defect);
    } catch (error) {
      res.status(500).json({ error: "Error fetching defect" });
    }
  });
  
  // Update a defect - REST style route
  app.patch("/api/projects/:projectId/defects/:id", authenticate, async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const defectId = parseInt(req.params.id);
      
      // Check if project exists
      const project = await storage.getProjectById(projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      // Authorization check
      const user = (req as any).user;
      if (user.role !== 'admin' && project.userId !== user.id) {
        return res.status(403).json({ error: "Not authorized for this project" });
      }
      
      const defect = await storage.getDefectById(defectId);
      
      if (!defect) {
        return res.status(404).json({ error: "Defect not found" });
      }
      
      // Verify defect belongs to the project
      if (defect.projectId !== projectId) {
        return res.status(404).json({ error: "Defect not found in this project" });
      }
      
      const updatedDefect = await storage.updateDefect(defectId, req.body);
      res.json(updatedDefect);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: `Invalid update data: ${error.message}` });
      } else {
        res.status(400).json({ error: "Invalid update data" });
      }
    }
  });
  
  // Update defect status only - simplified endpoint
  app.patch("/api/projects/:projectId/defects/:id/status", authenticate, async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const defectId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status || !['open', 'in_progress', 'resolved'].includes(status)) {
        return res.status(400).json({ error: "Invalid status. Must be 'open', 'in_progress', or 'resolved'" });
      }
      
      // Check if project exists
      const project = await storage.getProjectById(projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      // Authorization check
      const user = (req as any).user;
      if (user.role !== 'admin' && project.userId !== user.id) {
        return res.status(403).json({ error: "Not authorized for this project" });
      }
      
      const defect = await storage.getDefectById(defectId);
      
      if (!defect) {
        return res.status(404).json({ error: "Defect not found" });
      }
      
      // Verify defect belongs to the project
      if (defect.projectId !== projectId) {
        return res.status(404).json({ error: "Defect not found in this project" });
      }
      
      console.log(`Updating defect ${defectId} status to: ${status}`);
      
      // Update only the status
      const updatedDefect = await storage.updateDefect(defectId, { status });
      
      // Return updated defect
      res.json(updatedDefect);
    } catch (error) {
      console.error("Error updating defect status:", error);
      if (error instanceof Error) {
        res.status(400).json({ error: `Invalid status update: ${error.message}` });
      } else {
        res.status(400).json({ error: "Invalid status update" });
      }
    }
  });
  
  // Legacy route for backward compatibility
  app.patch("/api/defects/:id", authenticate, async (req, res) => {
    try {
      const defectId = parseInt(req.params.id);
      const defect = await storage.getDefectById(defectId);
      
      if (!defect) {
        return res.status(404).json({ error: "Defect not found" });
      }
      
      // Check if user has access to the project
      const project = await storage.getProjectById(defect.projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      // Authorization check
      const user = (req as any).user;
      if (user.role !== 'admin' && project.userId !== user.id) {
        return res.status(403).json({ error: "Not authorized for this defect" });
      }
      
      const updatedDefect = await storage.updateDefect(defectId, req.body);
      res.json(updatedDefect);
    } catch (error) {
      res.status(400).json({ error: "Invalid update data" });
    }
  });
  
  // Image upload routes
  app.post("/api/projects/:projectId/images/upload", authenticate, upload.array('images', 10), async (req, res) => {
    try {
      if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
        return res.status(400).json({ error: "No image files provided" });
      }
      
      const projectId = parseInt(req.params.projectId);
      const defectId = req.body.defectId ? parseInt(req.body.defectId) : null;
      const description = req.body.description || '';
      const annotationsJson = req.body.annotations || '[]';
      
      // Check if user has access to the project
      const project = await storage.getProjectById(projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      // Authorization check
      const user = (req as any).user;
      if (user.role !== 'admin' && project.userId !== user.id) {
        return res.status(403).json({ error: "Not authorized for this project" });
      }
      
      // Process each uploaded file
      const files = req.files as Express.Multer.File[];
      const uploadedImages = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const imageUrl = `/uploads/${file.filename}`;
        
        // Parse annotations for this image, if any
        let annotations = [];
        try {
          const annotationsForImage = req.body[`annotations[${i}]`];
          if (annotationsForImage) {
            annotations = JSON.parse(annotationsForImage);
          }
        } catch (e) {
          console.error("Error parsing annotations:", e);
        }
        
        // Create the image record
        const image = await storage.uploadImage({
          projectId,
          defectId,
          url: imageUrl,
          filename: file.filename,
          description,
          annotations: annotations.length > 0 ? JSON.stringify(annotations) : undefined,
          isAnnotated: annotations.length > 0,
        });
        
        uploadedImages.push(image);
      }
      
      res.status(201).json(uploadedImages);
    } catch (error) {
      console.error("Image upload error:", error);
      res.status(400).json({ error: "Image upload failed" });
    }
  });
  
  // Legacy route for backward compatibility
  app.post("/api/images/upload", authenticate, upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }
      
      const projectId = parseInt(req.body.projectId);
      const defectId = req.body.defectId ? parseInt(req.body.defectId) : null;
      
      // Check if user has access to the project
      const project = await storage.getProjectById(projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      // Authorization check
      const user = (req as any).user;
      if (user.role !== 'admin' && project.userId !== user.id) {
        return res.status(403).json({ error: "Not authorized for this project" });
      }
      
      // Create the image record
      const imageUrl = `/uploads/${req.file.filename}`;
      const image = await storage.uploadImage({
        projectId,
        defectId,
        url: imageUrl,
        filename: req.file.filename,
      });
      
      res.status(201).json(image);
    } catch (error) {
      res.status(400).json({ error: "Image upload failed" });
    }
  });
  
  app.get("/api/projects/:id/images", authenticate, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      
      // Check if user has access to the project
      const project = await storage.getProjectById(projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      // Authorization check
      const user = (req as any).user;
      if (user.role !== 'admin' && project.userId !== user.id) {
        return res.status(403).json({ error: "Not authorized for this project" });
      }
      
      const images = await storage.getImagesByProjectId(projectId);
      res.json(images);
    } catch (error) {
      res.status(500).json({ error: "Error fetching images" });
    }
  });
  
  // Get images associated with a defect
  app.get("/api/defects/:id/images", authenticate, async (req, res) => {
    try {
      const defectId = parseInt(req.params.id);
      
      // Check if defect exists
      const defect = await storage.getDefectById(defectId);
      if (!defect) {
        return res.status(404).json({ error: "Defect not found" });
      }
      
      // Check if user has access to the project
      const project = await storage.getProjectById(defect.projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      // Authorization check
      const user = (req as any).user;
      if (user.role !== 'admin' && project.userId !== user.id) {
        return res.status(403).json({ error: "Not authorized for this project" });
      }
      
      const images = await storage.getImagesByDefectId(defectId);
      res.json(images);
    } catch (error) {
      res.status(500).json({ error: "Error fetching images" });
    }
  });
  
  // Update an image (annotations, description)
  app.patch("/api/images/:id", authenticate, async (req, res) => {
    try {
      const imageId = parseInt(req.params.id);
      
      // Check if image exists
      const image = await storage.getImageById(imageId);
      if (!image) {
        return res.status(404).json({ error: "Image not found" });
      }
      
      // Check if user has access to the project
      const project = await storage.getProjectById(image.projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      // Authorization check
      const user = (req as any).user;
      if (user.role !== 'admin' && project.userId !== user.id) {
        return res.status(403).json({ error: "Not authorized for this project" });
      }
      
      // Update the image with new annotations/description
      const updatedImage = await storage.updateImage(imageId, {
        description: req.body.description,
        annotations: req.body.annotations,
        isAnnotated: req.body.isAnnotated,
      });
      
      res.json(updatedImage);
    } catch (error) {
      console.error("Image update error:", error);
      res.status(500).json({ error: "Error updating image" });
    }
  });
  
  // Report generation routes
  app.post("/api/projects/:id/generate-report", authenticate, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const settings = req.body.settings;
      
      // Check if user has access to the project
      const project = await storage.getProjectById(projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      // Authorization check
      const user = (req as any).user;
      if (user.role !== 'admin' && project.userId !== user.id) {
        return res.status(403).json({ error: "Not authorized for this project" });
      }
      
      // Generate the report with custom settings if provided
      const reportData = {
        projectId,
        settings: settings || null,
      };
      
      const report = await storage.generateReport(projectId);
      
      // Store custom template settings for PDF generation
      if (settings) {
        // Update with settings or create a new report record
        await storage.updateReport(report.id, { settings: JSON.stringify(settings) });
      }
      
      res.status(201).json(report);
    } catch (error) {
      console.error("Report generation error:", error);
      res.status(500).json({ error: "Report generation failed" });
    }
  });
  
  // Report Settings routes
  app.get("/api/reports/settings", authenticate, async (req, res) => {
    try {
      const settings = await storage.getReportSettings();
      res.status(200).json(settings);
    } catch (error) {
      console.error('Error fetching report settings:', error);
      res.status(500).json({ error: 'Failed to fetch report settings' });
    }
  });

  app.post("/api/reports/settings", authenticate, async (req, res) => {
    try {
      const settings = req.body;
      const updatedSettings = await storage.saveReportSettings(settings);
      res.status(200).json(updatedSettings);
    } catch (error) {
      console.error('Error saving report settings:', error);
      res.status(500).json({ error: 'Failed to save report settings' });
    }
  });
  
  // Locations management routes
  app.post("/api/projects/:projectId/locations", authenticate, async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      
      // Check if user has access to the project
      const project = await storage.getProjectById(projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      // Authorization check
      const user = (req as any).user;
      if (user.role !== 'admin' && project.userId !== user.id) {
        return res.status(403).json({ error: "Not authorized for this project" });
      }
      
      // Validate location data using insertLocationSchema
      const locationData = insertLocationSchema.parse({
        ...req.body,
        projectId // Ensure projectId is set from URL parameter
      });
      
      console.log("Creating location:", locationData);
      
      // Create the location
      const location = await storage.createLocation(locationData);
      res.status(201).json(location);
    } catch (error) {
      console.error("Error creating location:", error);
      if (error instanceof Error) {
        res.status(400).json({ error: `Invalid location data: ${error.message}` });
      } else {
        res.status(400).json({ error: "Invalid location data" });
      }
    }
  });
  
  // Get all locations for a project
  app.get("/api/projects/:projectId/locations", authenticate, async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      
      // Check if user has access to the project
      const project = await storage.getProjectById(projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      // Authorization check
      const user = (req as any).user;
      if (user.role !== 'admin' && project.userId !== user.id) {
        return res.status(403).json({ error: "Not authorized for this project" });
      }
      
      const locations = await storage.getLocationsByProjectId(projectId);
      res.json(locations);
    } catch (error) {
      console.error("Error fetching locations:", error);
      res.status(500).json({ error: "Error fetching locations" });
    }
  });
  
  // Delete a location
  app.delete("/api/projects/:projectId/locations/:id", authenticate, async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const locationId = parseInt(req.params.id);
      
      // Check if user has access to the project
      const project = await storage.getProjectById(projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      // Authorization check
      const user = (req as any).user;
      if (user.role !== 'admin' && project.userId !== user.id) {
        return res.status(403).json({ error: "Not authorized for this project" });
      }
      
      // Get the location to verify it belongs to this project
      const location = await storage.getLocationById(locationId);
      if (!location) {
        return res.status(404).json({ error: "Location not found" });
      }
      
      if (location.projectId !== projectId) {
        return res.status(403).json({ error: "Location does not belong to this project" });
      }
      
      await storage.deleteLocation(locationId);
      res.status(200).json({ success: true, message: "Location deleted successfully" });
    } catch (error) {
      console.error("Error deleting location:", error);
      if (error instanceof Error && error.message === "Location not found") {
        return res.status(404).json({ error: "Location not found" });
      }
      res.status(500).json({ error: "Error deleting location" });
    }
  });
  
  // Get locations by parent ID
  app.get("/api/projects/:projectId/locations/parent/:parentId?", authenticate, async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const parentId = req.params.parentId ? parseInt(req.params.parentId) : null;
      
      // Check if user has access to the project
      const project = await storage.getProjectById(projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      // Authorization check
      const user = (req as any).user;
      if (user.role !== 'admin' && project.userId !== user.id) {
        return res.status(403).json({ error: "Not authorized for this project" });
      }
      
      const locations = await storage.getLocationsByParentId(parentId, projectId);
      res.json(locations);
    } catch (error) {
      console.error("Error fetching locations:", error);
      res.status(500).json({ error: "Error fetching locations" });
    }
  });
  
  app.get("/api/projects/:id/report", authenticate, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      
      // Check if user has access to the project
      const project = await storage.getProjectById(projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      // Authorization check
      const user = (req as any).user;
      if (user.role !== 'admin' && project.userId !== user.id) {
        return res.status(403).json({ error: "Not authorized for this project" });
      }
      
      const report = await storage.getReportByProjectId(projectId);
      
      if (!report) {
        return res.status(404).json({ error: "Report not found" });
      }
      
      res.json(report);
    } catch (error) {
      res.status(500).json({ error: "Error fetching report" });
    }
  });

  // Specific route for sitemap.xml
  app.get("/sitemap.xml", (req, res) => {
    const sitemapPath = path.resolve("client/public/sitemap.xml");
    if (fs.existsSync(sitemapPath)) {
      res.header("Content-Type", "application/xml");
      res.sendFile(sitemapPath);
    } else {
      res.status(404).send("Sitemap not found");
    }
  });

  // Specific route for robots.txt
  app.get("/robots.txt", (req, res) => {
    const robotsPath = path.resolve("client/public/robots.txt");
    if (fs.existsSync(robotsPath)) {
      res.header("Content-Type", "text/plain");
      res.sendFile(robotsPath);
    } else {
      res.status(404).send("Robots.txt not found");
    }
  });
  
  // Lead Management API Routes
  
  // Public API routes for lead management (no auth required)
  
  // Get all inquiries
  app.get("/api/inquiries", async (req, res) => {
    try {
      const inquiries = await storage.getAllInquiries();
      res.json(inquiries);
    } catch (error) {
      res.status(500).json({ error: "Error fetching inquiries" });
    }
  });
  
  // Update an inquiry
  app.patch("/api/inquiries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updatedFields = req.body;
      
      const updatedInquiry = await storage.updateInquiry(id, updatedFields);
      res.json(updatedInquiry);
    } catch (error) {
      if (error.message === "Inquiry not found") {
        return res.status(404).json({ error: "Inquiry not found" });
      }
      res.status(500).json({ error: "Error updating inquiry" });
    }
  });
  
  // Get all bookings
  app.get("/api/bookings", async (req, res) => {
    try {
      const bookings = await storage.getAllBookings();
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ error: "Error fetching bookings" });
    }
  });
  
  // Create a new booking
  app.post("/api/bookings", async (req, res) => {
    try {
      // Validate the booking data with Zod
      const validateResult = insertBookingSchema.safeParse(req.body);
      
      if (!validateResult.success) {
        return res.status(400).json({ error: "Invalid booking data", details: validateResult.error.errors });
      }
      
      const bookingData = validateResult.data;
      const booking = await storage.createBooking(bookingData);
      
      res.status(201).json(booking);
    } catch (error) {
      console.error("Booking creation error:", error);
      res.status(500).json({ error: "Error creating booking" });
    }
  });
  
  // Update a booking
  app.patch("/api/bookings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updatedFields = req.body;
      
      const updatedBooking = await storage.updateBooking(id, updatedFields);
      res.json(updatedBooking);
    } catch (error) {
      if (error.message === "Booking not found") {
        return res.status(404).json({ error: "Booking not found" });
      }
      res.status(500).json({ error: "Error updating booking" });
    }
  });
  
  // Convert an inquiry to a booking
  app.post("/api/inquiries/:id/convert", async (req, res) => {
    try {
      const inquiryId = parseInt(req.params.id);
      const bookingData = req.body;
      
      const booking = await storage.convertInquiryToBooking(inquiryId, bookingData);
      res.status(201).json(booking);
    } catch (error) {
      if (error.message === "Inquiry not found") {
        return res.status(404).json({ error: "Inquiry not found" });
      }
      res.status(500).json({ error: "Error converting inquiry to booking" });
    }
  });
  
  // Admin API routes for lead management (requires authentication)
  
  // Get all inquiries (leads)
  app.get("/api/admin/inquiries", authenticate, authorizeAdmin, async (req, res) => {
    try {
      const inquiries = await storage.getAllInquiries();
      res.json(inquiries);
    } catch (error) {
      res.status(500).json({ error: "Error fetching inquiries" });
    }
  });
  
  // Get a single inquiry by ID
  app.get("/api/admin/inquiries/:id", authenticate, authorizeAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const inquiry = await storage.getInquiryById(id);
      
      if (!inquiry) {
        return res.status(404).json({ error: "Inquiry not found" });
      }
      
      res.json(inquiry);
    } catch (error) {
      res.status(500).json({ error: "Error fetching inquiry" });
    }
  });
  
  // Update an inquiry (lead)
  app.patch("/api/admin/inquiries/:id", authenticate, authorizeAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updatedFields = req.body;
      
      const updatedInquiry = await storage.updateInquiry(id, updatedFields);
      res.json(updatedInquiry);
    } catch (error) {
      if (error.message === "Inquiry not found") {
        return res.status(404).json({ error: "Inquiry not found" });
      }
      res.status(500).json({ error: "Error updating inquiry" });
    }
  });
  
  // Get all bookings
  app.get("/api/admin/bookings", authenticate, authorizeAdmin, async (req, res) => {
    try {
      const bookings = await storage.getAllBookings();
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ error: "Error fetching bookings" });
    }
  });
  
  // Get a single booking by ID
  app.get("/api/admin/bookings/:id", authenticate, authorizeAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const booking = await storage.getBookingById(id);
      
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }
      
      res.json(booking);
    } catch (error) {
      res.status(500).json({ error: "Error fetching booking" });
    }
  });
  
  // Update a booking
  app.patch("/api/admin/bookings/:id", authenticate, authorizeAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updatedFields = req.body;
      
      const updatedBooking = await storage.updateBooking(id, updatedFields);
      res.json(updatedBooking);
    } catch (error) {
      if (error.message === "Booking not found") {
        return res.status(404).json({ error: "Booking not found" });
      }
      res.status(500).json({ error: "Error updating booking" });
    }
  });
  
  // Get bookings related to an inquiry
  app.get("/api/admin/inquiries/:id/bookings", authenticate, authorizeAdmin, async (req, res) => {
    try {
      const inquiryId = parseInt(req.params.id);
      const bookings = await storage.getBookingsByInquiryId(inquiryId);
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ error: "Error fetching related bookings" });
    }
  });
  
  // Convert an inquiry to a booking
  app.post("/api/admin/inquiries/:id/convert", authenticate, authorizeAdmin, async (req, res) => {
    try {
      const inquiryId = parseInt(req.params.id);
      const bookingData = req.body;
      
      const booking = await storage.convertInquiryToBooking(inquiryId, bookingData);
      res.status(201).json(booking);
    } catch (error) {
      if (error.message === "Inquiry not found") {
        return res.status(404).json({ error: "Inquiry not found" });
      }
      res.status(500).json({ error: "Error converting inquiry to booking" });
    }
  });
  
  // Register PDF generation routes
  app.use('/api', pdfRouter);
  app.use('/api/rera', reraRouter);
  app.use('/api/rera', reraReportRouter);
  
  // Set up AMC Cost Allocation System routes
  setupAmcRoutes(app);
  app.use('/api/allocation', allocationRatioRouter);
  app.use('/api/nrm3-categories', nrm3Router);
  
  // Register SEO Intelligence routes
  app.use('/api/seo-intelligence', seoIntelligenceRouter);
  
  // Google Search Console integration
  const googleSearchConsoleRouter = createGoogleSearchConsoleRoutes(storage);
  app.use('/api/google-search-console', googleSearchConsoleRouter);
  
  // Register visitor tracking routes
  app.use('/api/visitors', visitorRouter);
  app.use('/api/admin/visitors', adminVisitorRouter);
  
  // Visitor tracking routes
  // Public route to track a visit - no authentication required
  app.post("/api/visitors/track", async (req, res) => {
    try {
      // Get IP address from request
      const ipAddress = req.headers['x-forwarded-for'] as string || 
                      req.socket.remoteAddress || 
                      '0.0.0.0';
                      
      // Prepare visitor data with IP address and form data
      const visitorData = insertVisitorSchema.parse({
        ...req.body,
        ipAddress: ipAddress.split(',')[0].trim(), // Handle proxy-forwarded IPs
      });
      
      const visitor = await storage.trackVisitor(visitorData);
      res.status(201).json(visitor);
    } catch (error) {
      console.error("Error tracking visitor:", error);
      res.status(400).json({ error: "Invalid visitor data" });
    }
  });
  
  // Admin routes for visitor tracking - all require authentication
  app.get("/api/admin/visitors", authenticate, authorizeAdmin, async (req, res) => {
    try {
      const visitors = await storage.getAllVisitors();
      res.json(visitors);
    } catch (error) {
      res.status(500).json({ error: "Error fetching visitors" });
    }
  });
  
  app.get("/api/admin/visitors/stats", authenticate, authorizeAdmin, async (req, res) => {
    try {
      const stats = await storage.getVisitorStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Error fetching visitor statistics" });
    }
  });
  
  app.get("/api/admin/visitors/suspicious", authenticate, authorizeAdmin, async (req, res) => {
    try {
      const suspiciousVisitors = await storage.getSuspiciousVisitors();
      res.json(suspiciousVisitors);
    } catch (error) {
      res.status(500).json({ error: "Error fetching suspicious visitors" });
    }
  });
  
  app.get("/api/admin/visitors/ip/:ip", authenticate, authorizeAdmin, async (req, res) => {
    try {
      const ipAddress = req.params.ip;
      const visitors = await storage.getVisitorsByIp(ipAddress);
      res.json(visitors);
    } catch (error) {
      res.status(500).json({ error: "Error fetching visitors by IP" });
    }
  });
  
  app.patch("/api/admin/visitors/:id/flag", authenticate, authorizeAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { reason } = req.body;
      
      if (!reason) {
        return res.status(400).json({ error: "Reason for flagging is required" });
      }
      
      const visitor = await storage.flagSuspiciousVisitor(id, reason);
      res.json(visitor);
    } catch (error) {
      if (error.message === "Visitor not found") {
        return res.status(404).json({ error: "Visitor not found" });
      }
      res.status(500).json({ error: "Error flagging visitor" });
    }
  });
  
  const httpServer = createServer(app);
  return httpServer;
}
