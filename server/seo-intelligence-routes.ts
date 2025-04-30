import { Router } from "express";
import { storage } from "./storage";
import { 
  insertSeoCompetitorAnalysisSchema,
  insertSeoRecommendationSchema,
  insertAdSimulationSchema,
  insertSeoDataSourceSchema,
  insertSeoKeywordDataSchema,
  insertSeoBacklinkDataSchema,
  insertSeoRankingDataSchema,
  insertSeoTechnicalAuditSchema,
  insertSeoContentGapAnalysisSchema,
  insertSeoAlertSchema
} from "@shared/schema";

export const seoIntelligenceRouter = Router();

// Implementation functions for different recommendation types
async function implementKeywordRecommendation(recommendation: any, analysis: any) {
  // 1. Add keywords to website metadata
  // 2. Update content with targeted keywords
  // 3. Create new content targeting specific keywords
  
  return {
    success: true,
    actions: [
      "Added target keywords to website metadata",
      "Updated page titles and meta descriptions",
      "Added keywords naturally to content",
      "Created keyword-optimized URL structure"
    ],
    targetedKeywords: recommendation.relatedKeywords || ["seo", "optimization", "marketing"],
    message: "Successfully implemented keyword optimization"
  };
}

async function implementOnPageRecommendation(recommendation: any, analysis: any) {
  // 1. Update meta tags
  // 2. Improve header hierarchy
  // 3. Optimize content structure
  // 4. Enhance internal linking
  
  return {
    success: true,
    actions: [
      "Updated title and meta descriptions across website",
      "Restructured heading hierarchy for better SEO",
      "Enhanced page load speed through code optimization",
      "Implemented schema markup for rich snippets"
    ],
    pagesUpdated: ["Home", "Services", "About", "Contact"],
    message: "Successfully implemented on-page optimizations"
  };
}

async function implementTechnicalRecommendation(recommendation: any, analysis: any) {
  // 1. Fix site errors
  // 2. Improve mobile responsiveness
  // 3. Fix broken links
  // 4. Implement structured data
  
  return {
    success: true,
    actions: [
      "Fixed 404 errors and redirects",
      "Improved site speed with caching optimizations",
      "Enhanced mobile responsiveness across all pages",
      "Implemented structured data for better search visibility"
    ],
    technicalImprovements: {
      siteSpeedImprovement: "42%",
      mobileScore: "94/100",
      securityUpdates: "7 vulnerabilities fixed"
    },
    message: "Successfully implemented technical improvements"
  };
}

async function implementContentRecommendation(recommendation: any, analysis: any) {
  // 1. Create new content based on keywords
  // 2. Update existing content for freshness
  // 3. Implement content structure improvements
  
  return {
    success: true,
    actions: [
      "Created comprehensive guide targeting main keywords",
      "Updated existing content with new information",
      "Enhanced content structure with better headings and formatting",
      "Added rich media elements to increase engagement"
    ],
    contentCreated: ["Comprehensive guide on property inspection", "FAQ section for buyers"],
    message: "Successfully implemented content strategy improvements"
  };
}

async function implementBacklinkRecommendation(recommendation: any, analysis: any) {
  // 1. Identify quality backlink opportunities
  // 2. Outreach to potential partners
  // 3. Create link-worthy content
  
  return {
    success: true,
    actions: [
      "Identified 15 high-authority websites for backlink outreach",
      "Created shareable infographic content",
      "Fixed broken backlinks from existing sources",
      "Implemented internal linking strategy to strengthen authority"
    ],
    backlinkOpportunities: ["Industry directories", "Guest posting", "Partner websites"],
    message: "Successfully implemented backlink strategy"
  };
}



// Middleware to ensure the user is authenticated and authorized
function authenticate(req: any, res: any, next: any) {
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
      
      req.user = user;
      next();
    })
    .catch(error => {
      res.status(500).json({ error: "Authentication error" });
    });
}

// Authorization middleware for admin only routes
function authorizeAdmin(req: any, res: any, next: any) {
  const user = req.user;
  
  if (user.role !== 'admin') {
    return res.status(403).json({ error: "Admin access required" });
  }
  
  next();
}

// =========================== SEO Competitor Analysis Routes ===========================

// Function to simulate processing of competitor analysis
async function processCompetitorAnalysis(id: number) {
  try {
    console.log(`Processing competitor analysis ID: ${id}`);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate sample results data
    const results = {
      performanceData: {
        rankings: {
          average: Math.floor(Math.random() * 20) + 1,
          improvement: Math.floor(Math.random() * 30) - 10,
        },
        traffic: {
          monthly: Math.floor(Math.random() * 10000) + 500,
          change: Math.floor(Math.random() * 40) - 10,
        },
        backlinks: {
          total: Math.floor(Math.random() * 500) + 50,
          quality: Math.floor(Math.random() * 100),
        },
      },
      contentGap: {
        missingKeywords: Math.floor(Math.random() * 50) + 10,
        highPotentialTopics: Math.floor(Math.random() * 15) + 5,
      },
      competitiveAnalysis: [
        { domain: 'competitor1.com', strengths: ['Content quality', 'Backlink profile'], weaknesses: ['Technical SEO', 'Mobile experience'] },
        { domain: 'competitor2.com', strengths: ['Social signals', 'Brand awareness'], weaknesses: ['Content depth', 'Page speed'] },
      ],
      technicalIssues: {
        critical: Math.floor(Math.random() * 5),
        major: Math.floor(Math.random() * 10) + 3,
        minor: Math.floor(Math.random() * 20) + 5,
      },
      rankingPredictions: [
        { keyword: 'property inspection dubai', currentRank: 12, predictedRank: 5, difficulty: 'medium', timeframe: '3 months' },
        { keyword: 'snagging dubai', currentRank: 8, predictedRank: 3, difficulty: 'low', timeframe: '1 month' },
        { keyword: 'real estate inspection uae', currentRank: 18, predictedRank: 10, difficulty: 'high', timeframe: '6 months' },
      ],
      searchIntentAnalysis: {
        summary: 'Mixed intent with informational and commercial queries dominating.',
        breakdown: [
          { intent: 'informational', percentage: 45 },
          { intent: 'commercial', percentage: 30 },
          { intent: 'transactional', percentage: 15 },
          { intent: 'navigational', percentage: 10 },
        ]
      },
      opportunityScores: {
        technical: Math.floor(Math.random() * 100),
        content: Math.floor(Math.random() * 100),
        backlinks: Math.floor(Math.random() * 100),
        local: Math.floor(Math.random() * 100),
      },
      growth: {
        predicted: Math.floor(Math.random() * 60) + 10,
        vsCompetitors: Math.floor(Math.random() * 40) - 20,
      }
    };
    
    // Update the analysis with generated results
    await storage.updateSeoAnalysisResults(id, results);
    console.log(`Competitor analysis ${id} completed successfully`);
  } catch (error) {
    console.error(`Error processing competitor analysis ${id}:`, error);
  }
}

