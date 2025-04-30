import { google, searchconsole_v1 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

/**
 * Google Search Console API Service
 * Handles authentication and data fetching from Google Search Console
 */
export class GoogleSearchConsoleService {
  private client: OAuth2Client;
  private searchConsole: searchconsole_v1.Searchconsole;
  private isAuthenticated: boolean = false;

  /**
   * Create a new GoogleSearchConsoleService instance
   * @param clientId Google API client ID
   * @param clientSecret Google API client secret
   * @param redirectUri OAuth redirect URI
   */
  constructor(
    private clientId: string,
    private clientSecret: string,
    private redirectUri: string
  ) {
    this.client = new google.auth.OAuth2(
      this.clientId,
      this.clientSecret,
      this.redirectUri
    );
    this.searchConsole = google.searchconsole({
      version: 'v1',
      auth: this.client
    });
  }

  /**
   * Get OAuth2 authorization URL
   * @returns URL to redirect user for OAuth2 authorization
   */
  getAuthUrl(): string {
    const scopes = [
      'https://www.googleapis.com/auth/webmasters',
      'https://www.googleapis.com/auth/webmasters.readonly'
    ];

    return this.client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent' // Force refresh token generation
    });
  }

  /**
   * Set credentials from the authorization code
   * @param code Authorization code from OAuth callback
   * @returns Object containing tokens
   */
  async setCredentialsFromCode(code: string): Promise<any> {
    const { tokens } = await this.client.getToken(code);
    this.client.setCredentials(tokens);
    this.isAuthenticated = true;
    return tokens;
  }

  /**
   * Set credentials directly from tokens
   * @param tokens OAuth tokens object containing access_token, refresh_token, etc.
   */
  setCredentials(tokens: any): void {
    this.client.setCredentials(tokens);
    this.isAuthenticated = true;
  }

  /**
   * Check if credentials have been set
   */
  checkAuthentication(): boolean {
    return this.isAuthenticated;
  }

  /**
   * Get list of verified sites
   * @returns Array of sites
   */
  async getSites(): Promise<any[]> {
    if (!this.isAuthenticated) {
      throw new Error('Authentication required');
    }

    const response = await this.searchConsole.sites.list();
    return response.data.siteEntry || [];
  }

  /**
   * Get performance data (query, pages, etc.)
   * @param siteUrl Site URL (must be verified in Search Console)
   * @param startDate Start date in ISO format (YYYY-MM-DD)
   * @param endDate End date in ISO format (YYYY-MM-DD)
   * @param dimensions Data dimensions (e.g., 'query', 'page', 'device', 'country')
   * @param rowLimit Maximum number of rows to return
   * @returns Performance data
   */
  async getPerformanceReport(
    siteUrl: string,
    startDate: string,
    endDate: string,
    dimensions: string[] = ['query'],
    rowLimit: number = 1000
  ): Promise<any> {
    if (!this.isAuthenticated) {
      throw new Error('Authentication required');
    }

    const request = {
      siteUrl,
      requestBody: {
        startDate,
        endDate,
        dimensions,
        rowLimit,
        aggregationType: 'auto',
      }
    };

    const response = await this.searchConsole.searchanalytics.query(request);
    return response.data;
  }

  /**
   * Get keyword ranking data
   * @param siteUrl Site URL (must be verified in Search Console)
   * @param startDate Start date in ISO format (YYYY-MM-DD)
   * @param endDate End date in ISO format (YYYY-MM-DD)
   * @param keywords Optional array of specific keywords to filter by
   * @returns Keyword ranking data
   */
  async getKeywordRankings(
    siteUrl: string,
    startDate: string,
    endDate: string,
    keywords?: string[]
  ): Promise<any> {
    const data = await this.getPerformanceReport(
      siteUrl,
      startDate,
      endDate,
      ['query'],
      5000
    );

    // If keywords filter is provided, filter the results
    if (keywords && keywords.length > 0) {
      if (data.rows) {
        data.rows = data.rows.filter((row: any) => 
          keywords.some(keyword => 
            row.keys[0].toLowerCase().includes(keyword.toLowerCase())
          )
        );
      }
    }

    return data;
  }
  
  /**
   * Get page performance data
   * @param siteUrl Site URL (must be verified in Search Console)
   * @param startDate Start date in ISO format (YYYY-MM-DD)
   * @param endDate End date in ISO format (YYYY-MM-DD)
   * @returns Page performance data
   */
  async getPagePerformance(
    siteUrl: string,
    startDate: string,
    endDate: string
  ): Promise<any> {
    return this.getPerformanceReport(
      siteUrl,
      startDate,
      endDate,
      ['page'],
      1000
    );
  }

  /**
   * Get device-based performance data
   * @param siteUrl Site URL (must be verified in Search Console)
   * @param startDate Start date in ISO format (YYYY-MM-DD)
   * @param endDate End date in ISO format (YYYY-MM-DD)
   * @returns Device performance data
   */
  async getDevicePerformance(
    siteUrl: string,
    startDate: string,
    endDate: string
  ): Promise<any> {
    return this.getPerformanceReport(
      siteUrl,
      startDate,
      endDate,
      ['device'],
      10
    );
  }

  /**
   * Get country-based performance data
   * @param siteUrl Site URL (must be verified in Search Console)
   * @param startDate Start date in ISO format (YYYY-MM-DD)
   * @param endDate End date in ISO format (YYYY-MM-DD)
   * @returns Country performance data
   */
  async getCountryPerformance(
    siteUrl: string,
    startDate: string,
    endDate: string
  ): Promise<any> {
    return this.getPerformanceReport(
      siteUrl,
      startDate,
      endDate,
      ['country'],
      100
    );
  }

  /**
   * Get comparison data between site and competitor for specific keywords
   * @param siteUrl Site URL (must be verified in Search Console)
   * @param competitorDomain Competitor domain (not verified, just for filtering)
   * @param keywords Keywords to analyze
   * @param startDate Start date in ISO format (YYYY-MM-DD)
   * @param endDate End date in ISO format (YYYY-MM-DD)
   * @returns Comparison data
   */
  async getCompetitorComparison(
    siteUrl: string,
    keywords: string[],
    startDate: string,
    endDate: string
  ): Promise<any> {
    // Get own site performance data for these keywords
    const ownData = await this.getKeywordRankings(
      siteUrl,
      startDate,
      endDate,
      keywords
    );

    // Process the data
    return {
      siteDomain: siteUrl,
      keywordsAnalyzed: keywords,
      dateRange: {
        startDate,
        endDate
      },
      performanceData: ownData,
      // Note: For competitor data, we'd need to either use another API
      // or have the competitor's GSC connected too
      competitorInsights: {
        note: "Competitor direct ranking data requires either access to their GSC or third-party SEO tools",
        estimatedCompetition: true
      }
    };
  }
}