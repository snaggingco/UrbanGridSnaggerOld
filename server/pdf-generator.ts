import { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import { storage } from './storage';

const execPromise = promisify(exec);
const pdfRouter = Router();

// Ensure PDF directory exists
const PDF_DIR = path.join(process.cwd(), 'client/public/downloads/pdf');
if (!fs.existsSync(PDF_DIR)) {
  fs.mkdirSync(PDF_DIR, { recursive: true });
}

// Prepare HTML file with corrected paths for PDF generation
function prepareHTMLForPDF(htmlContent: string): string {
  let updatedContent = htmlContent;
  
  // Check if we received complete HTML or just body content
  const isCompleteHTML = htmlContent.includes('<!DOCTYPE html>') || 
                        htmlContent.includes('<html>') || 
                        htmlContent.includes('<HTML>');
  
  // If it's already complete HTML with doctype, return as is with minor fixes
  if (isCompleteHTML) {
    // Fix image paths to ensure they're absolute
    updatedContent = updatedContent.replace(/src="(?!\/)([^"]*\.(?:png|jpg|jpeg|gif|svg))"/gi, 'src="/$1"');
    updatedContent = updatedContent.replace(/src="\.\.\//g, 'src="/');
    
    // Fix SVG use paths
    updatedContent = updatedContent.replace(/href="(?!\/)([^"]*\.(?:svg|css|html|js))"/gi, 'href="/$1"');
    updatedContent = updatedContent.replace(/href="\.\.\//g, 'href="/');
    
    return updatedContent;
  }
  
  // Otherwise, wrap the content in proper HTML structure
  // Fix base URL
  const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
  
  // Helper function to convert relative URLs to absolute URLs
  const convertToAbsoluteUrl = (match: string, p1: string): string => {
    try {
      const absoluteUrl = new URL(p1.startsWith('/') ? p1 : `/${p1}`, baseUrl).toString();
      return `src="${absoluteUrl}"`;
    } catch (e) {
      console.error('Error converting URL:', e);
      return match;
    }
  };
  
  // Fix image paths to ensure they're absolute (with full domain)
  updatedContent = updatedContent.replace(/src="([^"]*\.(?:png|jpg|jpeg|gif|svg))"/gi, convertToAbsoluteUrl);
  
  // Fix SVG use paths
  updatedContent = updatedContent.replace(/href="(?!\/)([^"]*\.(?:svg|css|html|js))"/gi, 'href="/$1"');
  updatedContent = updatedContent.replace(/href="\.\.\//g, 'href="/');
  
  // Create a complete HTML document
  const completeHTML = `<!DOCTYPE html>
<html>
<head>
  <base href="${baseUrl}">
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Property Inspection Report</title>
</head>
<body>
  ${updatedContent}
</body>
</html>`;
  
  return completeHTML;
}

// Route to provide download of company profile HTML directly
pdfRouter.get('/generate-company-profile-pdf', async (req: Request, res: Response) => {
  try {
    // Path to the HTML file
    const htmlPath = path.join(process.cwd(), 'client/public/downloads/urbangrid-company-profile.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');
    
    // For now, let's just serve the HTML file as a download
    // In a production environment, you would use a proper PDF generation service
    res.setHeader('Content-Disposition', 'attachment; filename=UrbanGrid-Company-Profile.html');
    res.setHeader('Content-Type', 'text/html');
    res.send(prepareHTMLForPDF(htmlContent));
  } catch (error) {
    console.error('File download error:', error);
    res.status(500).send('Error generating download');
  }
});