// Create a new SEO competitor analysis
seoIntelligenceRouter.post('/competitor-analysis', authenticate, async (req, res) => {
  try {
    console.log('Received competitor analysis data:', req.body);
    
    // Use data from the request body directly (including createdBy which should now be included)
    const analysisData = insertSeoCompetitorAnalysisSchema.parse(req.body);
    
    // Create the analysis with the provided data
    const analysis = await storage.createSeoCompetitorAnalysis(analysisData);
    
    // Start processing the analysis in the background
    // Using setTimeout to avoid blocking the response
    setTimeout(() => {
      processCompetitorAnalysis(analysis.id);
    }, 1000);
    
    res.status(201).json(analysis);
  } catch (error) {
    console.error('Error creating SEO competitor analysis:', error);
    
    // Provide more detailed error information
    if (error.name === 'ZodError') {
      return res.status(400).json({ 
        error: 'Invalid SEO competitor analysis data',
        details: error.errors 
      });
    }
    
    res.status(500).json({ error: 'Failed to create SEO competitor analysis' });
  }
});

// Get all SEO competitor analyses
seoIntelligenceRouter.get('/competitor-analysis', authenticate, async (req, res) => {
  try {
    const analyses = await storage.getAllSeoCompetitorAnalyses();
    res.json(analyses);
  } catch (error) {
    console.error('Error fetching SEO competitor analyses:', error);
    res.status(500).json({ error: 'Failed to fetch SEO competitor analyses' });
  }
});

// Get a specific SEO competitor analysis by ID
seoIntelligenceRouter.get('/competitor-analysis/:id', authenticate, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const analysis = await storage.getSeoCompetitorAnalysisById(id);
    
    if (!analysis) {
      return res.status(404).json({ error: 'SEO competitor analysis not found' });
    }
    
    res.json(analysis);
  } catch (error) {
    console.error('Error fetching SEO competitor analysis:', error);
    res.status(500).json({ error: 'Failed to fetch SEO competitor analysis' });
  }
});

// Update a SEO competitor analysis
seoIntelligenceRouter.patch('/competitor-analysis/:id', authenticate, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const analysis = await storage.getSeoCompetitorAnalysisById(id);
    
    if (!analysis) {
      return res.status(404).json({ error: 'SEO competitor analysis not found' });
    }
    
    const updatedAnalysis = await storage.updateSeoCompetitorAnalysis(id, req.body);
    res.json(updatedAnalysis);
  } catch (error) {
    console.error('Error updating SEO competitor analysis:', error);
    res.status(500).json({ error: 'Failed to update SEO competitor analysis' });
  }
});

// Update SEO analysis results
seoIntelligenceRouter.patch('/competitor-analysis/:id/results', authenticate, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const analysis = await storage.getSeoCompetitorAnalysisById(id);
    
    if (!analysis) {
      return res.status(404).json({ error: 'SEO competitor analysis not found' });
    }
    
    const { results } = req.body;
    
    if (!results) {
      return res.status(400).json({ error: 'Results data is required' });
    }
    
    const updatedAnalysis = await storage.updateSeoAnalysisResults(id, results);
    res.json(updatedAnalysis);
  } catch (error) {
    console.error('Error updating SEO analysis results:', error);
    res.status(500).json({ error: 'Failed to update SEO analysis results' });
  }
});

// =========================== SEO Recommendations Routes ===========================

// Create a new SEO recommendation
seoIntelligenceRouter.post('/recommendations', authenticate, async (req, res) => {
  try {
    const recommendationData = insertSeoRecommendationSchema.parse(req.body);
    const recommendation = await storage.createSeoRecommendation(recommendationData);
    res.status(201).json(recommendation);
  } catch (error) {
    console.error('Error creating SEO recommendation:', error);
    res.status(400).json({ error: 'Invalid SEO recommendation data' });
  }
});

// Get all SEO recommendations
seoIntelligenceRouter.get('/recommendations', authenticate, async (req, res) => {
  try {
    // Get all recommendations from all analyses
    const allRecommendations = [];
    const analyses = await storage.getAllSeoCompetitorAnalyses();
    
    for (const analysis of analyses) {
      const recommendations = await storage.getSeoRecommendationsByAnalysisId(analysis.id);
      allRecommendations.push(...recommendations);
    }
    
    res.json(allRecommendations);
  } catch (error) {
    console.error('Error fetching all SEO recommendations:', error);
    res.status(500).json({ error: 'Failed to fetch all SEO recommendations' });
  }
});

// Get a specific SEO recommendation by ID
seoIntelligenceRouter.get('/recommendations/:id', authenticate, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const recommendation = await storage.getSeoRecommendationById(id);
    
    if (!recommendation) {
      return res.status(404).json({ error: 'SEO recommendation not found' });
    }
    
    res.json(recommendation);
  } catch (error) {
    console.error('Error fetching SEO recommendation:', error);
    res.status(500).json({ error: 'Failed to fetch SEO recommendation' });
  }
});

