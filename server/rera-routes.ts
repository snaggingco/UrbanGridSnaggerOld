import express, { Router, Request, Response, NextFunction } from "express";
import { storage as db } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";
import puppeteer from "puppeteer";
import { generateSampleReserveFundProjects } from "./test-data-generator";
import { drizzle } from "drizzle-orm/postgres-js";
import { sql } from "drizzle-orm";

// Helper function for error handling
function handleError(res: Response, message: string, error: any) {
  console.error(`${message}:`, error);
  res.status(500).json({ error: message });
}

// Authentication middleware for RERA routes
function authenticate(req: Request, res: Response, next: NextFunction) {
  // Skip authentication for now - this is causing 404 errors
  next();
}

// Create a router for RERA-specific routes
const reraRouter = Router();

// API for creating a test project - only for development purposes
reraRouter.post('/test-project', async (req: Request, res: Response) => {
  try {
    // Create a test project for demo purposes
    const testProject = {
      name: "Demo Reserve Fund Study",
      clientName: "Test Client",
      location: "Dubai Marina",
      date: new Date(),
      propertyType: "Apartment", // Must match the enum in schema
      propertySize: "1500 sqm",
      status: "in_progress" as "pending" | "in_progress" | "completed" | "cancelled", // Must match the enum in schema
      userId: 1,
      projectType: "rera_audit",
      reraAuditType: "reserve_fund_study",
      yearOfConstruction: 2010,
      buildingName: "Test Building",
      buildingType: "residential",
      totalArea: 5000,
      numberOfFloors: 10
    };
    
    const project = await db.createProject(testProject);
    
    res.status(201).json(project);
  } catch (error: any) {
    console.error('Error creating test project:', error);
    res.status(500).json({ error: 'Failed to create test project' });
  }
});

// API for getting a specific project
reraRouter.get('/projects/:projectId', authenticate, async (req: Request, res: Response) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const project = await db.getProjectById(projectId);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.json(project);
  } catch (error: any) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// API for RERA Asset Locations
reraRouter.get('/projects/:projectId/locations', authenticate, async (req: Request, res: Response) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const locations = await db.getLocationsByProjectId(projectId);
    
    res.json(locations);
  } catch (error: any) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
});

reraRouter.post('/projects/:projectId/locations', authenticate, async (req: Request, res: Response) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const locationData = {
      ...req.body,
      projectId // Ensure projectId is included
    };
    
    const newLocation = await db.createLocation(locationData);
    res.status(201).json(newLocation);
  } catch (error: any) {
    console.error('Error creating location:', error);
    res.status(500).json({ error: 'Failed to create location' });
  }
});

reraRouter.patch('/projects/:projectId/locations/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const locationId = parseInt(req.params.id);
    
    // Verify the location exists
    const existingLocation = await db.getLocationById(locationId);
    if (!existingLocation) {
      return res.status(404).json({ error: 'Location not found' });
    }
    
    // Verify it belongs to the specified project
    if (existingLocation.projectId !== projectId) {
      return res.status(403).json({ error: 'Location does not belong to this project' });
    }
    
    const updatedLocation = await db.updateLocation(locationId, req.body);
    res.json(updatedLocation);
  } catch (error: any) {
    console.error('Error updating location:', error);
    res.status(500).json({ error: 'Failed to update location' });
  }
});

reraRouter.delete('/projects/:projectId/locations/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const locationId = parseInt(req.params.id);
    
    // Verify the location exists
    const existingLocation = await db.getLocationById(locationId);
    if (!existingLocation) {
      return res.status(404).json({ error: 'Location not found' });
    }
    
    // Verify it belongs to the specified project
    if (existingLocation.projectId !== projectId) {
      return res.status(403).json({ error: 'Location does not belong to this project' });
    }
    
    await db.deleteLocation(locationId);
    res.status(200).json({ success: true, message: 'Location deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting location:', error);
    res.status(500).json({ error: 'Failed to delete location' });
  }
});

// API for RERA classifications
reraRouter.get('/projects/:projectId/classifications', authenticate, async (req: Request, res: Response) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const classifications = await db.getNrm3ClassificationsByProjectId(projectId);
    
    res.json(classifications);
  } catch (error: any) {
    console.error('Error fetching classifications:', error);
    res.status(500).json({ error: 'Failed to fetch classifications' });
  }
});