// Generate and download project report as PDF (or HTML for now)
pdfRouter.get('/generate-project-pdf/:projectId', async (req: Request, res: Response) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const template = req.query.template as string || 'default';
    
    // Get stored report settings from the database or use query params as fallback
    let reportSettings = null;
    const report = await storage.getReportByProjectId(projectId);
    
    if (report && report.settings) {
      try {
        reportSettings = JSON.parse(report.settings);
      } catch (e) {
        console.error('Error parsing stored report settings:', e);
      }
    }
    
    // If no stored settings or invalid, try to use query params
    if (!reportSettings && req.query.settings) {
      try {
        reportSettings = JSON.parse(req.query.settings as string);
      } catch (e) {
        console.error('Error parsing query settings:', e);
      }
    }
    
    // Default settings if none are provided
    if (!reportSettings) {
      reportSettings = {
        template: 'default',
        companyLogo: true,
        coverPage: true,
        executiveSummary: 'Summary of the inspection findings',
        includeImages: true,
        includeAnnotations: true,
        groupByLocation: true,
        groupBySeverity: false,
        groupByCategory: false,
        showDates: true,
        showAssignees: true,
        includeAppendix: true,
        conclusion: 'Inspection conclusion',
        customHeader: '',
        customFooter: 'UrbanGrid Property Inspection Report',
        includeRecommendations: true,
        fontSizeScale: 1,
        colorTheme: 'blue',
      };
    }
    
    // Get project data
    const project = await storage.getProjectById(projectId);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    
    // Get defects for the project
    const defects = await storage.getDefectsByProjectId(projectId);
    
    // Get locations for the project
    const locations = await storage.getLocationsByProjectId(projectId);
    
    // Get images for the project
    const images = await storage.getImagesByProjectId(projectId);
    
    // Default settings
    const settings = reportSettings || {
      template: template,
      companyLogo: true,
      coverPage: true,
      executiveSummary: "",
      includeImages: true,
      includeAnnotations: true,
      groupByLocation: true,
      groupBySeverity: false,
      groupByCategory: false,
      showDates: true,
      showAssignees: true,
      includeAppendix: true,
      conclusion: "",
      customHeader: "",
      customFooter: "Report generated by Snagging.me by UrbanGrid",
      includeRecommendations: true,
      fontSizeScale: 1,
      colorTheme: "blue"
    };
    
    // Define color schemes based on theme
    let colorScheme;
    switch (settings.colorTheme) {
      case 'green':
        colorScheme = {
          primary: '#16a34a',
          secondary: '#86efac',
          headingColor: '#15803d',
          borderColor: '#bbf7d0'
        };
        break;
      case 'purple':
        colorScheme = {
          primary: '#9333ea',
          secondary: '#d8b4fe',
          headingColor: '#7e22ce',
          borderColor: '#e9d5ff'
        };
        break;
      case 'red':
        colorScheme = {
          primary: '#dc2626',
          secondary: '#fecaca',
          headingColor: '#b91c1c',
          borderColor: '#fee2e2'
        };
        break;
      case 'amber':
        colorScheme = {
          primary: '#d97706',
          secondary: '#fde68a',
          headingColor: '#b45309',
          borderColor: '#fef3c7'
        };
        break;
      case 'teal':
        colorScheme = {
          primary: '#0d9488',
          secondary: '#99f6e4',
          headingColor: '#0f766e',
          borderColor: '#ccfbf1'
        };
        break;
      case 'blue':
      default:
        colorScheme = {
          primary: '#2563eb',
          secondary: '#93c5fd',
          headingColor: '#1d4ed8',
          borderColor: '#dbeafe'
        };
    }
    
    // Calculate summary statistics
    const totalDefects = defects.length;
    const criticalDefects = defects.filter(d => d.severity === 'critical').length;
    const majorDefects = defects.filter(d => d.severity === 'major').length;
    const minorDefects = defects.filter(d => d.severity === 'minor').length;
    const openDefects = defects.filter(d => d.status === 'open').length;
    const inProgressDefects = defects.filter(d => d.status === 'in_progress').length;
    const resolvedDefects = defects.filter(d => d.status === 'resolved').length;
    const locationsWithDefects = new Set(defects.map(d => d.location)).size;
    
    // Build HTML report based on template
    let htmlContent = '';
    
    // Common CSS styles with theme variables
    const commonStyles = `
      body { 
        font-family: Arial, sans-serif; 
        margin: 0; 
        padding: 0; 
        color: #333;
        font-size: ${settings.fontSizeScale}rem;
        line-height: 1.5;
      }
      h1, h2, h3, h4, h5, h6 { color: ${colorScheme.headingColor}; }
      .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
      .header { text-align: center; margin-bottom: 30px; position: relative; }
      .cover-page { 
        height: 100vh; 
        display: flex; 
        flex-direction: column; 
        justify-content: center; 
        align-items: center; 
        text-align: center; 
        background-color: #f8fafc;
        border-bottom: 1px solid #e2e8f0;
      }
      .logo { max-width: 250px; height: auto; margin: 0 auto 20px; display: block; }
      .company-name { 
        font-size: 2.5rem; 
        margin-bottom: 10px; 
        color: ${colorScheme.primary}; 
        font-weight: bold;
      }
      .report-title { 
        font-size: 2.2rem; 
        margin-bottom: 30px; 
        color: #1f2937; 
        font-weight: normal;
      }
      .project-name {
        font-size: 1.8rem;
        margin-bottom: 20px;
        color: #1f2937;
      }
      .project-info { 
        margin-bottom: 30px; 
        border: 1px solid ${colorScheme.borderColor}; 
        padding: 20px; 
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        background-color: #fff;
      }
      .info-row { display: flex; margin-bottom: 12px; }
      .info-label { font-weight: bold; width: 180px; color: #4b5563; }
      .info-value { flex: 1; }
      .section { margin-bottom: 40px; }
      .section-title { 
        font-size: 1.5rem; 
        margin-bottom: 15px; 
        padding-bottom: 8px;
        border-bottom: 2px solid ${colorScheme.borderColor};
        color: ${colorScheme.primary};
      }
      .summary-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 15px;
        margin-bottom: 30px;
      }
      .stat-card {
        background-color: #fff;
        border-radius: 8px;
        padding: 15px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        border: 1px solid ${colorScheme.borderColor};
      }
      .stat-title {
        font-size: 0.9rem;
        color: #6b7280;
        margin-bottom: 8px;
      }
      .stat-value {
        font-size: 1.8rem;
        font-weight: bold;
        color: ${colorScheme.primary};
      }
      .stat-critical .stat-value { color: #dc2626; }
      .stat-major .stat-value { color: #ea580c; }
      .stat-minor .stat-value { color: #16a34a; }
      .stat-open .stat-value { color: #dc2626; }
      .stat-inprogress .stat-value { color: #d97706; }
      .stat-resolved .stat-value { color: #16a34a; }
      
      .executive-summary {
        padding: 20px;
        background-color: #f8fafc;
        border-radius: 8px;
        margin-bottom: 40px;
        border-left: 4px solid ${colorScheme.primary};
      }
      
      .defect-list {
        margin-top: 30px;
      }
      
      .defect-item { 
        margin-bottom: 25px; 
        border: 1px solid #e5e7eb; 
        padding: 20px; 
        border-radius: 8px;
        background-color: #fff;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.03);
      }
      
      .defect-header { 
        display: flex; 
        justify-content: space-between; 
        align-items: flex-start;
        margin-bottom: 15px;
      }
      
      .defect-title { 
        font-size: 1.2rem; 
        font-weight: bold; 
        color: #111827;
      }
      
      .defect-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }
      
      .severity, .status, .category {
        display: inline-flex;
        align-items: center;
        padding: 4px 10px;
        border-radius: 20px;
        font-size: 0.85rem;
        font-weight: 500;
      }
      
      .severity-critical { 
        background-color: #fee2e2; 
        color: #b91c1c; 
      }
      .severity-major { 
        background-color: #ffedd5; 
        color: #c2410c; 
      }
      .severity-minor { 
        background-color: #dcfce7; 
        color: #15803d; 
      }
      
      .status-open { 
        background-color: #fee2e2; 
        color: #b91c1c; 
      }
      .status-in_progress { 
        background-color: #fef3c7; 
        color: #92400e; 
      }
      .status-resolved { 
        background-color: #d1fae5; 
        color: #065f46; 
      }
      
      .category-tag {
        background-color: #f3f4f6;
        color: #4b5563;
      }
      
      .defect-description {
        margin-bottom: 15px;
        color: #4b5563;
      }
      
      .defect-detail {
        margin-bottom: 5px;
        color: #6b7280;
      }
      .defect-detail strong {
        color: #4b5563;
        font-weight: 500;
      }
      
      .images-container { 
        display: grid; 
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); 
        gap: 15px; 
        margin-top: 20px; 
      }
      
      .image-item { 
        position: relative;
        border: 1px solid #e5e7eb;
        border-radius: 6px;
        overflow: hidden;
      }
      
      .image-item img { 
        width: 100%; 
        display: block;
        aspect-ratio: 4/3;
        object-fit: cover;
      }
      
      .image-annotation { 
        padding: 10px; 
        font-size: 0.85rem; 
        color: #4b5563;
        background-color: #f9fafb;
        border-top: 1px solid #e5e7eb;
      }
      
      .location-heading {
        margin-top: 40px;
        margin-bottom: 20px;
        font-size: 1.4rem;
        color: ${colorScheme.headingColor};
        padding-bottom: 8px;
        border-bottom: 1px solid ${colorScheme.borderColor};
      }
      
      .severity-heading {
        margin-top: 40px;
        margin-bottom: 20px;
        font-size: 1.4rem;
        padding-bottom: 8px;
        border-bottom: 1px solid ${colorScheme.borderColor};
      }
      .severity-heading.critical { color: #b91c1c; }
      .severity-heading.major { color: #c2410c; }
      .severity-heading.minor { color: #15803d; }
      
      .category-heading {
        margin-top: 40px;
        margin-bottom: 20px;
        font-size: 1.4rem;
        color: #4b5563;
        padding-bottom: 8px;
        border-bottom: 1px solid ${colorScheme.borderColor};
      }
      
      .page-break { 
        page-break-after: always; 
        height: 0; 
        visibility: hidden;
      }
      
      .conclusion {
        margin-top: 40px;
        margin-bottom: 40px;
        padding: 20px;
        background-color: #f8fafc;
        border-radius: 8px;
        border-left: 4px solid ${colorScheme.primary};
      }
      
      .recommendations {
        margin-top: 30px;
      }
      
      .recommendation-item {
        margin-bottom: 15px;
        padding-left: 20px;
        position: relative;
      }
      
      .recommendation-item:before {
        content: "•";
        position: absolute;
        left: 0;
        color: ${colorScheme.primary};
        font-weight: bold;
      }
      
      .appendix {
        margin-top: 60px;
        page-break-before: always;
      }
      
      .appendix-title {
        font-size: 1.8rem;
        margin-bottom: 20px;
        color: ${colorScheme.headingColor};
      }
      
      table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 30px;
      }
      
      table th, table td {
        border: 1px solid #e5e7eb;
        padding: 10px;
        text-align: left;
      }
      
      table th {
        background-color: #f8fafc;
        font-weight: 500;
        color: #4b5563;
      }
      
      table tr:nth-child(even) {
        background-color: #f9fafb;
      }
      
      .footer {
        margin-top: 60px;
        border-top: 1px solid #e5e7eb;
        padding-top: 20px;
        color: #6b7280;
        font-size: 0.9rem;
        text-align: center;
      }
      
      @media print {
        body { font-size: ${settings.fontSizeScale}rem; }
        .page-break { page-break-after: always; }
        .cover-page { height: 100vh; }
        .container { max-width: 100%; }
      }
    `;
    
    // Start building the HTML report
    htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Property Inspection Report - ${project.name}</title>
      <style>${commonStyles}</style>
    </head>
    <body>`;
    
    // Add cover page if enabled
    if (settings.coverPage) {
      htmlContent += `
      <div class="cover-page">
        <div class="container">
          ${settings.companyLogo ? `
          <div class="logo-container">
            <img src="${(process.env.BASE_URL || 'http://localhost:5000') + '/internachi.png'}" alt="UrbanGrid Logo" class="logo" />
          </div>` : ''}
          <div class="company-name">Snagging By UrbanGrid</div>
          <div class="report-title">Property Inspection Report</div>
          <div class="project-name">${project.name}</div>
          <div style="margin-top: 20px; color: #6b7280;">
            <p>Client: ${project.clientName}</p>
            <p>Location: ${project.location}</p>
            <p>Date: ${new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>
      <div class="page-break"></div>`;
    }
    
    // Add main report content
    htmlContent += `
    <div class="container">
      ${settings.customHeader ? `<div class="custom-header">${settings.customHeader}</div>` : ''}`;
    
    // Add project information
    htmlContent += `
      <div class="section">
        <h2 class="section-title">Project Information</h2>
        <div class="project-info">
          <div class="info-row">
            <div class="info-label">Project Name:</div>
            <div class="info-value">${project.name}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Client:</div>
            <div class="info-value">${project.clientName}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Location:</div>
            <div class="info-value">${project.location}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Property Type:</div>
            <div class="info-value">${project.propertyType || 'Not specified'}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Inspection Date:</div>
            <div class="info-value">${project.date ? new Date(project.date).toLocaleDateString() : new Date().toLocaleDateString()}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Status:</div>
            <div class="info-value">${project.status?.charAt(0).toUpperCase() + project.status?.slice(1) || 'Pending'}</div>
          </div>
          ${project.propertySize ? `
          <div class="info-row">
            <div class="info-label">Property Size:</div>
            <div class="info-value">${project.propertySize} sq. ft.</div>
          </div>` : ''}
        </div>
      </div>`;
      
    // Add executive summary if provided
    if (settings.executiveSummary && settings.executiveSummary.trim().length > 0) {
      htmlContent += `
      <div class="section">
        <h2 class="section-title">Executive Summary</h2>
        <div class="executive-summary">
          ${settings.executiveSummary.replace(/\n/g, '<br>')}
        </div>
      </div>`;
    } else {
      // Default executive summary
      htmlContent += `
      <div class="section">
        <h2 class="section-title">Executive Summary</h2>
        <div class="executive-summary">
          <p>This report presents the findings of a thorough property inspection conducted at ${project.location}. 
          The inspection identified a total of ${totalDefects} defects across 
          ${locationsWithDefects} ${locationsWithDefects > 1 ? 'locations' : 'location'}.</p>
          
          <p>Of these defects, ${criticalDefects} were categorized as critical, ${majorDefects} as major, 
          and ${minorDefects} as minor. Currently, ${resolvedDefects} issues have been resolved, 
          ${inProgressDefects} are in progress, and ${openDefects} remain open for attention.</p>
          
          <p>The following report provides detailed documentation of each identified issue, 
          complete with photographic evidence and recommended remedial actions.</p>
        </div>
      </div>`;
    }
    
    // Add summary statistics
    htmlContent += `
    <div class="section">
      <h2 class="section-title">Summary Statistics</h2>
      <div class="summary-stats">
        <div class="stat-card">
          <div class="stat-title">Total Defects</div>
          <div class="stat-value">${totalDefects}</div>
        </div>
        
        <div class="stat-card stat-critical">
          <div class="stat-title">Critical Issues</div>
          <div class="stat-value">${criticalDefects}</div>
        </div>
        
        <div class="stat-card stat-major">
          <div class="stat-title">Major Issues</div>
          <div class="stat-value">${majorDefects}</div>
        </div>
        
        <div class="stat-card stat-minor">
          <div class="stat-title">Minor Issues</div>
          <div class="stat-value">${minorDefects}</div>
        </div>
        
        <div class="stat-card stat-open">
          <div class="stat-title">Open</div>
          <div class="stat-value">${openDefects}</div>
        </div>
        
        <div class="stat-card stat-inprogress">
          <div class="stat-title">In Progress</div>
          <div class="stat-value">${inProgressDefects}</div>
        </div>
        
        <div class="stat-card stat-resolved">
          <div class="stat-title">Resolved</div>
          <div class="stat-value">${resolvedDefects}</div>
        </div>
        
        <div class="stat-card">
          <div class="stat-title">Affected Areas</div>
          <div class="stat-value">${locationsWithDefects}</div>
        </div>
      </div>
    </div>`;
      
    // Add defects grouped according to settings
    htmlContent += `
    <div class="section">
      <h2 class="section-title">Detailed Findings</h2>`;
    
    if (settings.groupByLocation) {
      // Group defects by location
      const defectsByLocation = new Map<string, any[]>();
      defects.forEach(defect => {
        const locationName = defect.location || 'Other';
        if (!defectsByLocation.has(locationName)) {
          defectsByLocation.set(locationName, []);
        }
        defectsByLocation.get(locationName)?.push(defect);
      });
      
      // List defects by location
      defectsByLocation.forEach((locationDefects, locationName) => {
        htmlContent += `
        <div class="location-section">
          <h3 class="location-heading">${locationName}</h3>
          <div class="defect-list">`;
          
        for (const defect of locationDefects) {
          htmlContent += generateDefectHTML(defect, images, settings);
        }
        
        htmlContent += `
          </div>
        </div>`;
      });
    } else if (settings.groupBySeverity) {
      // Group defects by severity
      const severities = ['critical', 'major', 'minor'];
      const severityLabels = { 'critical': 'Critical Issues', 'major': 'Major Issues', 'minor': 'Minor Issues' };
      
      // List defects by severity
      for (const severity of severities) {
        const severityDefects = defects.filter(d => d.severity === severity);
        
        if (severityDefects.length > 0) {
          htmlContent += `
          <div class="severity-section">
            <h3 class="severity-heading ${severity}">${severityLabels[severity as keyof typeof severityLabels]} (${severityDefects.length})</h3>
            <div class="defect-list">`;
            
          for (const defect of severityDefects) {
            htmlContent += generateDefectHTML(defect, images, settings);
          }
          
          htmlContent += `
            </div>
          </div>`;
        }
      }
    } else if (settings.groupByCategory) {
      // Group defects by category
      const defectsByCategory = new Map<string, any[]>();
      
      defects.forEach(defect => {
        const category = defect.category || 'Other';
        if (!defectsByCategory.has(category)) {
          defectsByCategory.set(category, []);
        }
        defectsByCategory.get(category)?.push(defect);
      });
      
      // List defects by category
      defectsByCategory.forEach((categoryDefects, category) => {
        htmlContent += `
        <div class="category-section">
          <h3 class="category-heading">${category}</h3>
          <div class="defect-list">`;
          
        for (const defect of categoryDefects) {
          htmlContent += generateDefectHTML(defect, images, settings);
        }
        
        htmlContent += `
          </div>
        </div>`;
      });
    } else {
      // No grouping, list all defects
      htmlContent += `<div class="defect-list">`;
      
      for (const defect of defects) {
        htmlContent += generateDefectHTML(defect, images, settings);
      }
      
      htmlContent += `</div>`;
    }
    
    htmlContent += `</div>`; // Close detailed findings section
    
    // Add conclusion if provided
    if (settings.conclusion && settings.conclusion.trim().length > 0) {
      htmlContent += `
      <div class="section">
        <h2 class="section-title">Conclusion</h2>
        <div class="conclusion">
          ${settings.conclusion.replace(/\n/g, '<br>')}
        </div>
      </div>`;
    }
    
    // Add recommendations if enabled
    if (settings.includeRecommendations) {
      const recommendationsContent = generateRecommendations(defects);
      if (recommendationsContent) {
        htmlContent += `
        <div class="section">
          <h2 class="section-title">Recommendations</h2>
          <div class="recommendations">
            ${recommendationsContent}
          </div>
        </div>`;
      }
    }
    
    // Add appendix if enabled
    if (settings.includeAppendix) {
      htmlContent += `
      <div class="appendix">
        <h2 class="appendix-title">Appendix: Complete Snag List</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Location</th>
              <th>Title</th>
              <th>Category</th>
              <th>Severity</th>
              <th>Status</th>
              ${settings.showAssignees ? '<th>Assigned To</th>' : ''}
              ${settings.showDates ? '<th>Due Date</th>' : ''}
            </tr>
          </thead>
          <tbody>`;
          
      defects.forEach((defect, index) => {
        htmlContent += `
            <tr>
              <td>${index + 1}</td>
              <td>${defect.location || 'N/A'}</td>
              <td>${defect.title}</td>
              <td>${defect.category || 'N/A'}</td>
              <td>${defect.severity.charAt(0).toUpperCase() + defect.severity.slice(1)}</td>
              <td>${defect.status === 'in_progress' ? 'In Progress' : defect.status.charAt(0).toUpperCase() + defect.status.slice(1)}</td>
              ${settings.showAssignees ? `<td>${defect.assignedTo || 'Unassigned'}</td>` : ''}
              ${settings.showDates ? `<td>N/A</td>` : ''}
            </tr>`;
      });
          
      htmlContent += `
          </tbody>
        </table>
      </div>`;
    }
    
    // Add footer with custom text if provided
    htmlContent += `
      <div class="footer">
        ${settings.customFooter || 'Report generated by Snagging.me by UrbanGrid'}
      </div>
    </div> <!-- Close container -->
    </body>
    </html>`;
    
    // For now, serve as HTML, in production would convert to PDF
    res.setHeader('Content-Disposition', `attachment; filename=Project-Report-${projectId}.html`);
    res.setHeader('Content-Type', 'text/html');
    res.send(prepareHTMLForPDF(htmlContent));
  } catch (error) {
    console.error('Project report generation error:', error);
    res.status(500).send('Error generating project report');
  }
});

// Preview project report with custom settings
pdfRouter.post('/preview-project-report/:projectId', async (req: Request, res: Response) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const reportSettings = req.body?.settings;
    
    if (!reportSettings) {
      return res.status(400).json({ error: "Report settings are required" });
    }
    
    // Get project data
    const project = await storage.getProjectById(projectId);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    
    // Get defects for the project
    const defects = await storage.getDefectsByProjectId(projectId);
    
    // Get locations for the project
    const locations = await storage.getLocationsByProjectId(projectId);
    
    // Get images for the project
    const images = await storage.getImagesByProjectId(projectId);
    
    // Use the same HTML generation logic as the download endpoint
    // but with the provided settings from the request body
    
    // Define color schemes based on theme
    let colorScheme;
    switch (reportSettings.colorTheme) {
      case 'green':
        colorScheme = {
          primary: '#16a34a',
          secondary: '#86efac',
          headingColor: '#15803d',
          borderColor: '#bbf7d0'
        };
        break;
      case 'purple':
        colorScheme = {
          primary: '#9333ea',
          secondary: '#d8b4fe',
          headingColor: '#7e22ce',
          borderColor: '#e9d5ff'
        };
        break;
      case 'red':
        colorScheme = {
          primary: '#dc2626',
          secondary: '#fecaca',
          headingColor: '#b91c1c',
          borderColor: '#fee2e2'
        };
        break;
      case 'amber':
        colorScheme = {
          primary: '#d97706',
          secondary: '#fde68a',
          headingColor: '#b45309',
          borderColor: '#fef3c7'
        };
        break;
      case 'teal':
        colorScheme = {
          primary: '#0d9488',
          secondary: '#99f6e4',
          headingColor: '#0f766e',
          borderColor: '#ccfbf1'
        };
        break;
      case 'blue':
      default:
        colorScheme = {
          primary: '#2563eb',
          secondary: '#93c5fd',
          headingColor: '#1d4ed8',
          borderColor: '#dbeafe'
        };
    }
    
    // Calculate summary statistics
    const totalDefects = defects.length;
    const criticalDefects = defects.filter(d => d.severity === 'critical').length;
    const majorDefects = defects.filter(d => d.severity === 'major').length;
    const minorDefects = defects.filter(d => d.severity === 'minor').length;
    const openDefects = defects.filter(d => d.status === 'open').length;
    const inProgressDefects = defects.filter(d => d.status === 'in_progress').length;
    const resolvedDefects = defects.filter(d => d.status === 'resolved').length;
    const locationsWithDefects = new Set(defects.map(d => d.location)).size;
    
    // Build HTML report based on template and settings
    let htmlContent = '';
    
    // Common CSS styles with theme variables - same as in generate-project-pdf
    const commonStyles = `
      body { 
        font-family: Arial, sans-serif; 
        margin: 0; 
        padding: 0; 
        color: #333;
        font-size: ${reportSettings.fontSizeScale}rem;
        line-height: 1.5;
      }
      h1, h2, h3, h4, h5, h6 { color: ${colorScheme.headingColor}; }
      .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
      .header { text-align: center; margin-bottom: 30px; position: relative; }
      .cover-page { 
        height: 100vh; 
        display: flex; 
        flex-direction: column; 
        justify-content: center; 
        align-items: center; 
        text-align: center; 
        background-color: #f8fafc;
        border-bottom: 1px solid #e2e8f0;
      }
      .logo { max-width: 250px; height: auto; margin: 0 auto 20px; display: block; }
      .company-name { 
        font-size: 2.5rem; 
        margin-bottom: 10px; 
        color: ${colorScheme.primary}; 
        font-weight: bold;
      }
      .report-title { 
        font-size: 2.2rem; 
        margin-bottom: 30px; 
        color: #1f2937; 
        font-weight: normal;
      }
      .project-name {
        font-size: 1.8rem;
        margin-bottom: 20px;
        color: #1f2937;
      }
      .project-info { 
        margin-bottom: 30px; 
        border: 1px solid ${colorScheme.borderColor}; 
        padding: 20px; 
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        background-color: #fff;
      }
      .info-row { display: flex; margin-bottom: 12px; }
      .info-label { font-weight: bold; width: 180px; color: #4b5563; }
      .info-value { flex: 1; }
      .section { margin-bottom: 40px; }
      .section-title { 
        font-size: 1.5rem; 
        margin-bottom: 15px; 
        padding-bottom: 8px;
        border-bottom: 2px solid ${colorScheme.borderColor};
        color: ${colorScheme.primary};
      }
      .summary-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 15px;
        margin-bottom: 30px;
      }
      .stat-card {
        background-color: #fff;
        border-radius: 8px;
        padding: 15px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        border: 1px solid ${colorScheme.borderColor};
      }
      .stat-title {
        font-size: 0.9rem;
        color: #6b7280;
        margin-bottom: 8px;
      }
      .stat-value {
        font-size: 1.8rem;
        font-weight: bold;
        color: ${colorScheme.primary};
      }
      .stat-critical .stat-value { color: #dc2626; }
      .stat-major .stat-value { color: #ea580c; }
      .stat-minor .stat-value { color: #16a34a; }
      .stat-open .stat-value { color: #dc2626; }
      .stat-inprogress .stat-value { color: #d97706; }
      .stat-resolved .stat-value { color: #16a34a; }
      
      .executive-summary {
        padding: 20px;
        background-color: #f8fafc;
        border-radius: 8px;
        margin-bottom: 40px;
        border-left: 4px solid ${colorScheme.primary};
      }
      
      .defect-list {
        margin-top: 30px;
      }
      
      .defect-item { 
        margin-bottom: 25px; 
        border: 1px solid #e5e7eb; 
        padding: 20px; 
        border-radius: 8px;
        background-color: #fff;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.03);
      }
      
      .defect-header { 
        display: flex; 
        justify-content: space-between; 
        align-items: flex-start;
        margin-bottom: 15px;
      }
      
      .defect-title { 
        font-size: 1.2rem; 
        font-weight: bold; 
        color: #111827;
      }
      
      .defect-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }
      
      .severity, .status, .category {
        display: inline-flex;
        align-items: center;
        padding: 4px 10px;
        border-radius: 20px;
        font-size: 0.85rem;
        font-weight: 500;
      }
      
      .severity-critical { 
        background-color: #fee2e2; 
        color: #b91c1c; 
      }
      .severity-major { 
        background-color: #ffedd5; 
        color: #c2410c; 
      }
      .severity-minor { 
        background-color: #dcfce7; 
        color: #15803d; 
      }
      
      .status-open { 
        background-color: #fee2e2; 
        color: #b91c1c; 
      }
      .status-in_progress { 
        background-color: #fef3c7; 
        color: #92400e; 
      }
      .status-resolved { 
        background-color: #d1fae5; 
        color: #065f46; 
      }
      
      .category-tag {
        background-color: #f3f4f6;
        color: #4b5563;
      }
      
      .defect-description {
        margin-bottom: 15px;
        color: #4b5563;
      }
      
      .defect-detail {
        margin-bottom: 5px;
        color: #6b7280;
      }
      .defect-detail strong {
        color: #4b5563;
        font-weight: 500;
      }
      
      .images-container { 
        display: grid; 
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); 
        gap: 15px; 
        margin-top: 20px; 
      }
      
      .image-item { 
        position: relative;
        border: 1px solid #e5e7eb;
        border-radius: 6px;
        overflow: hidden;
      }
      
      .image-item img { 
        width: 100%; 
        display: block;
        aspect-ratio: 4/3;
        object-fit: cover;
      }
      
      .image-annotation { 
        padding: 10px; 
        font-size: 0.85rem; 
        color: #4b5563;
        background-color: #f9fafb;
        border-top: 1px solid #e5e7eb;
      }
      
      .location-heading {
        margin-top: 40px;
        margin-bottom: 20px;
        font-size: 1.4rem;
        color: ${colorScheme.headingColor};
        padding-bottom: 8px;
        border-bottom: 1px solid ${colorScheme.borderColor};
      }
      
      .severity-heading {
        margin-top: 40px;
        margin-bottom: 20px;
        font-size: 1.4rem;
        padding-bottom: 8px;
        border-bottom: 1px solid ${colorScheme.borderColor};
      }
      .severity-heading.critical { color: #b91c1c; }
      .severity-heading.major { color: #c2410c; }
      .severity-heading.minor { color: #15803d; }
      
      .category-heading {
        margin-top: 40px;
        margin-bottom: 20px;
        font-size: 1.4rem;
        color: #4b5563;
        padding-bottom: 8px;
        border-bottom: 1px solid ${colorScheme.borderColor};
      }
      
      .page-break { 
        page-break-after: always; 
        height: 0; 
        visibility: hidden;
      }
      
      .conclusion {
        margin-top: 40px;
        margin-bottom: 40px;
        padding: 20px;
        background-color: #f8fafc;
        border-radius: 8px;
        border-left: 4px solid ${colorScheme.primary};
      }
      
      .recommendations {
        margin-top: 30px;
      }
      
      .recommendation-item {
        margin-bottom: 15px;
        padding-left: 20px;
        position: relative;
      }
      
      .recommendation-item:before {
        content: "•";
        position: absolute;
        left: 0;
        color: ${colorScheme.primary};
        font-weight: bold;
      }
      
      .appendix {
        margin-top: 60px;
        page-break-before: always;
      }
      
      .appendix-title {
        font-size: 1.8rem;
        margin-bottom: 20px;
        color: ${colorScheme.headingColor};
      }
      
      table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 30px;
      }
      
      table th, table td {
        border: 1px solid #e5e7eb;
        padding: 10px;
        text-align: left;
      }
      
      table th {
        background-color: #f8fafc;
        font-weight: 500;
        color: #4b5563;
      }
      
      table tr:nth-child(even) {
        background-color: #f9fafb;
      }
      
      .footer {
        margin-top: 60px;
        border-top: 1px solid #e5e7eb;
        padding-top: 20px;
        color: #6b7280;
        font-size: 0.9rem;
        text-align: center;
      }
      
      @media print {
        body { font-size: ${reportSettings.fontSizeScale}rem; }
        .page-break { page-break-after: always; }
        .cover-page { height: 100vh; }
        .container { max-width: 100%; }
      }
    `;
    
    // Start building the HTML report
    htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Property Inspection Report - ${project.name}</title>
      <style>${commonStyles}</style>
    </head>
    <body>`;
    
    // Add cover page if enabled
    if (reportSettings.coverPage) {
      htmlContent += `
      <div class="cover-page">
        <div class="container">
          ${reportSettings.companyLogo ? `
          <div class="logo-container">
            <img src="${(process.env.BASE_URL || 'http://localhost:5000') + '/internachi.png'}" alt="UrbanGrid Logo" class="logo" />
          </div>` : ''}
          <div class="company-name">Snagging By UrbanGrid</div>
          <div class="report-title">Property Inspection Report</div>
          <div class="project-name">${project.name}</div>
          <div style="margin-top: 20px; color: #6b7280;">
            <p>Client: ${project.clientName}</p>
            <p>Location: ${project.location}</p>
            <p>Date: ${new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>
      <div class="page-break"></div>`;
    }
    
    // Add main report content
    htmlContent += `
    <div class="container">
      ${reportSettings.customHeader ? `<div class="custom-header">${reportSettings.customHeader}</div>` : ''}`;
    
    // Add project information
    htmlContent += `
      <div class="section">
        <h2 class="section-title">Project Information</h2>
        <div class="project-info">
          <div class="info-row">
            <div class="info-label">Project Name:</div>
            <div class="info-value">${project.name}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Client:</div>
            <div class="info-value">${project.clientName}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Location:</div>
            <div class="info-value">${project.location}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Property Type:</div>
            <div class="info-value">${project.propertyType || 'Not specified'}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Inspection Date:</div>
            <div class="info-value">${project.date ? new Date(project.date).toLocaleDateString() : new Date().toLocaleDateString()}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Status:</div>
            <div class="info-value">${project.status?.charAt(0).toUpperCase() + project.status?.slice(1) || 'Pending'}</div>
          </div>
          ${project.propertySize ? `
          <div class="info-row">
            <div class="info-label">Property Size:</div>
            <div class="info-value">${project.propertySize} sq. ft.</div>
          </div>` : ''}
        </div>
      </div>`;
      
    // Add executive summary if provided
    if (reportSettings.executiveSummary && reportSettings.executiveSummary.trim().length > 0) {
      htmlContent += `
      <div class="section">
        <h2 class="section-title">Executive Summary</h2>
        <div class="executive-summary">
          ${reportSettings.executiveSummary.replace(/\n/g, '<br>')}
        </div>
      </div>`;
    } else {
      // Default executive summary
      htmlContent += `
      <div class="section">
        <h2 class="section-title">Executive Summary</h2>
        <div class="executive-summary">
          <p>This report presents the findings of a thorough property inspection conducted at ${project.location}. 
          The inspection identified a total of ${totalDefects} defects across 
          ${locationsWithDefects} ${locationsWithDefects > 1 ? 'locations' : 'location'}.</p>
          
          <p>Of these defects, ${criticalDefects} were categorized as critical, ${majorDefects} as major, 
          and ${minorDefects} as minor. Currently, ${resolvedDefects} issues have been resolved, 
          ${inProgressDefects} are in progress, and ${openDefects} remain open for attention.</p>
          
          <p>The following report provides detailed documentation of each identified issue, 
          complete with photographic evidence and recommended remedial actions.</p>
        </div>
      </div>`;
    }
    
    // Add summary statistics
    htmlContent += `
    <div class="section">
      <h2 class="section-title">Summary Statistics</h2>
      <div class="summary-stats">
        <div class="stat-card">
          <div class="stat-title">Total Defects</div>
          <div class="stat-value">${totalDefects}</div>
        </div>
        
        <div class="stat-card stat-critical">
          <div class="stat-title">Critical Issues</div>
          <div class="stat-value">${criticalDefects}</div>
        </div>
        
        <div class="stat-card stat-major">
          <div class="stat-title">Major Issues</div>
          <div class="stat-value">${majorDefects}</div>
        </div>
        
        <div class="stat-card stat-minor">
          <div class="stat-title">Minor Issues</div>
          <div class="stat-value">${minorDefects}</div>
        </div>
        
        <div class="stat-card stat-open">
          <div class="stat-title">Open</div>
          <div class="stat-value">${openDefects}</div>
        </div>
        
        <div class="stat-card stat-inprogress">
          <div class="stat-title">In Progress</div>
          <div class="stat-value">${inProgressDefects}</div>
        </div>
        
        <div class="stat-card stat-resolved">
          <div class="stat-title">Resolved</div>
          <div class="stat-value">${resolvedDefects}</div>
        </div>
        
        <div class="stat-card">
          <div class="stat-title">Affected Areas</div>
          <div class="stat-value">${locationsWithDefects}</div>
        </div>
      </div>
    </div>`;
      
    // Add defects grouped according to settings
    htmlContent += `
    <div class="section">
      <h2 class="section-title">Detailed Findings</h2>`;
    
    if (reportSettings.groupByLocation) {
      // Group defects by location
      const defectsByLocation = new Map<string, any[]>();
      defects.forEach(defect => {
        const locationName = defect.location || 'Other';
        if (!defectsByLocation.has(locationName)) {
          defectsByLocation.set(locationName, []);
        }
        defectsByLocation.get(locationName)?.push(defect);
      });
      
      // List defects by location
      defectsByLocation.forEach((locationDefects, locationName) => {
        htmlContent += `
        <div class="location-section">
          <h3 class="location-heading">${locationName}</h3>
          <div class="defect-list">`;
          
        for (const defect of locationDefects) {
          htmlContent += generateDefectHTML(defect, images, reportSettings);
        }
        
        htmlContent += `
          </div>
        </div>`;
      });
    } else if (reportSettings.groupBySeverity) {
      // Group defects by severity
      const severities = ['critical', 'major', 'minor'];
      const severityLabels = { 'critical': 'Critical Issues', 'major': 'Major Issues', 'minor': 'Minor Issues' };
      
      // List defects by severity
      for (const severity of severities) {
        const severityDefects = defects.filter(d => d.severity === severity);
        
        if (severityDefects.length > 0) {
          htmlContent += `
          <div class="severity-section">
            <h3 class="severity-heading ${severity}">${severityLabels[severity as keyof typeof severityLabels]} (${severityDefects.length})</h3>
            <div class="defect-list">`;
            
          for (const defect of severityDefects) {
            htmlContent += generateDefectHTML(defect, images, reportSettings);
          }
          
          htmlContent += `
            </div>
          </div>`;
        }
      }
    } else if (reportSettings.groupByCategory) {
      // Group defects by category
      const defectsByCategory = new Map<string, any[]>();
      
      defects.forEach(defect => {
        const category = defect.category || 'Other';
        if (!defectsByCategory.has(category)) {
          defectsByCategory.set(category, []);
        }
        defectsByCategory.get(category)?.push(defect);
      });
      
      // List defects by category
      defectsByCategory.forEach((categoryDefects, category) => {
        htmlContent += `
        <div class="category-section">
          <h3 class="category-heading">${category}</h3>
          <div class="defect-list">`;
          
        for (const defect of categoryDefects) {
          htmlContent += generateDefectHTML(defect, images, reportSettings);
        }
        
        htmlContent += `
          </div>
        </div>`;
      });
    } else {
      // No grouping, list all defects
      htmlContent += `<div class="defect-list">`;
      
      for (const defect of defects) {
        htmlContent += generateDefectHTML(defect, images, reportSettings);
      }
      
      htmlContent += `</div>`;
    }
    
    htmlContent += `</div>`; // Close detailed findings section
    
    // Add conclusion if provided
    if (reportSettings.conclusion && reportSettings.conclusion.trim().length > 0) {
      htmlContent += `
      <div class="section">
        <h2 class="section-title">Conclusion</h2>
        <div class="conclusion">
          ${reportSettings.conclusion.replace(/\n/g, '<br>')}
        </div>
      </div>`;
    }
    
    // Add recommendations if enabled
    if (reportSettings.includeRecommendations) {
      const recommendationsContent = generateRecommendations(defects);
      if (recommendationsContent) {
        htmlContent += `
        <div class="section">
          <h2 class="section-title">Recommendations</h2>
          <div class="recommendations">
            ${recommendationsContent}
          </div>
        </div>`;
      }
    }
    
    // Add appendix if enabled
    if (reportSettings.includeAppendix) {
      htmlContent += `
      <div class="appendix">
        <h2 class="appendix-title">Appendix: Complete Snag List</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Location</th>
              <th>Title</th>
              <th>Category</th>
              <th>Severity</th>
              <th>Status</th>
              ${reportSettings.showAssignees ? '<th>Assigned To</th>' : ''}
              ${reportSettings.showDates ? '<th>Due Date</th>' : ''}
            </tr>
          </thead>
          <tbody>`;
          
      defects.forEach((defect, index) => {
        htmlContent += `
            <tr>
              <td>${index + 1}</td>
              <td>${defect.location || 'N/A'}</td>
              <td>${defect.title}</td>
              <td>${defect.category || 'N/A'}</td>
              <td>${defect.severity.charAt(0).toUpperCase() + defect.severity.slice(1)}</td>
              <td>${defect.status === 'in_progress' ? 'In Progress' : defect.status.charAt(0).toUpperCase() + defect.status.slice(1)}</td>
              ${reportSettings.showAssignees ? `<td>${defect.assignedTo || 'Unassigned'}</td>` : ''}
              ${reportSettings.showDates ? `<td>${defect.dueDate ? new Date(defect.dueDate).toLocaleDateString() : 'N/A'}</td>` : ''}
            </tr>`;
      });
          
      htmlContent += `
          </tbody>
        </table>
      </div>`;
    }
    
    // Add footer with custom text if provided
    htmlContent += `
      <div class="footer">
        ${reportSettings.customFooter || 'Report generated by Snagging.me by UrbanGrid'}
      </div>
    </div> <!-- Close container -->
    </body>
    </html>`;
    
    // Prepare for viewing in browser
    const preparedHTML = prepareHTMLForPDF(htmlContent);
    
    // For preview, we return raw HTML to be displayed in an iframe
    res.setHeader('Content-Type', 'text/html');
    res.send(preparedHTML);
  } catch (error) {
    console.error('Project report preview error:', error);
    res.status(500).json({ error: 'Error generating project report preview' });
  }
});

// Backward compatibility - GET endpoint that redirects to POST with default settings
pdfRouter.get('/preview-project-report/:projectId', async (req: Request, res: Response) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const template = req.query.template as string || 'default';
    
    // Get project data
    const project = await storage.getProjectById(projectId);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    
    // Use GET params for settings if provided, otherwise use default settings
    const settings = req.query.settings ? 
      JSON.parse(req.query.settings as string) : 
      {
        template: template,
        companyLogo: true,
        coverPage: true,
        executiveSummary: "",
        includeImages: true,
        includeAnnotations: true,
        groupByLocation: true,
        groupBySeverity: false,
        groupByCategory: false,
        showDates: true,
        showAssignees: true,
        includeAppendix: true,
        conclusion: "",
        customHeader: "",
        customFooter: "Report generated by Snagging.me by UrbanGrid",
        includeRecommendations: true,
        fontSizeScale: 1,
        colorTheme: "blue"
      };
    
    // This endpoint should be used by the React app, which will make a POST request
    // with the current settings from the UI. For backwards compatibility and direct
    // URL access, we'll redirect to the POST endpoint with some default settings.
    res.setHeader('Content-Type', 'text/html');
    res.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Redirecting to Report Preview</title>
        <script>
          // Use fetch to POST to the preview endpoint
          fetch('/api/preview-project-report/${projectId}', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ settings: ${JSON.stringify(settings)} })
          })
          .then(response => response.text())
          .then(html => {
            document.open();
            document.write(html);
            document.close();
          })
          .catch(error => {
            console.error('Error:', error);
            document.body.innerHTML = '<h1>Error loading preview</h1><p>' + error + '</p>';
          });
        </script>
      </head>
      <body>
        <h1>Loading preview...</h1>
      </body>
      </html>
    `);
    res.end();
  } catch (error) {
    console.error('Project report preview error:', error);
    res.status(500).send('Error generating project report preview');
  }
});

// Helper function to generate HTML for a defect
function generateDefectHTML(defect: any, images: any[], settings: any) {
  // Get images for this defect
  const defectImages = images.filter(img => img.defectId === defect.id);
  
  let html = `
  <div class="defect-item">
    <div class="defect-header">
      <div class="defect-title">${defect.title}</div>
      <div class="defect-meta">
        <span class="severity severity-${defect.severity}">
          ${defect.severity.charAt(0).toUpperCase() + defect.severity.slice(1)}
        </span>
        <span class="status status-${defect.status}">
          ${defect.status === 'in_progress' ? 'In Progress' : defect.status.charAt(0).toUpperCase() + defect.status.slice(1)}
        </span>
        ${defect.category ? `<span class="category category-tag">${defect.category}</span>` : ''}
      </div>
    </div>
    
    <div class="defect-description">
      ${defect.description || 'No description provided.'}
    </div>
    
    <div class="defect-details">
      <div class="defect-detail"><strong>Location:</strong> ${defect.location || 'N/A'}</div>
      ${defect.assignedTo && settings.showAssignees ? `<div class="defect-detail"><strong>Assigned To:</strong> ${defect.assignedTo}</div>` : ''}
      ${settings.showDates ? `<div class="defect-detail"><strong>Due Date:</strong> N/A</div>` : ''}
    </div>`;
    
  // Add images if enabled and available
  if (settings.includeImages && defectImages.length > 0) {
    html += `
    <div class="images-container">`;
    
    for (const img of defectImages) {
      let annotationsHtml = '';
      
      if (settings.includeAnnotations && img.annotations) {
        try {
          const annotations = JSON.parse(img.annotations);
          
          if (annotations.length > 0) {
            annotationsHtml = `
            <div class="image-annotation">
              <strong>Notes:</strong> ${annotations.map((a: any) => a.text).join(', ')}
            </div>`;
          }
        } catch (e) {
          console.error("Error parsing annotations:", e);
        }
      }
      
      // Make sure the image URL is absolute
      // The img.url may already have a leading slash, so we need to ensure we don't double it
      const imgUrl = img.url.startsWith('/') ? img.url : `/${img.url}`;
      
      // Create the absolute URL for the image (including server host)
      const serverUrl = process.env.BASE_URL || 'http://localhost:5000';
      const absoluteImgUrl = new URL(imgUrl, serverUrl).toString();
      
      html += `
      <div class="image-item">
        <img src="${absoluteImgUrl}" alt="Defect image" />
        ${annotationsHtml}
      </div>`;
    }
    
    html += `
    </div>`;
  }
  
  html += `
  </div>`;
  
  return html;
}

// Helper function to generate recommendations based on defects
function generateRecommendations(defects: any[]) {
  // Count defects by category
  const categoryCounts = new Map<string, number>();
  defects.forEach(defect => {
    const category = defect.category || 'Other';
    categoryCounts.set(category, (categoryCounts.get(category) || 0) + 1);
  });
  
  // Count critical and major defects
  const criticalDefects = defects.filter(d => d.severity === 'critical').length;
  const majorDefects = defects.filter(d => d.severity === 'major').length;
  
  // Generate recommendations
  let recommendations = '';
  
  // Overall recommendation based on severity
  if (criticalDefects > 0) {
    recommendations += `
    <div class="recommendation-item">
      <strong>Address Critical Issues Immediately:</strong> ${criticalDefects} critical issues were identified 
      that require immediate attention to ensure safety and functionality of the property.
    </div>`;
  }
  
  if (majorDefects > 0) {
    recommendations += `
    <div class="recommendation-item">
      <strong>Remediate Major Defects:</strong> ${majorDefects} major defects should be addressed 
      within the next 30 days to prevent potential damage or deterioration.
    </div>`;
  }
  
  // Category-specific recommendations for top 3 categories
  const topCategories = Array.from(categoryCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  
  for (const [category, count] of topCategories) {
    if (category === 'Electrical') {
      recommendations += `
      <div class="recommendation-item">
        <strong>Electrical System Inspection:</strong> ${count} electrical issues were identified. 
        We recommend a complete electrical system review by a certified electrician.
      </div>`;
    } else if (category === 'Plumbing') {
      recommendations += `
      <div class="recommendation-item">
        <strong>Plumbing System Review:</strong> ${count} plumbing issues require attention. 
        Consider engaging a licensed plumber to assess and repair all plumbing defects.
      </div>`;
    } else if (category === 'Walls' || category === 'Ceiling') {
      recommendations += `
      <div class="recommendation-item">
        <strong>Surface Finishing Repairs:</strong> ${count} issues with ${category.toLowerCase()} surfaces 
        were identified. Professional finishing and painting is recommended to address these defects.
      </div>`;
    } else if (category === 'Flooring') {
      recommendations += `
      <div class="recommendation-item">
        <strong>Flooring Remediation:</strong> ${count} flooring defects need attention. 
        Consider a flooring specialist to assess and repair these issues.
      </div>`;
    } else if (category === 'HVAC') {
      recommendations += `
      <div class="recommendation-item">
        <strong>HVAC System Maintenance:</strong> ${count} HVAC issues were identified. 
        Schedule a service with an HVAC technician to ensure proper system function.
      </div>`;
    } else {
      recommendations += `
      <div class="recommendation-item">
        <strong>${category} Issues:</strong> ${count} defects related to ${category.toLowerCase()} 
        require attention and should be remediated by appropriate specialists.
      </div>`;
    }
  }
  
  // General recommendation for documentation and follow-up
  recommendations += `
  <div class="recommendation-item">
    <strong>Schedule Follow-up Inspection:</strong> After remediation work is completed, 
    we recommend scheduling a follow-up inspection to verify all issues have been properly addressed.
  </div>
  
  <div class="recommendation-item">
    <strong>Maintain Defect Documentation:</strong> Keep this report and all documentation of repairs 
    for future reference and to demonstrate due diligence in property maintenance.
  </div>`;
  
  return recommendations;
}

export default pdfRouter;