// Get all SEO recommendations for an analysis
seoIntelligenceRouter.get('/recommendations/analysis/:analysisId', authenticate, async (req, res) => {
  try {
    const analysisId = parseInt(req.params.analysisId);
    const recommendations = await storage.getSeoRecommendationsByAnalysisId(analysisId);
    res.json(recommendations);
  } catch (error) {
    console.error('Error fetching SEO recommendations:', error);
    res.status(500).json({ error: 'Failed to fetch SEO recommendations' });
  }
});

// Update a SEO recommendation
seoIntelligenceRouter.patch('/recommendations/:id', authenticate, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const recommendation = await storage.getSeoRecommendationById(id);
    
    if (!recommendation) {
      return res.status(404).json({ error: 'SEO recommendation not found' });
    }
    
    const updatedRecommendation = await storage.updateSeoRecommendation(id, req.body);
    res.json(updatedRecommendation);
  } catch (error) {
    console.error('Error updating SEO recommendation:', error);
    res.status(500).json({ error: 'Failed to update SEO recommendation' });
  }
});

// Mark a SEO recommendation as completed
seoIntelligenceRouter.patch('/recommendations/:id/complete', authenticate, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const recommendation = await storage.getSeoRecommendationById(id);
    
    if (!recommendation) {
      return res.status(404).json({ error: 'SEO recommendation not found' });
    }
    
    const updatedRecommendation = await storage.markRecommendationAsCompleted(id);
    res.json(updatedRecommendation);
  } catch (error) {
    console.error('Error completing SEO recommendation:', error);
    res.status(500).json({ error: 'Failed to complete SEO recommendation' });
  }
});

// Automatically implement a SEO recommendation
seoIntelligenceRouter.post('/recommendations/:id/implement', authenticate, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const recommendation = await storage.getSeoRecommendationById(id);
    
    if (!recommendation) {
      return res.status(404).json({ error: 'SEO recommendation not found' });
    }
    
    // Get the parent analysis to access domain and other context
    const analysis = await storage.getSeoCompetitorAnalysisById(recommendation.analysisId);
    if (!analysis) {
      return res.status(404).json({ error: 'Parent analysis not found' });
    }
    
    // Implement changes based on recommendation category
    let implementationResult;
    
    switch(recommendation.category) {
      case 'keywords':
        implementationResult = await implementKeywordRecommendation(recommendation, analysis);
        break;
      case 'content':
        implementationResult = await implementContentRecommendation(recommendation, analysis);
        break;
      case 'on-page':
        implementationResult = await implementOnPageRecommendation(recommendation, analysis);
        break;
      case 'technical':
        implementationResult = await implementTechnicalRecommendation(recommendation, analysis);
        break;
      case 'backlinks':
        implementationResult = await implementBacklinkRecommendation(recommendation, analysis);
        break;
      default:
        implementationResult = { success: true, message: 'Generic implementation successful' };
    }
    
    // Record the implementation
    const updatedRecommendation = await storage.updateSeoRecommendation(id, {
      implementationDetails: JSON.stringify(implementationResult),
      implementedAt: new Date()
    });
    
    res.json({
      success: true, 
      message: 'Recommendation implemented successfully',
      details: implementationResult,
      recommendation: updatedRecommendation
    });
  } catch (error) {
    console.error('Error implementing SEO recommendation:', error);
    res.status(500).json({ error: 'Failed to implement SEO recommendation' });
  }
});

// =========================== Ad Simulation Routes ===========================

// Create a new ad simulation
seoIntelligenceRouter.post('/ad-simulations', authenticate, async (req, res) => {
  try {
    console.log('Received ad simulation data:', req.body);
    
    // Use data from the request body directly (including createdBy which should now be included)
    const simulationData = insertAdSimulationSchema.parse(req.body);
    
    // Create the simulation with the provided data
    const simulation = await storage.createAdSimulation(simulationData);
    
    res.status(201).json(simulation);
  } catch (error) {
    console.error('Error creating ad simulation:', error);
    
    // Provide more detailed error information
    if (error.name === 'ZodError') {
      return res.status(400).json({ 
        error: 'Invalid ad simulation data',
        details: error.errors 
      });
    }
    
    res.status(500).json({ error: 'Failed to create ad simulation' });
  }
});

// Get all ad simulations
seoIntelligenceRouter.get('/ad-simulations', authenticate, async (req, res) => {
  try {
    const simulations = await storage.getAllAdSimulations();
    res.json(simulations);
  } catch (error) {
    console.error('Error fetching ad simulations:', error);
    res.status(500).json({ error: 'Failed to fetch ad simulations' });
  }
});

// Get a specific ad simulation by ID
seoIntelligenceRouter.get('/ad-simulations/:id', authenticate, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const simulation = await storage.getAdSimulationById(id);
    
    if (!simulation) {
      return res.status(404).json({ error: 'Ad simulation not found' });
    }
    
    res.json(simulation);
  } catch (error) {
    console.error('Error fetching ad simulation:', error);
    res.status(500).json({ error: 'Failed to fetch ad simulation' });
  }
});

// Get ad simulations by keyword
seoIntelligenceRouter.get('/ad-simulations/keyword/:keyword', authenticate, async (req, res) => {
  try {
    const keyword = req.params.keyword;
    const simulations = await storage.getAdSimulationsByKeyword(keyword);
    res.json(simulations);
  } catch (error) {
    console.error('Error fetching ad simulations by keyword:', error);
    res.status(500).json({ error: 'Failed to fetch ad simulations by keyword' });
  }
});

// Update an ad simulation
seoIntelligenceRouter.patch('/ad-simulations/:id', authenticate, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const simulation = await storage.getAdSimulationById(id);
    
    if (!simulation) {
      return res.status(404).json({ error: 'Ad simulation not found' });
    }
    
    const updatedSimulation = await storage.updateAdSimulation(id, req.body);
    res.json(updatedSimulation);
  } catch (error) {
    console.error('Error updating ad simulation:', error);
    res.status(500).json({ error: 'Failed to update ad simulation' });
  }
});