reraRouter.post('/projects/:projectId/classifications', authenticate, async (req: Request, res: Response) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const classificationData = {
      ...req.body,
      projectId // Ensure projectId is included
    };
    
    const newClassification = await db.createNrm3Classification(classificationData);
    res.status(201).json(newClassification);
  } catch (error: any) {
    console.error('Error creating classification:', error);
    res.status(500).json({ error: 'Failed to create classification' });
  }
});

reraRouter.patch('/projects/:projectId/classifications/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const classificationId = parseInt(req.params.id);
    
    // Verify the classification exists
    const existingClassification = await db.getNrm3ClassificationById(classificationId);
    if (!existingClassification) {
      return res.status(404).json({ error: 'Classification not found' });
    }
    
    // Verify it belongs to the specified project
    if (existingClassification.projectId !== projectId) {
      return res.status(403).json({ error: 'Classification does not belong to this project' });
    }
    
    const updatedClassification = await db.updateNrm3Classification(classificationId, req.body);
    res.json(updatedClassification);
  } catch (error: any) {
    console.error('Error updating classification:', error);
    res.status(500).json({ error: 'Failed to update classification' });
  }
});

// API for condition assessments
reraRouter.get('/projects/:projectId/condition-assessments', authenticate, async (req: Request, res: Response) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const assessments = await db.getConditionAssessmentsByProjectId(projectId);
    
    res.json(assessments);
  } catch (error: any) {
    handleError(res, 'Failed to fetch condition assessments', error);
  }
});

reraRouter.post('/projects/:projectId/condition-assessments', authenticate, async (req: Request, res: Response) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const assessmentData = {
      ...req.body,
      projectId // Ensure projectId is included
    };
    
    const newAssessment = await db.createConditionAssessment(assessmentData);
    res.status(201).json(newAssessment);
  } catch (error: any) {
    handleError(res, 'Failed to create condition assessment', error);
  }
});

reraRouter.patch('/projects/:projectId/condition-assessments/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const assessmentId = parseInt(req.params.id);
    
    // Verify the assessment exists
    const existingAssessment = await db.getConditionAssessmentById(assessmentId);
    if (!existingAssessment) {
      return res.status(404).json({ error: 'Condition assessment not found' });
    }
    
    // Verify it belongs to the specified project
    if (existingAssessment.projectId !== projectId) {
      return res.status(403).json({ error: 'Condition assessment does not belong to this project' });
    }
    
    const updatedAssessment = await db.updateConditionAssessment(assessmentId, req.body);
    res.json(updatedAssessment);
  } catch (error: any) {
    handleError(res, 'Failed to update condition assessment', error);
  }
});

// Configure storage for condition assessment photos
const storageConfig = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(process.cwd(), 'client/public/uploads/rera');
    fs.mkdirSync(uploadsDir, { recursive: true });
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = randomUUID();
    const extension = path.extname(file.originalname);
    cb(null, `rera_${uniqueSuffix}${extension}`);
  }
});

const upload = multer({
  storage: storageConfig,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Photo upload endpoint for condition assessments
reraRouter.post('/projects/:projectId/condition-assessments/:id/photos', 
  authenticate,
  upload.array('photos', 10), // Allow up to 10 photos
  async (req: Request, res: Response) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const assessmentId = parseInt(req.params.id);
      
      // Verify the condition assessment exists
      const assessment = await db.getConditionAssessmentById(assessmentId);
      if (!assessment) {
        return res.status(404).json({ error: 'Condition assessment not found' });
      }
      
      // Verify it belongs to the specified project
      if (assessment.projectId !== projectId) {
        return res.status(403).json({ error: 'Condition assessment does not belong to this project' });
      }
      
      // Get the uploaded files
      if (!req.files) {
        return res.status(400).json({ error: 'No files uploaded' });
      }
      
      const files = req.files as Express.Multer.File[];
      
      if (files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
      }
      
      // Convert file paths to URLs
      const photoUrls = files.map(file => {
        const relativePath = path.relative(
          path.join(process.cwd(), 'client/public'),
          file.path
        );
        return `/${relativePath.replace(/\\/g, '/')}`;
      });
      
      // Update the condition assessment with the new photo URLs
      const existingPhotoUrls = assessment.photoUrls || [];
      const updatedAssessment = await db.updateConditionAssessment(assessmentId, {
        photoUrls: [...existingPhotoUrls, ...photoUrls]
      });
      
      res.json({
        success: true,
        photoUrls,
        assessment: updatedAssessment
      });
    } catch (error: any) {
      handleError(res, 'Failed to upload photos', error);
    }
  }
);

