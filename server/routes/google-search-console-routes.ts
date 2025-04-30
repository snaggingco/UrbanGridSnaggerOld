import { Router, Request, Response } from 'express';
import { GoogleSearchConsoleService } from '../services/google-search-console';
import { IStorage } from '../storage';

export const createGoogleSearchConsoleRoutes = (storage: IStorage) => {
  const router = Router();
  
  // Google API credentials from environment variables
  const clientId = process.env.GOOGLE_CLIENT_ID || '';
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/seo/google/oauth/callback';
  
  // Initialize Google Search Console service
  const gscService = new GoogleSearchConsoleService(clientId, clientSecret, redirectUri);

  /**
   * Get OAuth URL for authorizing with Google
   */
  router.get('/auth/url', (req: Request, res: Response) => {
    try {
      const authUrl = gscService.getAuthUrl();
      res.json({ url: authUrl });
    } catch (error) {
      console.error('Error generating auth URL:', error);
      res.status(500).json({ error: 'Failed to generate authentication URL' });
    }
  });

  /**
   * OAuth callback endpoint
   */
  router.get('/oauth/callback', async (req: Request, res: Response) => {
    try {
      const { code } = req.query;
      
      if (!code || typeof code !== 'string') {
        return res.status(400).json({ error: 'Missing or invalid authorization code' });
      }
      
      // Exchange code for tokens
      const tokens = await gscService.setCredentialsFromCode(code);
      
      // Save tokens to database for future use
      const dataSourceName = 'Google Search Console';
      const existingSource = await storage.getSeoDataSourceByName(dataSourceName);
      
      if (existingSource) {
        // Update existing data source
        await storage.updateSeoDataSource(existingSource.id, {
          credentials: tokens,
          status: 'active',
          lastSyncAt: new Date()
        });
      } else {
        // Create new data source entry
        await storage.createSeoDataSource({
          name: dataSourceName,
          sourceType: 'google_search_console',
          credentials: tokens,
          status: 'active',
          createdBy: 'system'
        });
      }
      
      // Redirect to the application's SEO dashboard
      res.redirect('/seo/intelligence?connected=google');
    } catch (error) {
      console.error('OAuth callback error:', error);
      res.status(500).json({ error: 'Failed to authenticate with Google' });
    }
  });

  /**
   * Get list of verified sites
   */
  router.get('/sites', async (req: Request, res: Response) => {
    try {
      // Get GSC credentials from database
      const gscDataSource = await storage.getSeoDataSourceByType('google_search_console');
      
      if (!gscDataSource || !gscDataSource.credentials) {
        return res.status(401).json({ error: 'Google Search Console not connected' });
      }
      
      // Set credentials
      gscService.setCredentials(gscDataSource.credentials);
      
      // Get sites
      const sites = await gscService.getSites();
      res.json(sites);
    } catch (error) {
      console.error('Error fetching sites:', error);
      res.status(500).json({ error: 'Failed to fetch sites from Google Search Console' });
    }
  });

  /**
   * Get search performance data
   */
  router.post('/performance', async (req: Request, res: Response) => {
    try {
      const { siteUrl, startDate, endDate, dimensions, rowLimit } = req.body;
      
      if (!siteUrl || !startDate || !endDate) {
        return res.status(400).json({ error: 'Missing required parameters' });
      }
      
      // Get GSC credentials from database
      const gscDataSource = await storage.getSeoDataSourceByType('google_search_console');
      
      if (!gscDataSource || !gscDataSource.credentials) {
        return res.status(401).json({ error: 'Google Search Console not connected' });
      }
      
      // Set credentials
      gscService.setCredentials(gscDataSource.credentials);
      
      // Get performance data
      const performanceData = await gscService.getPerformanceReport(
        siteUrl,
        startDate,
        endDate,
        dimensions || ['query'],
        rowLimit || 1000
      );
      
      res.json(performanceData);
    } catch (error) {
      console.error('Error fetching performance data:', error);
      res.status(500).json({ error: 'Failed to fetch performance data from Google Search Console' });
    }
  });

  /**
   * Get keyword ranking data
   */
  router.post('/keywords', async (req: Request, res: Response) => {
    try {
      const { siteUrl, startDate, endDate, keywords } = req.body;
      
      if (!siteUrl || !startDate || !endDate) {
        return res.status(400).json({ error: 'Missing required parameters' });
      }
      
      // Get GSC credentials from database
      const gscDataSource = await storage.getSeoDataSourceByType('google_search_console');
      
      if (!gscDataSource || !gscDataSource.credentials) {
        return res.status(401).json({ error: 'Google Search Console not connected' });
      }
      
      // Set credentials
      gscService.setCredentials(gscDataSource.credentials);
      
      // Get keyword rankings
      const keywordData = await gscService.getKeywordRankings(
        siteUrl,
        startDate,
        endDate,
        keywords
      );
      
      res.json(keywordData);
    } catch (error) {
      console.error('Error fetching keyword data:', error);
      res.status(500).json({ error: 'Failed to fetch keyword data from Google Search Console' });
    }
  });

  /**
   * Get pages performance data
   */
  router.post('/pages', async (req: Request, res: Response) => {
    try {
      const { siteUrl, startDate, endDate } = req.body;
      
      if (!siteUrl || !startDate || !endDate) {
        return res.status(400).json({ error: 'Missing required parameters' });
      }
      
      // Get GSC credentials from database
      const gscDataSource = await storage.getSeoDataSourceByType('google_search_console');
      
      if (!gscDataSource || !gscDataSource.credentials) {
        return res.status(401).json({ error: 'Google Search Console not connected' });
      }
      
      // Set credentials
      gscService.setCredentials(gscDataSource.credentials);
      
      // Get pages performance
      const pagesData = await gscService.getPagePerformance(
        siteUrl,
        startDate,
        endDate
      );
      
      res.json(pagesData);
    } catch (error) {
      console.error('Error fetching page data:', error);
      res.status(500).json({ error: 'Failed to fetch page data from Google Search Console' });
    }
  });

  /**
   * Get device performance data
   */
  router.post('/devices', async (req: Request, res: Response) => {
    try {
      const { siteUrl, startDate, endDate } = req.body;
      
      if (!siteUrl || !startDate || !endDate) {
        return res.status(400).json({ error: 'Missing required parameters' });
      }
      
      // Get GSC credentials from database
      const gscDataSource = await storage.getSeoDataSourceByType('google_search_console');
      
      if (!gscDataSource || !gscDataSource.credentials) {
        return res.status(401).json({ error: 'Google Search Console not connected' });
      }
      
      // Set credentials
      gscService.setCredentials(gscDataSource.credentials);
      
      // Get device performance
      const deviceData = await gscService.getDevicePerformance(
        siteUrl,
        startDate,
        endDate
      );
      
      res.json(deviceData);
    } catch (error) {
      console.error('Error fetching device data:', error);
      res.status(500).json({ error: 'Failed to fetch device data from Google Search Console' });
    }
  });

  /**
   * Get countries performance data
   */
  router.post('/countries', async (req: Request, res: Response) => {
    try {
      const { siteUrl, startDate, endDate } = req.body;
      
      if (!siteUrl || !startDate || !endDate) {
        return res.status(400).json({ error: 'Missing required parameters' });
      }
      
      // Get GSC credentials from database
      const gscDataSource = await storage.getSeoDataSourceByType('google_search_console');
      
      if (!gscDataSource || !gscDataSource.credentials) {
        return res.status(401).json({ error: 'Google Search Console not connected' });
      }
      
      // Set credentials
      gscService.setCredentials(gscDataSource.credentials);
      
      // Get country performance
      const countryData = await gscService.getCountryPerformance(
        siteUrl,
        startDate,
        endDate
      );
      
      res.json(countryData);
    } catch (error) {
      console.error('Error fetching country data:', error);
      res.status(500).json({ error: 'Failed to fetch country data from Google Search Console' });
    }
  });

  /**
   * Get competitor comparison data
   */
  router.post('/competitor-comparison', async (req: Request, res: Response) => {
    try {
      const { siteUrl, keywords, startDate, endDate } = req.body;
      
      if (!siteUrl || !keywords || !keywords.length || !startDate || !endDate) {
        return res.status(400).json({ error: 'Missing required parameters' });
      }
      
      // Get GSC credentials from database
      const gscDataSource = await storage.getSeoDataSourceByType('google_search_console');
      
      if (!gscDataSource || !gscDataSource.credentials) {
        return res.status(401).json({ error: 'Google Search Console not connected' });
      }
      
      // Set credentials
      gscService.setCredentials(gscDataSource.credentials);
      
      // Get competitor comparison
      const comparisonData = await gscService.getCompetitorComparison(
        siteUrl,
        keywords,
        startDate,
        endDate
      );
      
      res.json(comparisonData);
    } catch (error) {
      console.error('Error fetching competitor comparison:', error);
      res.status(500).json({ error: 'Failed to fetch competitor comparison data' });
    }
  });

  return router;
};