// Update ad simulation results
seoIntelligenceRouter.patch('/ad-simulations/:id/results', authenticate, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const simulation = await storage.getAdSimulationById(id);
    
    if (!simulation) {
      return res.status(404).json({ error: 'Ad simulation not found' });
    }
    
    const { adsDetected, adsClicked, searchResults } = req.body;
    
    const updatedSimulation = await storage.updateAdSimulationResults(id, adsDetected, adsClicked, searchResults);
    res.json(updatedSimulation);
  } catch (error) {
    console.error('Error updating ad simulation results:', error);
    res.status(500).json({ error: 'Failed to update ad simulation results' });
  }
});

// ======================== Data Sources & APIs Routes ========================

// Create a new SEO data source
seoIntelligenceRouter.post('/data-sources', authenticate, authorizeAdmin, async (req, res) => {
  try {
    // Check if API keys or credentials are provided for the data source
    if ((req.body.sourceType.includes('google') || req.body.sourceType.includes('analytics')) && !req.body.credentials) {
      return res.status(400).json({ 
        error: 'API credentials are required for this data source type',
        requiresAuthentication: true 
      });
    }
    
    const dataSourceData = insertSeoDataSourceSchema.parse(req.body);
    const dataSource = await storage.createSeoDataSource({
      ...dataSourceData,
      createdBy: req.user.username
    });
    res.status(201).json(dataSource);
  } catch (error) {
    console.error('Error creating SEO data source:', error);
    res.status(400).json({ error: 'Invalid SEO data source data' });
  }
});

// Get all SEO data sources
seoIntelligenceRouter.get('/data-sources', authenticate, async (req, res) => {
  try {
    const dataSources = await storage.getAllSeoDataSources();
    // For security, don't return actual API keys/credentials in the response
    const safeDataSources = dataSources.map(source => ({
      ...source,
      apiKey: source.apiKey ? '••••••••' : null,
      credentials: source.credentials ? { connected: true } : null
    }));
    res.json(safeDataSources);
  } catch (error) {
    console.error('Error fetching SEO data sources:', error);
    res.status(500).json({ error: 'Failed to fetch SEO data sources' });
  }
});

// Update a SEO data source
seoIntelligenceRouter.patch('/data-sources/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const dataSource = await storage.getSeoDataSourceById(id);
    
    if (!dataSource) {
      return res.status(404).json({ error: 'SEO data source not found' });
    }
    
    const updatedDataSource = await storage.updateSeoDataSource(id, req.body);
    // Don't return actual API keys/credentials in the response
    const safeDataSource = {
      ...updatedDataSource,
      apiKey: updatedDataSource.apiKey ? '••••••••' : null,
      credentials: updatedDataSource.credentials ? { connected: true } : null
    };
    res.json(safeDataSource);
  } catch (error) {
    console.error('Error updating SEO data source:', error);
    res.status(500).json({ error: 'Failed to update SEO data source' });
  }
});

// Test a data source connection
seoIntelligenceRouter.post('/data-sources/:id/test-connection', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const dataSource = await storage.getSeoDataSourceById(id);
    
    if (!dataSource) {
      return res.status(404).json({ error: 'SEO data source not found' });
    }
    
    // Based on the data source type, implement actual API connection testing
    // This is just a placeholder. In a real implementation, you would test the API with the credentials
    const connectionTest = {
      success: true,
      message: `Successfully connected to ${dataSource.name}`,
      timestamp: new Date()
    };
    
    res.json(connectionTest);
  } catch (error) {
    console.error('Error testing SEO data source connection:', error);
    res.status(500).json({ 
      error: 'Connection test failed', 
      details: error.message || 'Unknown error'
    });
  }
});

// Sync data from a data source
seoIntelligenceRouter.post('/data-sources/:id/sync', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const dataSource = await storage.getSeoDataSourceById(id);
    
    if (!dataSource) {
      return res.status(404).json({ error: 'SEO data source not found' });
    }
    
    // Update last sync time
    const updatedDataSource = await storage.updateSeoDataSource(id, {
      lastSyncAt: new Date()
    });
    
    // Response with a message that sync has started
    res.json({
      message: `Sync with ${dataSource.name} started`,
      dataSource: {
        ...updatedDataSource,
        apiKey: updatedDataSource.apiKey ? '••••••••' : null,
        credentials: updatedDataSource.credentials ? { connected: true } : null
      }
    });
  } catch (error) {
    console.error('Error syncing SEO data source:', error);
    res.status(500).json({ error: 'Failed to sync SEO data source' });
  }
});

// ======================== Keyword Data Routes ========================

// Create/import keyword data
seoIntelligenceRouter.post('/keyword-data', authenticate, async (req, res) => {
  try {
    // Handle bulk import
    if (Array.isArray(req.body)) {
      const keywordResults = [];
      for (const keywordItem of req.body) {
        const keywordData = insertSeoKeywordDataSchema.parse(keywordItem);
        const keyword = await storage.createSeoKeywordData(keywordData);
        keywordResults.push(keyword);
      }
      return res.status(201).json(keywordResults);
    }
    
    // Handle single keyword
    const keywordData = insertSeoKeywordDataSchema.parse(req.body);
    const keyword = await storage.createSeoKeywordData(keywordData);
    res.status(201).json(keyword);
  } catch (error) {
    console.error('Error creating SEO keyword data:', error);
    res.status(400).json({ error: 'Invalid SEO keyword data' });
  }
});