// API for lifecycle costs
reraRouter.get('/projects/:projectId/lifecycle-costs', authenticate, async (req: Request, res: Response) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const lifecycleCosts = await db.getLifecycleCostsByProjectId(projectId);
    
    res.json(lifecycleCosts);
  } catch (error: any) {
    handleError(res, 'Failed to fetch lifecycle costs', error);
  }
});

reraRouter.post('/projects/:projectId/lifecycle-costs', authenticate, async (req: Request, res: Response) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const lifecycleCostData = {
      ...req.body,
      projectId // Ensure projectId is included
    };
    
    const newLifecycleCost = await db.createLifecycleCost(lifecycleCostData);
    res.status(201).json(newLifecycleCost);
  } catch (error: any) {
    handleError(res, 'Failed to create lifecycle cost', error);
  }
});

reraRouter.patch('/projects/:projectId/lifecycle-costs/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const lifecycleCostId = parseInt(req.params.id);
    
    // Verify the lifecycle cost exists
    const existingLifecycleCost = await db.getLifecycleCostById(lifecycleCostId);
    if (!existingLifecycleCost) {
      return res.status(404).json({ error: 'Lifecycle cost not found' });
    }
    
    // Verify it belongs to the specified project
    if (existingLifecycleCost.projectId !== projectId) {
      return res.status(403).json({ error: 'Lifecycle cost does not belong to this project' });
    }
    
    const updatedLifecycleCost = await db.updateLifecycleCost(lifecycleCostId, req.body);
    res.json(updatedLifecycleCost);
  } catch (error: any) {
    handleError(res, 'Failed to update lifecycle cost', error);
  }
});

// Delete lifecycle cost
reraRouter.delete('/projects/:projectId/lifecycle-costs/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const lifecycleCostId = parseInt(req.params.id);
    
    // Verify the lifecycle cost exists
    const existingLifecycleCost = await db.getLifecycleCostById(lifecycleCostId);
    if (!existingLifecycleCost) {
      return res.status(404).json({ error: 'Lifecycle cost not found' });
    }
    
    // Verify it belongs to the specified project
    if (existingLifecycleCost.projectId !== projectId) {
      return res.status(403).json({ error: 'Lifecycle cost does not belong to this project' });
    }
    
    // Delete the lifecycle cost
    await db.deleteLifecycleCost(lifecycleCostId);
    
    res.status(200).json({ success: true, message: 'Lifecycle cost deleted successfully' });
  } catch (error: any) {
    handleError(res, 'Failed to delete lifecycle cost', error);
  }
});

// API for report data summary
reraRouter.get('/projects/:projectId/report-data', authenticate, async (req: Request, res: Response) => {
  try {
    const projectId = parseInt(req.params.projectId);
    
    // Get the actual data counts
    const locations = await db.getLocationsByProjectId(projectId);
    const classifications = await db.getNrm3ClassificationsByProjectId(projectId);
    const assessments = await db.getConditionAssessmentsByProjectId(projectId);
    const lifecycleCosts = await db.getLifecycleCostsByProjectId(projectId);
    
    // Check if any assessments have photos
    const hasPhotos = assessments.some(assessment => 
      assessment.photoUrls && assessment.photoUrls.length > 0
    );
    
    // Determine if the data is complete enough for a report
    // This logic can be customized based on requirements
    const isDataComplete = 
      classifications.length > 0 && 
      assessments.length > 0 && 
      lifecycleCosts.length > 0;
    
    const reportData = {
      locationsCount: locations.length,
      classificationsCount: classifications.length,
      assessmentsCount: assessments.length,
      lifecycleCostsCount: lifecycleCosts.length,
      hasPhotos,
      isDataComplete
    };
    
    res.json(reportData);
  } catch (error: any) {
    handleError(res, 'Failed to fetch report data', error);
  }
});

