import { Router, Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { IStorage, storage } from './storage';
import jwt from 'jsonwebtoken';
import puppeteer from 'puppeteer';

export const reraReportRouter = Router();

// Authentication middleware
function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header provided' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    (req as any).user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// API to generate report preview
reraReportRouter.post('/projects/:projectId/rera-reports/preview', authenticate, async (req: Request, res: Response) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const { reportType, settings } = req.body;
    
    console.log('Generating report preview for project', projectId, 'with settings:', settings);
    
    // Check if the project exists and is a RERA audit
    const project = await storage.getProjectById(projectId);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    if (project.projectType !== 'rera_audit') {
      return res.status(400).json({ error: 'This operation is only available for RERA audit projects' });
    }
    
    // Get all the necessary data for the report
    const locations = await storage.getLocationsByProjectId(projectId);
    const classifications = await storage.getNrm3ClassificationsByProjectId(projectId);
    const assessments = await storage.getConditionAssessmentsByProjectId(projectId);
    const lifecycleCosts = project.reraAuditType === 'reserve_fund_study' 
      ? await storage.getLifecycleCostsByProjectId(projectId)
      : [];
    
    // Calculate summary statistics
    const totalAssets = assessments.length;
    const totalLocations = locations.length;
    
    // Calculate condition distribution
    const conditionCounts = {
      'A': assessments.filter((a: any) => a.conditionRating === 'A').length,
      'B': assessments.filter((a: any) => a.conditionRating === 'B').length,
      'C': assessments.filter((a: any) => a.conditionRating === 'C').length,
      'D': assessments.filter((a: any) => a.conditionRating === 'D').length
    };
    
    // Calculate total replacement cost
    const totalReplacementCost = lifecycleCosts.reduce((sum: number, cost: any) => {
      return sum + (parseInt(cost.replacementCost) || 0);
    }, 0);
    
    // Calculate short-term vs long-term costs
    const currentYear = new Date().getFullYear();
    const shortTermCosts = lifecycleCosts
      .filter((cost: any) => cost.replacementYear <= currentYear + 5)
      .reduce((sum: number, cost: any) => sum + (parseInt(cost.replacementCost) || 0), 0);
    
    const mediumTermCosts = lifecycleCosts
      .filter((cost: any) => cost.replacementYear > currentYear + 5 && cost.replacementYear <= currentYear + 15)
      .reduce((sum: number, cost: any) => sum + (parseInt(cost.replacementCost) || 0), 0);
    
    const longTermCosts = lifecycleCosts
      .filter((cost: any) => cost.replacementYear > currentYear + 15)
      .reduce((sum: number, cost: any) => sum + (parseInt(cost.replacementCost) || 0), 0);
    
    // Enhanced template HTML with professional design
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>RERA Report - ${project.name}</title>
      <style>
        /* Modern, professional styling */
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          margin: 0;
          padding: 0;
          color: #333;
          line-height: 1.6;
          background-color: #fafafa;
        }
        
        .report-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          background-color: white;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
        }
        
        /* Cover page */
        .cover-page {
          text-align: center;
          padding: 40px 20px;
          margin-bottom: 30px;
          border-bottom: 1px solid #eaeaea;
          background: linear-gradient(to bottom, #f8f9fa, #ffffff);
        }
        
        .logo {
          max-width: 200px;
          margin: 0 auto 20px;
        }
        
        .report-title {
          font-size: 28px;
          font-weight: 600;
          margin-bottom: 10px;
          color: #1a365d;
        }
        
        .report-subtitle {
          font-size: 20px;
          color: #4a5568;
          margin-bottom: 30px;
        }
        
        .project-info {
          background-color: #f8fafc;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 30px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
        }
        
        .project-name {
          font-size: 22px;
          font-weight: 600;
          margin-bottom: 15px;
          color: #2c5282;
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 15px;
        }
        
        .info-item {
          margin-bottom: 5px;
        }
        
        .info-label {
          font-weight: 600;
          color: #4a5568;
        }
        
        /* Section styling */
        .section {
          margin-bottom: 40px;
        }
        
        .section-title {
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 2px solid #e2e8f0;
          color: #2d3748;
        }
        
        /* Executive summary */
        .summary-stats {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        
        .stat-card {
          background-color: white;
          border-radius: 8px;
          padding: 15px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          text-align: center;
        }
        
        .stat-value {
          font-size: 24px;
          font-weight: 700;
          color: #2b6cb0;
          margin-bottom: 5px;
        }
        
        .stat-label {
          font-size: 14px;
          color: #4a5568;
        }
        
        /* Tables */
        .data-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
        
        .data-table th, .data-table td {
          padding: 12px 15px;
          text-align: left;
          border-bottom: 1px solid #e2e8f0;
        }
        
        .data-table th {
          background-color: #edf2f7;
          font-weight: 600;
          color: #4a5568;
          position: sticky;
          top: 0;
        }
        
        .data-table tr:nth-child(even) {
          background-color: #f8fafc;
        }
        
        .data-table tr:hover {
          background-color: #ebf4ff;
        }
        
        /* Condition colors */
        .condition-A { background-color: #c6f6d5; }
        .condition-B { background-color: #bee3f8; }
        .condition-C { background-color: #feebc8; }
        .condition-D { background-color: #fed7d7; }
        
        /* Priority colors */
        .priority-1 { color: #e53e3e; font-weight: 600; }
        .priority-2 { color: #dd6b20; font-weight: 600; }
        .priority-3 { color: #d69e2e; font-weight: 600; }
        .priority-4 { color: #38a169; font-weight: 600; }
        
        /* Charts */
        .chart-container {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        
        .chart {
          background-color: white;
          border-radius: 8px;
          padding: 15px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          height: 250px;
        }
        
        .pie-chart-container {
          display: flex;
          justify-content: center;
          align-items: center;
        }
        
        .pie-chart {
          width: 150px;
          height: 150px;
          border-radius: 50%;
          background: conic-gradient(
            #c6f6d5 0% ${conditionCounts.A / totalAssets * 100}%, 
            #bee3f8 ${conditionCounts.A / totalAssets * 100}% ${(conditionCounts.A + conditionCounts.B) / totalAssets * 100}%,
            #feebc8 ${(conditionCounts.A + conditionCounts.B) / totalAssets * 100}% ${(conditionCounts.A + conditionCounts.B + conditionCounts.C) / totalAssets * 100}%,
            #fed7d7 ${(conditionCounts.A + conditionCounts.B + conditionCounts.C) / totalAssets * 100}% 100%
          );
          position: relative;
        }
        
        .legend {
          display: grid;
          grid-template-columns: 20px auto;
          gap: 5px 10px;
          align-items: center;
          margin-top: 20px;
        }
        
        .legend-color {
          width: 15px;
          height: 15px;
          border-radius: 3px;
        }
        
        .legend-label {
          font-size: 14px;
        }
        
        .a-color { background-color: #c6f6d5; }
        .b-color { background-color: #bee3f8; }
        .c-color { background-color: #feebc8; }
        .d-color { background-color: #fed7d7; }
        
        /* Cost distribution bar chart */
        .bar-chart {
          display: flex;
          flex-direction: column;
          height: 200px;
          justify-content: flex-end;
          margin-top: 20px;
        }
        
        .bars-container {
          display: flex;
          justify-content: space-around;
          align-items: flex-end;
          height: 150px;
        }
        
        .bar {
          width: 60px;
          background-color: #4299e1;
          margin: 0 10px;
          position: relative;
          border-radius: 3px 3px 0 0;
        }
        
        .bar-label {
          text-align: center;
          font-size: 12px;
          padding: 5px 0;
          color: #4a5568;
        }
        
        .action-button {
          background-color: #3182ce;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 10px 15px;
          font-size: 16px;
          cursor: pointer;
          transition: background-color 0.3s;
          margin-top: 20px;
        }
        
        .action-button:hover {
          background-color: #2c5282;
        }
        
        /* Table filter controls */
        .filter-controls {
          display: flex;
          gap: 15px;
          margin-bottom: 15px;
          flex-wrap: wrap;
        }
        
        .filter-select {
          padding: 8px 12px;
          border-radius: 4px;
          border: 1px solid #e2e8f0;
          background-color: white;
          min-width: 150px;
        }
        
        /* Footer */
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #eaeaea;
          color: #718096;
          font-size: 14px;
        }
        
        /* Print styles */
        @media print {
          body {
            background-color: white;
          }
          
          .report-container {
            box-shadow: none;
            padding: 0;
          }
          
          .action-button, .filter-controls {
            display: none;
          }
          
          .page-break {
            page-break-after: always;
          }
        }
      </style>
    </head>
    <body>
      <div class="report-container">
        <!-- Cover Page -->
        <div class="cover-page">
          <img src="/internachi2.png" alt="UrbanGrid Logo" class="logo">
          <h1 class="report-title">${project.reraAuditType === 'reserve_fund_study' ? 'Reserve Fund Study' : 'Condition Survey'}</h1>
          <h2 class="report-subtitle">RERA Compliance Report</h2>
          <p>Prepared by: UrbanGrid Property Services</p>
          <p>Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        
        <!-- Project Information -->
        <div class="project-info">
          <h2 class="project-name">${project.name}</h2>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Client:</span> 
              <span>${project.clientName || 'Not specified'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Location:</span> 
              <span>${project.location || 'Not specified'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Property Type:</span> 
              <span>${project.propertyType || 'Not specified'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Inspection Date:</span> 
              <span>${new Date(project.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Status:</span> 
              <span>${project.status.charAt(0).toUpperCase() + project.status.slice(1).replace('_', ' ')}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Report Type:</span> 
              <span>${project.reraAuditType === 'reserve_fund_study' ? 'Reserve Fund Study' : 'Condition Survey'}</span>
            </div>
          </div>
        </div>
        
        <!-- Executive Summary -->
        <div class="section">
          <h2 class="section-title">Executive Summary</h2>
          <p>This report presents a comprehensive ${project.reraAuditType === 'reserve_fund_study' ? 'Reserve Fund Study' : 'Condition Survey'} for ${project.name}, located in ${project.location}. The assessment was conducted in accordance with RERA guidelines and industry best practices.</p>
          
          <div class="summary-stats">
            <div class="stat-card">
              <div class="stat-value">${totalAssets}</div>
              <div class="stat-label">Assets Assessed</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${totalLocations}</div>
              <div class="stat-label">Locations</div>
            </div>
            ${project.reraAuditType === 'reserve_fund_study' ? `
            <div class="stat-card">
              <div class="stat-value">AED ${totalReplacementCost.toLocaleString()}</div>
              <div class="stat-label">Total Replacement Cost</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">AED ${shortTermCosts.toLocaleString()}</div>
              <div class="stat-label">Short-Term Needs (5 Years)</div>
            </div>
            ` : ''}
          </div>
          
          <!-- Condition Distribution Chart -->
          <div class="chart-container">
            <div class="chart">
              <h3 style="text-align: center; margin-bottom: 15px;">Asset Condition Distribution</h3>
              <div class="pie-chart-container">
                <div class="pie-chart"></div>
              </div>
              <div class="legend">
                <div class="legend-color a-color"></div>
                <div class="legend-label">A - Good (${conditionCounts.A})</div>
                <div class="legend-color b-color"></div>
                <div class="legend-label">B - Satisfactory (${conditionCounts.B})</div>
                <div class="legend-color c-color"></div>
                <div class="legend-label">C - Poor (${conditionCounts.C})</div>
                <div class="legend-color d-color"></div>
                <div class="legend-label">D - Bad (${conditionCounts.D})</div>
              </div>
            </div>
            
            ${project.reraAuditType === 'reserve_fund_study' ? `
            <div class="chart">
              <h3 style="text-align: center; margin-bottom: 15px;">Cost Distribution by Timeframe</h3>
              <div class="bar-chart">
                <div class="bars-container">
                  <div>
                    <div class="bar" style="height: ${Math.max(5, (shortTermCosts / Math.max(shortTermCosts, mediumTermCosts, longTermCosts) * 150))}px;"></div>
                    <div class="bar-label">Short Term<br>AED ${shortTermCosts.toLocaleString()}</div>
                  </div>
                  <div>
                    <div class="bar" style="height: ${Math.max(5, (mediumTermCosts / Math.max(shortTermCosts, mediumTermCosts, longTermCosts) * 150))}px; background-color: #3182ce;"></div>
                    <div class="bar-label">Medium Term<br>AED ${mediumTermCosts.toLocaleString()}</div>
                  </div>
                  <div>
                    <div class="bar" style="height: ${Math.max(5, (longTermCosts / Math.max(shortTermCosts, mediumTermCosts, longTermCosts) * 150))}px; background-color: #2c5282;"></div>
                    <div class="bar-label">Long Term<br>AED ${longTermCosts.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </div>
            ` : ''}
          </div>
        </div>
        
        <div class="page-break"></div>
        
        <!-- Asset Assessment Section -->
        <div class="section">
          <h2 class="section-title">Asset Assessment</h2>
          <div class="filter-controls">
            <select class="filter-select" id="conditionFilter">
              <option value="all">All Conditions</option>
              <option value="A">A - Good</option>
              <option value="B">B - Satisfactory</option>
              <option value="C">C - Poor</option>
              <option value="D">D - Bad</option>
            </select>
            <select class="filter-select" id="priorityFilter">
              <option value="all">All Priorities</option>
              <option value="1">1 - Critical</option>
              <option value="2">2 - High</option>
              <option value="3">3 - Medium</option>
              <option value="4">4 - Low</option>
            </select>
            <select class="filter-select" id="locationFilter">
              <option value="all">All Locations</option>
              ${locations.map((location: any) => `<option value="${location.id}">${location.name}</option>`).join('')}
            </select>
          </div>
          
          <table class="data-table" id="assetTable">
            <thead>
              <tr>
                <th>Asset</th>
                <th>Location</th>
                <th>Condition</th>
                <th>Priority</th>
                ${project.reraAuditType === 'reserve_fund_study' ? '<th>Replacement Cost</th><th>Year</th>' : ''}
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              ${assessments.map((assessment: any) => {
                const classification = classifications.find((c: any) => c.id === assessment.classificationId);
                const location = locations.find((l: any) => l.id === assessment.locationId);
                const lifecycleCost = lifecycleCosts.find((lc: any) => lc.assessmentId === assessment.id);
                
                return `
                <tr class="condition-${assessment.conditionRating}" data-condition="${assessment.conditionRating}" data-priority="${assessment.priorityRating}" data-location="${assessment.locationId}">
                  <td>${classification ? classification.description || 'Unknown' : 'Unknown'}</td>
                  <td>${location ? location.name || 'Unknown' : 'Unknown'}</td>
                  <td>${assessment.conditionRating}</td>
                  <td class="priority-${assessment.priorityRating}">${assessment.priorityRating}</td>
                  ${project.reraAuditType === 'reserve_fund_study' ? `
                  <td>AED ${lifecycleCost ? (lifecycleCost.replacementCost || 0).toLocaleString() : 'N/A'}</td>
                  <td>${lifecycleCost ? lifecycleCost.replacementYear || 'N/A' : 'N/A'}</td>
                  ` : ''}
                  <td>${assessment.notes || ''}</td>
                </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
        
        ${project.reraAuditType === 'reserve_fund_study' ? `
        <div class="page-break"></div>
        
        <!-- Reserve Fund Analysis -->
        <div class="section">
          <h2 class="section-title">Reserve Fund Analysis</h2>
          <p>This section provides a detailed analysis of the reserve fund requirements based on the condition assessment and projected capital expenditures.</p>
          
          <div class="summary-stats">
            <div class="stat-card">
              <div class="stat-value">AED ${totalReplacementCost.toLocaleString()}</div>
              <div class="stat-label">Total Capital Requirements</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">AED ${(totalReplacementCost * 0.05).toLocaleString()}</div>
              <div class="stat-label">Recommended Annual Contribution</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">25-30%</div>
              <div class="stat-label">Target Reserve Ratio</div>
            </div>
          </div>
          
          <h3 style="margin-top: 30px;">Capital Expenditure Schedule</h3>
          <table class="data-table">
            <thead>
              <tr>
                <th>Year</th>
                <th>Asset</th>
                <th>Location</th>
                <th>Replacement Cost</th>
                <th>Running Total</th>
              </tr>
            </thead>
            <tbody>
              ${(() => {
                // Sort lifecycle costs by year
                const sortedCosts = [...lifecycleCosts].sort((a: any, b: any) => 
                  (a.replacementYear || 0) - (b.replacementYear || 0)
                );
                
                let runningTotal = 0;
                return sortedCosts.map((cost: any) => {
                  const assessment = assessments.find((a: any) => a.id === cost.assessmentId);
                  const classification = assessment ? classifications.find((c: any) => c.id === assessment.classificationId) : null;
                  const location = assessment ? locations.find((l: any) => l.id === assessment.locationId) : null;
                  
                  runningTotal += parseInt(cost.replacementCost) || 0;
                  
                  return `
                  <tr>
                    <td>${cost.replacementYear || 'N/A'}</td>
                    <td>${classification ? classification.description || 'Unknown' : 'Unknown'}</td>
                    <td>${location ? location.name || 'Unknown' : 'Unknown'}</td>
                    <td>AED ${(parseInt(cost.replacementCost) || 0).toLocaleString()}</td>
                    <td>AED ${runningTotal.toLocaleString()}</td>
                  </tr>
                  `;
                }).join('');
              })()}
            </tbody>
          </table>
        </div>
        ` : ''}
        
        <div class="page-break"></div>
        
        <!-- Recommendations Section -->
        <div class="section">
          <h2 class="section-title">Recommendations</h2>
          <p>Based on our comprehensive assessment, we recommend the following actions to maintain the property in optimal condition${project.reraAuditType === 'reserve_fund_study' ? ' and ensure adequate reserve funding' : ''}:</p>
          
          <ol style="margin-left: 25px; margin-bottom: 30px;">
            ${(() => {
              const recommendations = [];
              
              // Add condition-based recommendations
              if (conditionCounts.D > 0) {
                recommendations.push(`Address the ${conditionCounts.D} assets in critical condition (D rating) immediately to prevent further deterioration and potential safety hazards.`);
              }
              
              if (conditionCounts.C > 0) {
                recommendations.push(`Plan for repairs of the ${conditionCounts.C} assets in poor condition (C rating) within the next 12 months.`);
              }
              
              // Add reserve fund specific recommendations
              if (project.reraAuditType === 'reserve_fund_study') {
                recommendations.push(`Maintain a minimum reserve fund balance of at least 25% of the total replacement cost (AED ${(totalReplacementCost * 0.25).toLocaleString()}).`);
                recommendations.push(`Consider an annual contribution of at least AED ${(totalReplacementCost * 0.05).toLocaleString()} to the reserve fund to ensure adequate funding for future replacements.`);
                
                if (shortTermCosts > 0) {
                  recommendations.push(`Allocate AED ${shortTermCosts.toLocaleString()} for short-term capital expenditures over the next 5 years.`);
                }
                
                recommendations.push(`Review and update this reserve fund study every 3-5 years or when significant changes occur in the property.`);
              } else {
                recommendations.push(`Implement a regular maintenance schedule for all assets to prevent deterioration.`);
                recommendations.push(`Conduct a full condition survey every 3 years to monitor the building's condition.`);
              }
              
              return recommendations.map(rec => `<li>${rec}</li>`).join('');
            })()}
          </ol>
          
          <div style="background-color: #ebf8ff; padding: 20px; border-radius: 8px; border-left: 4px solid #3182ce;">
            <h3 style="color: #2c5282; margin-top: 0;">Key Takeaways</h3>
            <p>${project.reraAuditType === 'reserve_fund_study' 
              ? `This reserve fund study has identified total capital requirements of AED ${totalReplacementCost.toLocaleString()} over the study period, with AED ${shortTermCosts.toLocaleString()} needed in the next 5 years.` 
              : `This condition survey has identified ${conditionCounts.C + conditionCounts.D} assets in need of attention, representing ${Math.round((conditionCounts.C + conditionCounts.D) / totalAssets * 100)}% of the total assessed assets.`}
            </p>
            <p>Regular maintenance and proactive asset management will help extend the useful life of building components and reduce overall lifecycle costs.</p>
          </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
          <p>This report was generated by the RERA Compliance Module</p>
          <p>© ${new Date().getFullYear()} UrbanGrid Property Services | All Rights Reserved</p>
        </div>
        
        <!-- Controls for generating PDF -->
        <div style="text-align: center; margin-top: 30px;">
          <button class="action-button" onclick="downloadReport()">Generate Full PDF Report</button>
        </div>
      </div>
      
      <script>
        // Filter functionality
        document.addEventListener('DOMContentLoaded', function() {
          const conditionFilter = document.getElementById('conditionFilter');
          const priorityFilter = document.getElementById('priorityFilter');
          const locationFilter = document.getElementById('locationFilter');
          const assetTable = document.getElementById('assetTable');
          const rows = assetTable.querySelectorAll('tbody tr');
          
          function applyFilters() {
            const conditionValue = conditionFilter.value;
            const priorityValue = priorityFilter.value;
            const locationValue = locationFilter.value;
            
            rows.forEach(row => {
              const conditionMatch = conditionValue === 'all' || row.dataset.condition === conditionValue;
              const priorityMatch = priorityValue === 'all' || row.dataset.priority === priorityValue;
              const locationMatch = locationValue === 'all' || row.dataset.location === locationValue;
              
              if (conditionMatch && priorityMatch && locationMatch) {
                row.style.display = '';
              } else {
                row.style.display = 'none';
              }
            });
          }
          
          if (conditionFilter) conditionFilter.addEventListener('change', applyFilters);
          if (priorityFilter) priorityFilter.addEventListener('change', applyFilters);
          if (locationFilter) locationFilter.addEventListener('change', applyFilters);
        });
        
        // Download report function
        function downloadReport() {
          fetch('/api/rera/projects/${projectId}/reports/generate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + localStorage.getItem('auth_token')
            },
            body: JSON.stringify({
              reportType: '${project.reraAuditType}',
              settings: ${JSON.stringify(settings || {})}
            })
          })
          .then(response => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            return response.json();
          })
          .then(data => {
            if (data.success && data.reportUrl) {
              window.open(data.reportUrl, '_blank');
            } else {
              alert('Error generating report: ' + (data.error || 'Unknown error'));
            }
          })
          .catch(error => {
            console.error('Error:', error);
            alert('Error generating report: ' + error.message);
          });
        }
      </script>
    </body>
    </html>
    `;
    
    res.send(html);
  } catch (error: any) {
    console.error('Error generating RERA report preview:', error);
    res.status(500).json({ error: 'Failed to generate report preview: ' + error.message });
  }
});

// API to retrieve the report preview HTML
reraReportRouter.get('/projects/:projectId/rera-reports/preview', authenticate, async (req: Request, res: Response) => {
  try {
    const projectId = parseInt(req.params.projectId);
    
    // Check if the project exists and is a RERA audit
    const project = await storage.getProjectById(projectId);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    if (project.projectType !== 'rera_audit') {
      return res.status(400).json({ error: 'This operation is only available for RERA audit projects' });
    }
    
    // Get default settings based on project type
    const defaultSettings = {
      studyPeriod: 30,
      startBalance: 0,
      interestRate: 0.02,
      inflationRate: 0.03,
      contributionStrategy: 'flat',
      escalationRate: 0.03,
      // Default funding strategy with placeholders
      fundingStrategy: {
        annualContribution: 10000,
        cashflow: [],
        minBalance: 0,
        minBalanceYear: 0,
        warnings: []
      }
    };
    
    // Redirect to post endpoint with default settings
    const postData = {
      reportType: project.reraAuditType || 'condition_survey',
      settings: defaultSettings
    };
    
    // Use the POST endpoint but with default settings
    req.body = postData;
    
    // Instead of redirecting, forward to our POST endpoint
    return res.redirect(307, `/api/rera/projects/${projectId}/rera-reports/preview`);
  } catch (error: any) {
    console.error('Error loading RERA report preview page:', error);
    res.status(500).json({ error: 'Failed to load report preview: ' + error.message });
  }
});

// API to generate the PDF report
reraReportRouter.post('/projects/:projectId/rera-reports/generate', authenticate, async (req: Request, res: Response) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const { reportType, settings, capitalPlan, summaryStats } = req.body;
    
    console.log('Generating PDF report for project', projectId);
    
    // Check if the project exists and is a RERA audit
    const project = await storage.getProjectById(projectId);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    if (project.projectType !== 'rera_audit') {
      return res.status(400).json({ error: 'This operation is only available for RERA audit projects' });
    }
    
    // Get all the necessary data for the report
    const locations = await storage.getLocationsByProjectId(projectId);
    const classifications = await storage.getNrm3ClassificationsByProjectId(projectId);
    const assessments = await storage.getConditionAssessmentsByProjectId(projectId);
    const lifecycleCosts = project.reraAuditType === 'reserve_fund_study' 
      ? await storage.getLifecycleCostsByProjectId(projectId)
      : [];
    
    // Calculate summary statistics like in the preview
    const totalAssets = assessments.length;
    const totalLocations = locations.length;
    
    // Calculate condition distribution
    const conditionCounts = {
      'A': assessments.filter((a: any) => a.conditionRating === 'A').length,
      'B': assessments.filter((a: any) => a.conditionRating === 'B').length,
      'C': assessments.filter((a: any) => a.conditionRating === 'C').length,
      'D': assessments.filter((a: any) => a.conditionRating === 'D').length
    };
    
    // Calculate total replacement cost
    const totalReplacementCost = lifecycleCosts.reduce((sum: number, cost: any) => {
      return sum + (parseInt(cost.replacementCost) || 0);
    }, 0);
    
    // Calculate short-term vs long-term costs
    const currentYear = new Date().getFullYear();
    const shortTermCosts = lifecycleCosts
      .filter((cost: any) => cost.replacementYear <= currentYear + 5)
      .reduce((sum: number, cost: any) => sum + (parseInt(cost.replacementCost) || 0), 0);
    
    const mediumTermCosts = lifecycleCosts
      .filter((cost: any) => cost.replacementYear > currentYear + 5 && cost.replacementYear <= currentYear + 15)
      .reduce((sum: number, cost: any) => sum + (parseInt(cost.replacementCost) || 0), 0);
    
    const longTermCosts = lifecycleCosts
      .filter((cost: any) => cost.replacementYear > currentYear + 15)
      .reduce((sum: number, cost: any) => sum + (parseInt(cost.replacementCost) || 0), 0);
    
    // Generate a filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const sanitizedName = project.name ? project.name.replace(/[^a-z0-9]/gi, '_').toLowerCase() : `project_${projectId}`;
    const fileName = `${sanitizedName}_${project.reraAuditType}_${timestamp}.pdf`;
    const filePath = `./client/public/downloads/pdf/${fileName}`;
    
    // Ensure directory exists
    try {
      await fs.promises.mkdir('./client/public/downloads/pdf', { recursive: true });
    } catch (err) {
      console.error('Error creating directory:', err);
    }
    
    // Create HTML content for the PDF - similar to preview but optimized for PDF export
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>RERA Report - ${project.name}</title>
      <style>
        /* PDF-optimized styling */
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          margin: 0;
          padding: 0;
          color: #333;
          line-height: 1.6;
          background-color: white;
        }
        
        .report-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0;
          background-color: white;
        }
        
        /* Cover page */
        .cover-page {
          text-align: center;
          padding: 40px 20px;
          margin-bottom: 30px;
          border-bottom: 1px solid #eaeaea;
        }
        
        .logo {
          max-width: 200px;
          margin: 0 auto 20px;
        }
        
        .report-title {
          font-size: 28px;
          font-weight: 600;
          margin-bottom: 10px;
          color: #1a365d;
        }
        
        .report-subtitle {
          font-size: 20px;
          color: #4a5568;
          margin-bottom: 30px;
        }
        
        .project-info {
          background-color: #f8fafc;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 30px;
        }
        
        .project-name {
          font-size: 22px;
          font-weight: 600;
          margin-bottom: 15px;
          color: #2c5282;
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 15px;
        }
        
        .info-item {
          margin-bottom: 5px;
        }
        
        .info-label {
          font-weight: 600;
          color: #4a5568;
        }
        
        /* Section styling */
        .section {
          margin-bottom: 40px;
        }
        
        .section-title {
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 2px solid #e2e8f0;
          color: #2d3748;
        }
        
        /* Executive summary */
        .summary-stats {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        
        .stat-card {
          background-color: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 15px;
          text-align: center;
        }
        
        .stat-value {
          font-size: 24px;
          font-weight: 700;
          color: #2b6cb0;
          margin-bottom: 5px;
        }
        
        .stat-label {
          font-size: 14px;
          color: #4a5568;
        }
        
        /* Tables */
        .data-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        
        .data-table th, .data-table td {
          padding: 8px 10px;
          text-align: left;
          border: 1px solid #e2e8f0;
        }
        
        .data-table th {
          background-color: #edf2f7;
          font-weight: 600;
          color: #4a5568;
        }
        
        .data-table tr:nth-child(even) {
          background-color: #f8fafc;
        }
        
        /* Condition colors */
        .condition-A { background-color: #c6f6d5; }
        .condition-B { background-color: #bee3f8; }
        .condition-C { background-color: #feebc8; }
        .condition-D { background-color: #fed7d7; }
        
        /* Priority colors */
        .priority-1 { color: #e53e3e; font-weight: 600; }
        .priority-2 { color: #dd6b20; font-weight: 600; }
        .priority-3 { color: #d69e2e; font-weight: 600; }
        .priority-4 { color: #38a169; font-weight: 600; }
        
        /* Footer */
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #eaeaea;
          color: #718096;
          font-size: 14px;
        }
        
        /* Page breaks */
        .page-break {
          page-break-after: always;
        }
        
        /* Charts - static images for PDF */
        .chart-placeholder {
          text-align: center;
          padding: 20px;
          background-color: #f8fafc;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        
        .legend-table {
          width: auto;
          margin: 0 auto;
          border-collapse: collapse;
        }
        
        .legend-table td {
          padding: 5px 10px;
          text-align: left;
          border: none;
        }
        
        .color-box {
          width: 15px;
          height: 15px;
          border-radius: 3px;
          display: inline-block;
        }
        
        .cost-table {
          width: 60%;
          margin: 20px auto;
        }
        
        .recommendations {
          margin-left: 25px;
          margin-bottom: 30px;
        }
        
        .key-takeaway-box {
          background-color: #ebf8ff; 
          padding: 20px; 
          border-radius: 8px; 
          border-left: 4px solid #3182ce;
          margin-bottom: 20px;
        }
      </style>
    </head>
    <body>
      <div class="report-container">
        <!-- Cover Page -->
        <div class="cover-page">
          <img src="https://urbangrid.ae/wp-content/uploads/2023/10/Your_paragraph_text-removebg-preview-e1697448898876.png" alt="UrbanGrid Logo" class="logo">
          <h1 class="report-title">${project.reraAuditType === 'reserve_fund_study' ? 'Reserve Fund Study' : 'Condition Survey'}</h1>
          <h2 class="report-subtitle">RERA Compliance Report</h2>
          <p>Prepared by: UrbanGrid Property Services</p>
          <p>Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        
        <!-- Project Information -->
        <div class="project-info">
          <h2 class="project-name">${project.name}</h2>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Client:</span> 
              <span>${project.clientName || 'Not specified'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Location:</span> 
              <span>${project.location || 'Not specified'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Property Type:</span> 
              <span>${project.propertyType || 'Not specified'}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Inspection Date:</span> 
              <span>${new Date(project.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Status:</span> 
              <span>${project.status.charAt(0).toUpperCase() + project.status.slice(1).replace('_', ' ')}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Report Type:</span> 
              <span>${project.reraAuditType === 'reserve_fund_study' ? 'Reserve Fund Study' : 'Condition Survey'}</span>
            </div>
          </div>
        </div>
        
        <!-- Executive Summary -->
        <div class="section">
          <h2 class="section-title">Executive Summary</h2>
          <p>This report presents a comprehensive ${project.reraAuditType === 'reserve_fund_study' ? 'Reserve Fund Study' : 'Condition Survey'} for ${project.name}, located in ${project.location || 'Dubai'}. The assessment was conducted in accordance with RERA guidelines and industry best practices.</p>
          
          <div class="summary-stats">
            <div class="stat-card">
              <div class="stat-value">${totalAssets}</div>
              <div class="stat-label">Assets Assessed</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${totalLocations}</div>
              <div class="stat-label">Locations</div>
            </div>
            ${project.reraAuditType === 'reserve_fund_study' ? `
            <div class="stat-card">
              <div class="stat-value">AED ${totalReplacementCost.toLocaleString()}</div>
              <div class="stat-label">Total Replacement Cost</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">AED ${shortTermCosts.toLocaleString()}</div>
              <div class="stat-label">Short-Term Needs (5 Years)</div>
            </div>
            ` : ''}
          </div>
          
          <!-- Condition Distribution Visualization -->
          <div class="chart-placeholder">
            <h3>Asset Condition Distribution</h3>
            <table class="legend-table">
              <tr>
                <td><div class="color-box" style="background-color: #c6f6d5;"></div></td>
                <td>A - Good</td>
                <td><strong>${conditionCounts.A}</strong> assets (${Math.round(conditionCounts.A / totalAssets * 100)}%)</td>
              </tr>
              <tr>
                <td><div class="color-box" style="background-color: #bee3f8;"></div></td>
                <td>B - Satisfactory</td>
                <td><strong>${conditionCounts.B}</strong> assets (${Math.round(conditionCounts.B / totalAssets * 100)}%)</td>
              </tr>
              <tr>
                <td><div class="color-box" style="background-color: #feebc8;"></div></td>
                <td>C - Poor</td>
                <td><strong>${conditionCounts.C}</strong> assets (${Math.round(conditionCounts.C / totalAssets * 100)}%)</td>
              </tr>
              <tr>
                <td><div class="color-box" style="background-color: #fed7d7;"></div></td>
                <td>D - Bad</td>
                <td><strong>${conditionCounts.D}</strong> assets (${Math.round(conditionCounts.D / totalAssets * 100)}%)</td>
              </tr>
            </table>
          </div>
          
          ${project.reraAuditType === 'reserve_fund_study' ? `
          <div class="chart-placeholder">
            <h3>Cost Distribution by Timeframe</h3>
            <table class="cost-table">
              <tr>
                <th>Timeframe</th>
                <th>Cost (AED)</th>
                <th>Percentage</th>
              </tr>
              <tr>
                <td>Short Term (0-5 years)</td>
                <td>${shortTermCosts.toLocaleString()}</td>
                <td>${Math.round(shortTermCosts / totalReplacementCost * 100)}%</td>
              </tr>
              <tr>
                <td>Medium Term (6-15 years)</td>
                <td>${mediumTermCosts.toLocaleString()}</td>
                <td>${Math.round(mediumTermCosts / totalReplacementCost * 100)}%</td>
              </tr>
              <tr>
                <td>Long Term (16+ years)</td>
                <td>${longTermCosts.toLocaleString()}</td>
                <td>${Math.round(longTermCosts / totalReplacementCost * 100)}%</td>
              </tr>
              <tr>
                <td><strong>Total</strong></td>
                <td><strong>${totalReplacementCost.toLocaleString()}</strong></td>
                <td>100%</td>
              </tr>
            </table>
          </div>
          ` : ''}
        </div>
        
        <div class="page-break"></div>
        
        <!-- Asset Assessment Section -->
        <div class="section">
          <h2 class="section-title">Asset Assessment</h2>
          
          <table class="data-table">
            <thead>
              <tr>
                <th>Asset</th>
                <th>Location</th>
                <th>Condition</th>
                <th>Priority</th>
                ${project.reraAuditType === 'reserve_fund_study' ? '<th>Replacement Cost</th><th>Year</th>' : ''}
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              ${assessments.map((assessment: any) => {
                const classification = classifications.find((c: any) => c.id === assessment.classificationId);
                const location = locations.find((l: any) => l.id === assessment.locationId);
                const lifecycleCost = lifecycleCosts.find((lc: any) => lc.assessmentId === assessment.id);
                
                return `
                <tr class="condition-${assessment.conditionRating}">
                  <td>${classification ? classification.description || 'Unknown' : 'Unknown'}</td>
                  <td>${location ? location.name || 'Unknown' : 'Unknown'}</td>
                  <td>${assessment.conditionRating}</td>
                  <td class="priority-${assessment.priorityRating}">${assessment.priorityRating}</td>
                  ${project.reraAuditType === 'reserve_fund_study' ? `
                  <td>AED ${lifecycleCost ? (lifecycleCost.replacementCost || 0).toLocaleString() : 'N/A'}</td>
                  <td>${lifecycleCost ? lifecycleCost.replacementYear || 'N/A' : 'N/A'}</td>
                  ` : ''}
                  <td>${assessment.notes || ''}</td>
                </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
        
        ${project.reraAuditType === 'reserve_fund_study' ? `
        <div class="page-break"></div>
        
        <!-- Reserve Fund Analysis -->
        <div class="section">
          <h2 class="section-title">Reserve Fund Analysis</h2>
          <p>This section provides a detailed analysis of the reserve fund requirements based on the condition assessment and projected capital expenditures.</p>
          
          <div class="summary-stats">
            <div class="stat-card">
              <div class="stat-value">AED ${totalReplacementCost.toLocaleString()}</div>
              <div class="stat-label">Total Capital Requirements</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">AED ${(totalReplacementCost * 0.05).toLocaleString()}</div>
              <div class="stat-label">Recommended Annual Contribution</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">25-30%</div>
              <div class="stat-label">Target Reserve Ratio</div>
            </div>
          </div>
          
          <h3 style="margin-top: 30px;">Capital Expenditure Schedule</h3>
          <table class="data-table">
            <thead>
              <tr>
                <th>Year</th>
                <th>Asset</th>
                <th>Location</th>
                <th>Replacement Cost</th>
                <th>Running Total</th>
              </tr>
            </thead>
            <tbody>
              ${(() => {
                // Sort lifecycle costs by year
                const sortedCosts = [...lifecycleCosts].sort((a: any, b: any) => 
                  (a.replacementYear || 0) - (b.replacementYear || 0)
                );
                
                let runningTotal = 0;
                return sortedCosts.map((cost: any) => {
                  const assessment = assessments.find((a: any) => a.id === cost.assessmentId);
                  const classification = assessment ? classifications.find((c: any) => c.id === assessment.classificationId) : null;
                  const location = assessment ? locations.find((l: any) => l.id === assessment.locationId) : null;
                  
                  runningTotal += parseInt(cost.replacementCost) || 0;
                  
                  return `
                  <tr>
                    <td>${cost.replacementYear || 'N/A'}</td>
                    <td>${classification ? classification.description || 'Unknown' : 'Unknown'}</td>
                    <td>${location ? location.name || 'Unknown' : 'Unknown'}</td>
                    <td>AED ${(parseInt(cost.replacementCost) || 0).toLocaleString()}</td>
                    <td>AED ${runningTotal.toLocaleString()}</td>
                  </tr>
                  `;
                }).join('');
              })()}
            </tbody>
          </table>
        </div>
        ` : ''}
        
        <div class="page-break"></div>
        
        <!-- Recommendations Section -->
        <div class="section">
          <h2 class="section-title">Recommendations</h2>
          <p>Based on our comprehensive assessment, we recommend the following actions to maintain the property in optimal condition${project.reraAuditType === 'reserve_fund_study' ? ' and ensure adequate reserve funding' : ''}:</p>
          
          <ol class="recommendations">
            ${(() => {
              const recommendations = [];
              
              // Add condition-based recommendations
              if (conditionCounts.D > 0) {
                recommendations.push(`Address the ${conditionCounts.D} assets in critical condition (D rating) immediately to prevent further deterioration and potential safety hazards.`);
              }
              
              if (conditionCounts.C > 0) {
                recommendations.push(`Plan for repairs of the ${conditionCounts.C} assets in poor condition (C rating) within the next 12 months.`);
              }
              
              // Add reserve fund specific recommendations
              if (project.reraAuditType === 'reserve_fund_study') {
                recommendations.push(`Maintain a minimum reserve fund balance of at least 25% of the total replacement cost (AED ${(totalReplacementCost * 0.25).toLocaleString()}).`);
                recommendations.push(`Consider an annual contribution of at least AED ${(totalReplacementCost * 0.05).toLocaleString()} to the reserve fund to ensure adequate funding for future replacements.`);
                
                if (shortTermCosts > 0) {
                  recommendations.push(`Allocate AED ${shortTermCosts.toLocaleString()} for short-term capital expenditures over the next 5 years.`);
                }
                
                recommendations.push(`Review and update this reserve fund study every 3-5 years or when significant changes occur in the property.`);
              } else {
                recommendations.push(`Implement a regular maintenance schedule for all assets to prevent deterioration.`);
                recommendations.push(`Conduct a full condition survey every 3 years to monitor the building's condition.`);
              }
              
              return recommendations.map(rec => `<li>${rec}</li>`).join('');
            })()}
          </ol>
          
          <div class="key-takeaway-box">
            <h3 style="color: #2c5282; margin-top: 0;">Key Takeaways</h3>
            <p>${project.reraAuditType === 'reserve_fund_study' 
              ? `This reserve fund study has identified total capital requirements of AED ${totalReplacementCost.toLocaleString()} over the study period, with AED ${shortTermCosts.toLocaleString()} needed in the next 5 years.` 
              : `This condition survey has identified ${conditionCounts.C + conditionCounts.D} assets in need of attention, representing ${Math.round((conditionCounts.C + conditionCounts.D) / totalAssets * 100)}% of the total assessed assets.`}
            </p>
            <p>Regular maintenance and proactive asset management will help extend the useful life of building components and reduce overall lifecycle costs.</p>
          </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
          <p>This report was generated by the RERA Compliance Module</p>
          <p>© ${new Date().getFullYear()} UrbanGrid Property Services | All Rights Reserved</p>
        </div>
      </div>
    </body>
    </html>
    `;
    
    try {
      // Write HTML to a temporary file (useful for debugging)
      await fs.promises.writeFile('./client/public/downloads/pdf/temp.html', html);
      
      // Use puppeteer to generate PDF
      const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      const page = await browser.newPage();
      await page.setContent(html);
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
      
      console.log('PDF report generated successfully at', filePath);
      
      // Return the URL to download the report
      const reportUrl = `/downloads/pdf/${fileName}`;
      res.json({
        success: true,
        reportUrl,
        message: 'Report generated successfully'
      });
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      res.status(500).json({ error: 'Failed to generate PDF report: ' + error.message });
    }
  } catch (error: any) {
    console.error('Error generating report:', error);
    res.status(500).json({ error: 'Failed to generate report: ' + error.message });
  }
});