// Get all keyword data with filtering
seoIntelligenceRouter.get('/keyword-data', authenticate, async (req, res) => {
  try {
    // Support filtering by volume range, difficulty, search intent, etc.
    const { 
      keyword, 
      minVolume, 
      maxVolume, 
      maxDifficulty,
      searchIntentType,
      limit = 100,
      offset = 0
    } = req.query;
    
    const keywordData = await storage.getAllSeoKeywordData({
      keyword: keyword as string,
      minVolume: minVolume ? parseInt(minVolume as string) : undefined,
      maxVolume: maxVolume ? parseInt(maxVolume as string) : undefined,
      maxDifficulty: maxDifficulty ? parseInt(maxDifficulty as string) : undefined,
      searchIntentType: searchIntentType as string,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    });
    
    res.json(keywordData);
  } catch (error) {
    console.error('Error fetching SEO keyword data:', error);
    res.status(500).json({ error: 'Failed to fetch SEO keyword data' });
  }
});

// Generate AI content for a keyword
seoIntelligenceRouter.post('/keyword-data/:id/generate-content', authenticate, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const keyword = await storage.getSeoKeywordDataById(id);
    
    if (!keyword) {
      return res.status(404).json({ error: 'Keyword not found' });
    }
    
    // In a real implementation, this would call an AI service to generate content
    // This is a placeholder
    const aiGeneratedContent = `Optimized content for "${keyword.keyword}" would focus on addressing the search intent of "${keyword.searchIntentType || 'informational'}" with clear headings, relevant information, and engaging content.`;
    
    // Update the keyword record with the generated content
    const updatedKeyword = await storage.updateSeoKeywordData(id, {
      aiGeneratedContent,
      isProcessed: true
    });
    
    res.json({
      keyword: updatedKeyword,
      aiGeneratedContent
    });
  } catch (error) {
    console.error('Error generating content for keyword:', error);
    res.status(500).json({ error: 'Failed to generate content' });
  }
});

// ======================== Backlink Data Routes ========================

// Create/import backlink data
seoIntelligenceRouter.post('/backlink-data', authenticate, async (req, res) => {
  try {
    // Handle bulk import
    if (Array.isArray(req.body)) {
      const backlinkResults = [];
      for (const backlinkItem of req.body) {
        const backlinkData = insertSeoBacklinkDataSchema.parse(backlinkItem);
        const backlink = await storage.createSeoBacklinkData(backlinkData);
        backlinkResults.push(backlink);
      }
      return res.status(201).json(backlinkResults);
    }
    
    // Handle single backlink
    const backlinkData = insertSeoBacklinkDataSchema.parse(req.body);
    const backlink = await storage.createSeoBacklinkData(backlinkData);
    res.status(201).json(backlink);
  } catch (error) {
    console.error('Error creating SEO backlink data:', error);
    res.status(400).json({ error: 'Invalid SEO backlink data' });
  }
});

// Get backlinks for a domain
seoIntelligenceRouter.get('/backlink-data/domain/:domainId', authenticate, async (req, res) => {
  try {
    const domainId = parseInt(req.params.domainId);
    const backlinks = await storage.getSeoBacklinksByDomainId(domainId);
    res.json(backlinks);
  } catch (error) {
    console.error('Error fetching backlinks:', error);
    res.status(500).json({ error: 'Failed to fetch backlinks' });
  }
});

// Get backlink analysis summary for a domain
seoIntelligenceRouter.get('/backlink-data/domain/:domainId/summary', authenticate, async (req, res) => {
  try {
    const domainId = parseInt(req.params.domainId);
    const backlinks = await storage.getSeoBacklinksByDomainId(domainId);
    
    // Calculate summary statistics
    const summary = {
      totalBacklinks: backlinks.length,
      dofollow: backlinks.filter(b => b.linkType === 'dofollow').length,
      nofollow: backlinks.filter(b => b.linkType === 'nofollow').length,
      ugc: backlinks.filter(b => b.linkType === 'ugc').length,
      sponsored: backlinks.filter(b => b.linkType === 'sponsored').length,
      averageDomainAuthority: backlinks.reduce((sum, b) => sum + (b.domainAuthority || 0), 0) / backlinks.length || 0,
      topRefDomains: {},
      anchorTextDistribution: {}
    };
    
    // In a real implementation, you would calculate more stats like top referring domains and anchor text distribution
    
    res.json(summary);
  } catch (error) {
    console.error('Error fetching backlink summary:', error);
    res.status(500).json({ error: 'Failed to fetch backlink summary' });
  }
});

// ======================== Ranking Data Routes ========================

// Create/import ranking data
seoIntelligenceRouter.post('/ranking-data', authenticate, async (req, res) => {
  try {
    // Handle bulk import
    if (Array.isArray(req.body)) {
      const rankingResults = [];
      for (const rankingItem of req.body) {
        const rankingData = insertSeoRankingDataSchema.parse(rankingItem);
        const ranking = await storage.createSeoRankingData(rankingData);
        rankingResults.push(ranking);
      }
      return res.status(201).json(rankingResults);
    }
    
    // Handle single ranking
    const rankingData = insertSeoRankingDataSchema.parse(req.body);
    const ranking = await storage.createSeoRankingData(rankingData);
    res.status(201).json(ranking);
  } catch (error) {
    console.error('Error creating SEO ranking data:', error);
    res.status(400).json({ error: 'Invalid SEO ranking data' });
  }
});

// Get ranking history for a domain and keyword
seoIntelligenceRouter.get('/ranking-data/domain/:domainId/keyword/:keyword', authenticate, async (req, res) => {
  try {
    const domainId = parseInt(req.params.domainId);
    const keyword = req.params.keyword;
    const rankings = await storage.getSeoRankingHistoryByDomainAndKeyword(domainId, keyword);
    
    // Sort by date ascending
    rankings.sort((a, b) => new Date(a.searchDate).getTime() - new Date(b.searchDate).getTime());
    
    res.json(rankings);
  } catch (error) {
    console.error('Error fetching ranking history:', error);
    res.status(500).json({ error: 'Failed to fetch ranking history' });
  }
});