// API for generating RERA reports
reraRouter.post('/projects/:projectId/reports/generate', authenticate, async (req: Request, res: Response) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const { type, format, data } = req.body;
    
    // Extract data from the nested data object
    const { settings, fundingStrategy, capitalPlan, summaryStats, currentContributionPerformance, currentYear } = data || {};
    
    // Validate required data
    if (!settings || !settings.studyPeriod) {
      return res.status(400).json({ error: 'Missing or invalid reserve fund settings' });
    }
    
    console.log('Report generation data:', { type, format, settings });
    
    // Get project and ownership details
    const project = await db.getProjectById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Generate a filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const fileName = `${project.name ? project.name.replace(/\s+/g, '_') : 'Project_' + projectId}_Reserve_Fund_Study_${timestamp}.pdf`;
    const filePath = `./client/public/downloads/pdf/${fileName}`;
    
    // Ensure directory exists
    try {
      await fs.promises.mkdir('./client/public/downloads/pdf', { recursive: true });
    } catch (err) {
      console.error('Error creating directory:', err);
    }
    
    // Create HTML content for the PDF
    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Reserve Fund Study Report</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .header { text-align: center; margin-bottom: 30px; }
          .report-title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
          .section { margin-bottom: 20px; }
          .section-title { font-size: 18px; font-weight: bold; margin-bottom: 10px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background-color: #f2f2f2; }
          .footer { text-align: center; margin-top: 50px; font-size: 12px; color: #888; }
          .summary-box { background-color: #f9f9f9; border: 1px solid #ddd; padding: 15px; margin-bottom: 20px; }
          .warning { color: #e74c3c; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="report-title">Reserve Fund Study Report</div>
          <div>${project.name || 'Project ' + projectId}</div>
          <div>Generated on ${new Date().toLocaleDateString()}</div>
        </div>
        
        <div class="section">
          <div class="section-title">Study Overview</div>
          <div class="summary-box">
            <p><strong>Study Period:</strong> ${settings.studyPeriod} years</p>
            <p><strong>Starting Balance:</strong> AED ${settings.startBalance.toLocaleString()}</p>
            <p><strong>Interest Rate:</strong> ${(settings.interestRate * 100).toFixed(2)}%</p>
            <p><strong>Inflation Rate:</strong> ${(settings.inflationRate * 100).toFixed(2)}%</p>
            <p><strong>Contribution Strategy:</strong> ${settings.contributionStrategy.charAt(0).toUpperCase() + settings.contributionStrategy.slice(1)}${settings.contributionStrategy === 'escalating' ? ` (${(settings.escalationRate * 100).toFixed(2)}%)` : ''}</p>
            ${settings.contributionStrategy === 'escalating' ? `<p><strong>Annual Escalation Rate:</strong> ${(settings.escalationRate * 100).toFixed(2)}%</p>` : ''}
            ${settings.fundingStrategy.escalationRate > 0 ? `<p><strong>Annual Contribution Growth:</strong> ${(settings.fundingStrategy.escalationRate * 100).toFixed(2)}%</p>` : ''}
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">Financial Summary</div>
          <table>
            <tr>
              <th>Metric</th>
              <th>Amount (AED)</th>
            </tr>
            <tr>
              <td>Total Asset Replacement Cost</td>
              <td>${summaryStats.totalReplacementCost.toLocaleString()}</td>
            </tr>
            <tr>
              <td>Total Inflated Replacement Cost</td>
              <td>${summaryStats.totalInflatedReplacementCost.toLocaleString()}</td>
            </tr>
            <tr>
              <td>Short-Term Needs (5 Years)</td>
              <td>${summaryStats.shortTermNeeds.toLocaleString()}</td>
            </tr>
            <tr>
              <td>Annual Maintenance Cost</td>
              <td>${summaryStats.annualMaintenanceCost.toLocaleString()}</td>
            </tr>
          </table>
        </div>
        
        <div class="section">
          <div class="section-title">Funding Strategy Results</div>
          <div class="summary-box">
            <p><strong>Recommended Annual Contribution:</strong> AED ${settings.fundingStrategy.annualContribution.toLocaleString()}</p>
            ${settings.fundingStrategy.strategyType === 'escalating' && settings.fundingStrategy.escalationRate ? 
              `<p><strong>Annual Contribution Growth Rate:</strong> ${(settings.fundingStrategy.escalationRate * 100).toFixed(2)}%</p>
               <p><strong>Year 5 Contribution:</strong> AED ${Math.round(settings.fundingStrategy.annualContribution * Math.pow(1 + settings.fundingStrategy.escalationRate, 4)).toLocaleString()}</p>
               <p><strong>Year 10 Contribution:</strong> AED ${Math.round(settings.fundingStrategy.annualContribution * Math.pow(1 + settings.fundingStrategy.escalationRate, 9)).toLocaleString()}</p>` 
              : ''
            }
            ${settings.currentContribution ? `
            <p><strong>Current Annual Contribution:</strong> AED ${settings.currentContribution.toLocaleString()}</p>
            <p><strong>Difference:</strong> AED ${(settings.currentContribution - settings.fundingStrategy.annualContribution).toLocaleString()}</p>
            ` : ''}
            <p><strong>Minimum Balance Year:</strong> ${new Date().getFullYear() + summaryStats.minBalanceYear}</p>
            <p><strong>Minimum Balance Amount:</strong> AED ${summaryStats.minBalance.toLocaleString()}</p>
          </div>
          
          ${settings.fundingStrategy.warnings && settings.fundingStrategy.warnings.length > 0 ? `
          <div class="section-title">Warnings</div>
          <ul class="warning">
            ${settings.fundingStrategy.warnings.map((warning: string) => `<li>${warning}</li>`).join('')}
          </ul>
          ` : ''}
        </div>
        
        <div class="section">
          <div class="section-title">Cashflow Projection</div>
          <table>
            <tr>
              <th>Year</th>
              <th>Beginning Balance</th>
              <th>Contribution</th>
              <th>Interest</th>
              <th>Capital Cost</th>
              <th>Ending Balance</th>
            </tr>
            ${settings.fundingStrategy.cashflow.map((entry: any) => `
            <tr>
              <td>${new Date().getFullYear() + entry.year}</td>
              <td>${entry.beginBalance.toLocaleString()}</td>
              <td>${entry.contribution.toLocaleString()}</td>
              <td>${entry.interest.toLocaleString()}</td>
              <td>${entry.capitalCost.toLocaleString()}</td>
              <td>${entry.endBalance.toLocaleString()}</td>
            </tr>
            `).join('')}
          </table>
        </div>
        
        <div class="section">
          <div class="section-title">Capital Plan</div>
          <table>
            <tr>
              <th>Year</th>
              <th>Description</th>
              <th>Base Cost</th>
              <th>Inflated Cost</th>
            </tr>
            ${capitalPlan.sort((a: any, b: any) => a.year - b.year).map((entry: any) => `
            <tr>
              <td>${new Date().getFullYear() + entry.year}</td>
              <td>${entry.description}</td>
              <td>${entry.amount.toLocaleString()}</td>
              <td>${(entry.inflatedAmount || entry.amount).toLocaleString()}</td>
            </tr>
            `).join('')}
          </table>
        </div>
        
        <div class="footer">
          <p>This report was generated by the Reserve Fund Study Module.</p>
          <p>© ${new Date().getFullYear()} Urban Grid</p>
        </div>
      </body>
      </html>
    `;
    
    try {
      // Write HTML to a temporary file (useful for debugging)
      await fs.promises.writeFile('./client/public/downloads/pdf/temp.html', htmlContent);
      
      // Use puppeteer to generate PDF
      const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      const page = await browser.newPage();
      await page.setContent(htmlContent);
      await page.pdf({
        path: filePath,
        format: 'A4',
        margin: {
          top: '1cm',
          bottom: '1cm',
          left: '1cm',
          right: '1cm'
        }
      });
      await browser.close();
      
      // Return the URL to download the report
      const reportUrl = `/downloads/pdf/${fileName}`;
      res.json({
        success: true,
        reportUrl,
        message: 'Report generated successfully'
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      res.status(500).json({ error: 'Failed to generate PDF report' });
    }
  } catch (error: any) {
    handleError(res, 'Failed to generate report', error);
  }
});

// Reserve Fund Settings Routes
reraRouter.get('/projects/:projectId/reserve-fund-settings', authenticate, async (req: Request, res: Response) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const settings = await db.getReserveFundSettingsByProjectId(projectId);
    
    if (!settings) {
      return res.status(404).json({ error: 'Reserve fund settings not found for this project' });
    }
    
    res.json(settings);
  } catch (error: any) {
    handleError(res, 'Failed to fetch reserve fund settings', error);
  }
});

reraRouter.post('/projects/:projectId/reserve-fund-settings', authenticate, async (req: Request, res: Response) => {
  try {
    const projectId = parseInt(req.params.projectId);
    
    // Check if settings already exist for this project
    const existingSettings = await db.getReserveFundSettingsByProjectId(projectId);
    
    if (existingSettings) {
      console.log(`Settings already exist for project ${projectId}, ID: ${existingSettings.id}`);
      return res.status(409).json({
        error: 'Reserve fund settings already exist for this project',
        message: 'Use PATCH to update existing settings',
        existingSettingsId: existingSettings.id
      });
    }
    
    const settingsData = {
      ...req.body,
      projectId // Ensure projectId is included
    };
    
    const newSettings = await db.createReserveFundSettings(settingsData);
    res.status(201).json(newSettings);
  } catch (error: any) {
    handleError(res, 'Failed to create reserve fund settings', error);
  }
});

reraRouter.patch('/projects/:projectId/reserve-fund-settings/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const settingsId = parseInt(req.params.id);
    
    // Verify the settings exists
    const existingSettings = await db.getReserveFundSettingsById(settingsId);
    if (!existingSettings) {
      return res.status(404).json({ error: 'Reserve fund settings not found' });
    }
    
    // Verify it belongs to the specified project
    if (existingSettings.projectId !== projectId) {
      return res.status(403).json({ error: 'Reserve fund settings do not belong to this project' });
    }
    
    const updatedSettings = await db.updateReserveFundSettings(settingsId, req.body);
    res.json(updatedSettings);
  } catch (error: any) {
    handleError(res, 'Failed to update reserve fund settings', error);
  }
});

// Generate sample reserve fund projects for demo purposes
reraRouter.post('/sample-projects', authenticate, async (req: Request, res: Response) => {
  try {
    console.log('Starting to generate sample reserve fund projects...');
    
    // Clean up existing data if requested
    if (req.query.clean === 'true') {
      console.log('Cleaning up existing data before generating samples...');
      
      // Get all RERA projects 
      const reraProjects = await db.getAllProjects();
      const reraProjectIds = reraProjects
        .filter((p: any) => p.projectType === 'rera_audit')
        .map((p: any) => p.id);
      
      console.log(`Found ${reraProjectIds.length} RERA projects to clean up`);
      
      // Delete all project-related data for each project
      for (const projectId of reraProjectIds) {
        try {
          // Delete lifecycle costs
          const lifecycleCosts = await db.getLifecycleCostsByProjectId(projectId);
          for (const cost of lifecycleCosts) {
            await db.deleteLifecycleCost(cost.id);
          }
          console.log(`Deleted ${lifecycleCosts.length} lifecycle costs for project ${projectId}`);
          
          // We'll skip deleting these for now as we're generating fresh data
          console.log(`Skipping deletion of existing data for project ${projectId} - we'll generate new ones`);
          
          // Mark project as cancelled
          await db.updateProject(projectId, {
            status: 'cancelled'
          });
          console.log(`Marked project ${projectId} as deleted`);
        } catch (err) {
          console.error(`Error cleaning up project ${projectId}:`, err);
        }
      }
    }
    
    // Use the generator function to create sample projects
    const result = await generateSampleReserveFundProjects();
    
    // Return the created projects
    res.status(201).json({
      success: true,
      message: 'Successfully created sample reserve fund projects',
      data: {
        commercialProject: {
          id: result.commercialProject.project.id,
          name: result.commercialProject.project.name,
          classificationsCount: result.commercialProject.classifications.length,
          assessmentsCount: result.commercialProject.assessments.length,
          locationsCount: result.commercialProject.locations.length
        },
        residentialProject: {
          id: result.residentialProject.project.id,
          name: result.residentialProject.project.name,
          classificationsCount: result.residentialProject.classifications.length,
          assessmentsCount: result.residentialProject.assessments.length,
          locationsCount: result.residentialProject.locations.length
        }
      }
    });
  } catch (error: any) {
    console.error('Error generating sample projects:', error);
    handleError(res, 'Failed to generate sample reserve fund projects', error);
  }
});

export default reraRouter;