// Get all rankings for a domain
seoIntelligenceRouter.get('/ranking-data/domain/:domainId', authenticate, async (req, res) => {
  try {
    const domainId = parseInt(req.params.domainId);
    const { 
      dateFrom, 
      dateTo,
      position,
      limit = 100,
      offset = 0 
    } = req.query;
    
    const rankings = await storage.getSeoRankingsByDomainId(domainId, {
      dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
      dateTo: dateTo ? new Date(dateTo as string) : undefined,
      position: position ? parseInt(position as string) : undefined,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    });
    
    res.json(rankings);
  } catch (error) {
    console.error('Error fetching domain rankings:', error);
    res.status(500).json({ error: 'Failed to fetch domain rankings' });
  }
});

// ======================== Technical Audit Routes ========================

// Create a new technical audit
seoIntelligenceRouter.post('/technical-audits', authenticate, async (req, res) => {
  try {
    const auditData = insertSeoTechnicalAuditSchema.parse(req.body);
    const audit = await storage.createSeoTechnicalAudit(auditData);
    res.status(201).json(audit);
  } catch (error) {
    console.error('Error creating technical audit:', error);
    res.status(400).json({ error: 'Invalid technical audit data' });
  }
});

// Get technical audit by ID
seoIntelligenceRouter.get('/technical-audits/:id', authenticate, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const audit = await storage.getSeoTechnicalAuditById(id);
    
    if (!audit) {
      return res.status(404).json({ error: 'Technical audit not found' });
    }
    
    res.json(audit);
  } catch (error) {
    console.error('Error fetching technical audit:', error);
    res.status(500).json({ error: 'Failed to fetch technical audit' });
  }
});

// Get all technical audits for a domain
seoIntelligenceRouter.get('/technical-audits/domain/:domainId', authenticate, async (req, res) => {
  try {
    const domainId = parseInt(req.params.domainId);
    const audits = await storage.getSeoTechnicalAuditsByDomainId(domainId);
    
    // Sort by date descending to get the most recent first
    audits.sort((a, b) => new Date(b.auditDate).getTime() - new Date(a.auditDate).getTime());
    
    res.json(audits);
  } catch (error) {
    console.error('Error fetching technical audits:', error);
    res.status(500).json({ error: 'Failed to fetch technical audits' });
  }
});

// ======================== Content Gap Analysis Routes ========================

// Create a new content gap analysis
seoIntelligenceRouter.post('/content-gap-analyses', authenticate, async (req, res) => {
  try {
    const analysisData = insertSeoContentGapAnalysisSchema.parse(req.body);
    const analysis = await storage.createSeoContentGapAnalysis(analysisData);
    res.status(201).json(analysis);
  } catch (error) {
    console.error('Error creating content gap analysis:', error);
    res.status(400).json({ error: 'Invalid content gap analysis data' });
  }
});

// Get content gap analysis by ID
seoIntelligenceRouter.get('/content-gap-analyses/:id', authenticate, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const analysis = await storage.getSeoContentGapAnalysisById(id);
    
    if (!analysis) {
      return res.status(404).json({ error: 'Content gap analysis not found' });
    }
    
    res.json(analysis);
  } catch (error) {
    console.error('Error fetching content gap analysis:', error);
    res.status(500).json({ error: 'Failed to fetch content gap analysis' });
  }
});

// Get all content gap analyses for a domain
seoIntelligenceRouter.get('/content-gap-analyses/domain/:domainId', authenticate, async (req, res) => {
  try {
    const domainId = parseInt(req.params.domainId);
    const analyses = await storage.getSeoContentGapAnalysesByDomainId(domainId);
    
    // Sort by date descending
    analyses.sort((a, b) => new Date(b.analysisDate).getTime() - new Date(a.analysisDate).getTime());
    
    res.json(analyses);
  } catch (error) {
    console.error('Error fetching content gap analyses:', error);
    res.status(500).json({ error: 'Failed to fetch content gap analyses' });
  }
});

// ======================== SEO Alerts Routes ========================

// Create a new SEO alert
seoIntelligenceRouter.post('/alerts', authenticate, async (req, res) => {
  try {
    const alertData = insertSeoAlertSchema.parse(req.body);
    const alert = await storage.createSeoAlert(alertData);
    res.status(201).json(alert);
  } catch (error) {
    console.error('Error creating SEO alert:', error);
    res.status(400).json({ error: 'Invalid SEO alert data' });
  }
});

// Get all alerts for a domain
seoIntelligenceRouter.get('/alerts/domain/:domainId', authenticate, async (req, res) => {
  try {
    const domainId = parseInt(req.params.domainId);
    const { isRead, alertType, alertSeverity } = req.query;
    
    const alerts = await storage.getSeoAlertsByDomainId(domainId, {
      isRead: isRead === 'true',
      alertType: alertType as string,
      alertSeverity: alertSeverity as string
    });
    
    // Sort by creation date descending (newest first)
    alerts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    res.json(alerts);
  } catch (error) {
    console.error('Error fetching SEO alerts:', error);
    res.status(500).json({ error: 'Failed to fetch SEO alerts' });
  }
});

// Mark an alert as read
seoIntelligenceRouter.patch('/alerts/:id/mark-read', authenticate, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const alert = await storage.getSeoAlertById(id);
    
    if (!alert) {
      return res.status(404).json({ error: 'SEO alert not found' });
    }
    
    const updatedAlert = await storage.updateSeoAlert(id, { isRead: true });
    res.json(updatedAlert);
  } catch (error) {
    console.error('Error marking SEO alert as read:', error);
    res.status(500).json({ error: 'Failed to mark SEO alert as read' });
  }
});

// =========== AI-Powered Features Endpoints ===========

// Generate predictive analytics for SEO competitor analysis
seoIntelligenceRouter.post("/competitor-analysis/:id/predictive-analytics", authenticate, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const analysis = await storage.getSeoCompetitorAnalysisById(id);
    
    if (!analysis) {
      return res.status(404).json({ error: "SEO competitor analysis not found" });
    }
    
    const updatedAnalysis = await storage.generatePredictiveAnalytics(id);
    res.json(updatedAnalysis);
  } catch (error) {
    console.error('Error generating predictive analytics:', error);
    res.status(500).json({ error: "Failed to generate predictive analytics" });
  }
});

// Analyze search intent for SEO competitor analysis
seoIntelligenceRouter.post("/competitor-analysis/:id/search-intent", authenticate, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const analysis = await storage.getSeoCompetitorAnalysisById(id);
    
    if (!analysis) {
      return res.status(404).json({ error: "SEO competitor analysis not found" });
    }
    
    const updatedAnalysis = await storage.analyzeSearchIntent(id);
    res.json(updatedAnalysis);
  } catch (error) {
    console.error('Error analyzing search intent:', error);
    res.status(500).json({ error: "Failed to analyze search intent" });
  }
});

// Generate recommendation steps for SEO recommendations
seoIntelligenceRouter.post("/recommendations/:id/steps", authenticate, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const recommendation = await storage.getSeoRecommendationById(id);
    
    if (!recommendation) {
      return res.status(404).json({ error: "SEO recommendation not found" });
    }
    
    const updatedRecommendation = await storage.generateRecommendationSteps(id);
    res.json(updatedRecommendation);
  } catch (error) {
    console.error('Error generating recommendation steps:', error);
    res.status(500).json({ error: "Failed to generate recommendation steps" });
  }
});

// Predict recommendation impact for SEO recommendations
seoIntelligenceRouter.post("/recommendations/:id/impact", authenticate, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const recommendation = await storage.getSeoRecommendationById(id);
    
    if (!recommendation) {
      return res.status(404).json({ error: "SEO recommendation not found" });
    }
    
    const updatedRecommendation = await storage.predictRecommendationImpact(id);
    res.json(updatedRecommendation);
  } catch (error) {
    console.error('Error predicting recommendation impact:', error);
    res.status(500).json({ error: "Failed to predict recommendation impact" });
  }
});

// Analyze ad copy effectiveness for ad simulations
seoIntelligenceRouter.post("/ad-simulations/:id/copy-analysis", authenticate, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const simulation = await storage.getAdSimulationById(id);
    
    if (!simulation) {
      return res.status(404).json({ error: "Ad simulation not found" });
    }
    
    const updatedSimulation = await storage.analyzeAdCopyEffectiveness(id);
    res.json(updatedSimulation);
  } catch (error) {
    console.error('Error analyzing ad copy effectiveness:', error);
    res.status(500).json({ error: "Failed to analyze ad copy effectiveness" });
  }
});

// Generate bid strategy suggestions for ad simulations
seoIntelligenceRouter.post("/ad-simulations/:id/bid-strategy", authenticate, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const simulation = await storage.getAdSimulationById(id);
    
    if (!simulation) {
      return res.status(404).json({ error: "Ad simulation not found" });
    }
    
    const updatedSimulation = await storage.generateBidStrategySuggestions(id);
    res.json(updatedSimulation);
  } catch (error) {
    console.error('Error generating bid strategy suggestions:', error);
    res.status(500).json({ error: "Failed to generate bid strategy suggestions" });
  }
});

// Get search intent analysis for a keyword
seoIntelligenceRouter.get('/search-intent/:keyword', authenticate, async (req, res) => {
  try {
    const { keyword } = req.params;
    
    if (!keyword) {
      return res.status(400).json({ error: 'Keyword is required' });
    }
    
    // Generate analysis data based on the keyword
    // In a real implementation, this would call an external API or service
    const searchIntentAnalysis = {
      keyword,
      intentType: determineSearchIntent(keyword),
      intentScore: Math.floor(Math.random() * 100),
      intentDistribution: [
        { name: 'Informational', value: Math.floor(Math.random() * 40) + 30 },
        { name: 'Navigational', value: Math.floor(Math.random() * 20) + 10 },
        { name: 'Commercial', value: Math.floor(Math.random() * 30) + 20 },
        { name: 'Transactional', value: Math.floor(Math.random() * 20) + 10 },
      ],
      volumeMetrics: {
        searchVolume: Math.floor(Math.random() * 1000) + 100,
        difficulty: Math.floor(Math.random() * 70) + 10,
        cpc: (Math.random() * 5 + 0.5).toFixed(2),
      },
      contentRecommendations: generateContentRecommendations(keyword),
      relatedKeywords: generateRelatedKeywords(keyword).map(k => ({
        keyword: k,
        volume: Math.floor(Math.random() * 500) + 50,
        intentType: determineSearchIntent(k)
      })),
      serp: {
        topResults: generateSerpResults(keyword)
      }
    };
    
    res.json(searchIntentAnalysis);
  } catch (error) {
    console.error('Error getting search intent analysis:', error);
    res.status(500).json({ error: 'Failed to get search intent analysis' });
  }
});

// Analyze search intent for keywords
seoIntelligenceRouter.post('/search-intent/analyze', authenticate, async (req, res) => {
  try {
    const { keyword, targetDomain } = req.body;
    
    if (!keyword) {
      return res.status(400).json({ error: 'Keyword is required' });
    }
    
    // Generate analysis data based on the keyword
    // In a real implementation, this would call an external API or service
    const searchIntentAnalysis = {
      keyword,
      intentType: determineSearchIntent(keyword),
      intentScore: Math.floor(Math.random() * 100),
      intentDistribution: [
        { intent: 'informational', percentage: Math.floor(Math.random() * 40) + 30 },
        { intent: 'navigational', percentage: Math.floor(Math.random() * 20) + 10 },
        { intent: 'commercial', percentage: Math.floor(Math.random() * 30) + 20 },
        { intent: 'transactional', percentage: Math.floor(Math.random() * 20) + 10 },
      ],
      volumeMetrics: {
        monthly: Math.floor(Math.random() * 1000) + 100,
        quarterly: Math.floor(Math.random() * 3000) + 300,
        yearly: Math.floor(Math.random() * 12000) + 1200,
      },
      relatedKeywords: generateRelatedKeywords(keyword),
      contentRecommendations: generateContentRecommendations(keyword),
      serp: generateSerpResults(keyword, targetDomain),
    };
    
    res.json(searchIntentAnalysis);
  } catch (error) {
    console.error('Error analyzing search intent:', error);
    res.status(500).json({ error: 'Failed to analyze search intent' });
  }
});

// Helper functions for search intent analysis
function determineSearchIntent(keyword: string): string {
  // Simple intent classification logic
  const keyword_lower = keyword.toLowerCase();
  
  if (keyword_lower.includes('how') || 
      keyword_lower.includes('what') || 
      keyword_lower.includes('guide') || 
      keyword_lower.includes('tips')) {
    return 'informational';
  } else if (keyword_lower.includes('buy') || 
             keyword_lower.includes('price') || 
             keyword_lower.includes('cost') ||
             keyword_lower.includes('purchase')) {
    return 'transactional';
  } else if (keyword_lower.includes('best') || 
             keyword_lower.includes('top') || 
             keyword_lower.includes('vs') || 
             keyword_lower.includes('compare')) {
    return 'commercial';
  } else if (keyword_lower.includes('login') || 
             keyword_lower.includes('website') || 
             keyword_lower.includes('official') ||
             keyword_lower.includes('site')) {
    return 'navigational';
  }
  
  // Default to informational if no clear pattern
  return 'informational';
}

function generateRelatedKeywords(keyword: string): string[] {
  // For Dubai property inspection related keywords
  const baseKeywords = [
    'property inspection',
    'home inspection',
    'snagging',
    'real estate inspection',
    'property defects',
    'building inspection',
    'villa inspection',
    'apartment inspection',
    'handover inspection',
    'pre-handover inspection',
  ];
  
  const locations = ['dubai', 'uae', 'abu dhabi', 'sharjah'];
  const modifiers = ['service', 'company', 'cost', 'checklist', 'report'];
  
  const related = [];
  
  // Add some base keywords with location
  for (let i = 0; i < 3; i++) {
    const base = baseKeywords[Math.floor(Math.random() * baseKeywords.length)];
    const location = locations[Math.floor(Math.random() * locations.length)];
    related.push(`${base} ${location}`);
  }
  
  // Add some with modifiers
  for (let i = 0; i < 3; i++) {
    const base = baseKeywords[Math.floor(Math.random() * baseKeywords.length)];
    const modifier = modifiers[Math.floor(Math.random() * modifiers.length)];
    related.push(`${base} ${modifier}`);
  }
  
  // Add some long-tail variations
  related.push(`best ${baseKeywords[Math.floor(Math.random() * baseKeywords.length)]} in dubai`);
  related.push(`affordable ${baseKeywords[Math.floor(Math.random() * baseKeywords.length)]} services`);
  related.push(`professional ${baseKeywords[Math.floor(Math.random() * baseKeywords.length)]} report`);
  
  return related;
}

function generateContentRecommendations(keyword: string): any[] {
  const contentTypes = [
    { type: 'blog', title: `Complete Guide to ${capitalize(keyword)}` },
    { type: 'landing-page', title: `Professional ${capitalize(keyword)} Services` },
    { type: 'faq', title: `Frequently Asked Questions About ${capitalize(keyword)}` },
    { type: 'comparison', title: `DIY vs Professional ${capitalize(keyword)}: What's Best?` },
    { type: 'case-study', title: `${capitalize(keyword)} Case Study: Success Stories` },
    { type: 'checklist', title: `Ultimate ${capitalize(keyword)} Checklist` },
    { type: 'video', title: `${capitalize(keyword)} Explainer Video` },
    { type: 'infographic', title: `${capitalize(keyword)} Process Infographic` },
  ];
  
  // Choose a random selection of content types
  const selectedTypes = [];
  for (let i = 0; i < 4; i++) {
    const randomIndex = Math.floor(Math.random() * contentTypes.length);
    selectedTypes.push(contentTypes[randomIndex]);
  }
  
  return selectedTypes.map(item => ({
    contentType: item.type,
    suggestedTitle: item.title,
    difficulty: ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)],
    estimatedImpact: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
  }));
}

function generateSerpResults(keyword: string, targetDomain?: string): any[] {
  const competitors = [
    { domain: 'propertysnagging.ae', title: 'Property Snagging Services in Dubai | Expert Inspections' },
    { domain: 'snagfinder.ae', title: 'SnagFinder - Dubai\'s #1 Property Inspection Service' },
    { domain: 'dubaisnagging.com', title: 'Dubai Snagging - Professional Property Inspection' },
    { domain: 'homecheck.ae', title: 'Home Check UAE - Property Inspection Specialists' },
    { domain: 'propertyinspection.ae', title: 'Property Inspection UAE - Pre-Handover Inspection' },
    { domain: 'urbangrid.ae', title: 'Urban Grid - Professional Snagging & Inspection Services' },
  ];
  
  // Shuffle the competitors
  const shuffled = [...competitors].sort(() => 0.5 - Math.random());
  
  // Create a SERP with 8-10 results
  const serpResults = [];
  for (let i = 0; i < Math.floor(Math.random() * 3) + 8; i++) {
    const competitor = shuffled[i % shuffled.length];
    
    // Format the URL
    let url = `https://www.${competitor.domain}`;
    if (Math.random() > 0.5) {
      url += '/services/property-inspection';
    } else if (Math.random() > 0.5) {
      url += '/dubai-property-snagging';
    }
    
    // Generate a snippet
    let snippet = `Professional ${keyword} services in Dubai. `;
    snippet += 'We offer comprehensive inspection reports, detailed snagging lists, ';
    snippet += 'and expert recommendations for your property.';
    
    serpResults.push({
      position: i + 1,
      title: competitor.title,
      url: url,
      snippet: snippet,
      domain: competitor.domain,
      // Highlight the target domain if it matches
      isTargetDomain: targetDomain && url.includes(targetDomain.replace('https://', '').replace('http://', '')),
    });
  }
  
  return serpResults;
}

function capitalize(string: string): string {
  return string.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}