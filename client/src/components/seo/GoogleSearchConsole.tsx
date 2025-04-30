import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertCircle, Check, LineChart, ArrowRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  BarChart, 
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts";

interface SearchConsoleSite {
  siteUrl: string;
  permissionLevel: string;
}

interface PerformanceData {
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  date: string;
}

interface KeywordData {
  keyword: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

interface PageData {
  page: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

interface DeviceData {
  device: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

interface CountryData {
  country: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

interface CompetitorData {
  competitor: string;
  keywordOverlap: number;
  avgPosition: number;
  rankedKeywords: number;
  topKeywords: { keyword: string; position: number }[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function GoogleSearchConsole() {
  const [activeSubTab, setActiveSubTab] = useState("performance");
  const [selectedSite, setSelectedSite] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState("last28");
  
  // Check if Google Search Console is authorized
  const { data: authData, isLoading: authLoading } = useQuery({
    queryKey: ['/api/google-search-console/auth/url'],
    enabled: true,
  });
  
  // Get verified sites
  const { 
    data: sitesData, 
    isLoading: sitesLoading,
    refetch: refetchSites
  } = useQuery({
    queryKey: ['/api/google-search-console/sites'],
    enabled: true,
  });
  
  // Performance data query
  const { 
    data: performanceData,
    isLoading: performanceLoading,
  } = useQuery({
    queryKey: ['/api/google-search-console/performance', selectedSite, dateRange],
    queryFn: () => apiRequest('/api/google-search-console/performance', {
      method: 'POST',
      body: {
        siteUrl: selectedSite,
        dateRange: dateRange
      }
    }),
    enabled: !!selectedSite,
  });
  
  // Keywords data query
  const { 
    data: keywordsData,
    isLoading: keywordsLoading,
  } = useQuery({
    queryKey: ['/api/google-search-console/keywords', selectedSite, dateRange],
    queryFn: () => apiRequest('/api/google-search-console/keywords', {
      method: 'POST',
      body: {
        siteUrl: selectedSite,
        dateRange: dateRange
      }
    }),
    enabled: !!selectedSite && activeSubTab === "keywords",
  });
  
  // Pages data query
  const { 
    data: pagesData,
    isLoading: pagesLoading,
  } = useQuery({
    queryKey: ['/api/google-search-console/pages', selectedSite, dateRange],
    queryFn: () => apiRequest('/api/google-search-console/pages', {
      method: 'POST',
      body: {
        siteUrl: selectedSite,
        dateRange: dateRange
      }
    }),
    enabled: !!selectedSite && activeSubTab === "pages",
  });
  
  // Device data query
  const { 
    data: devicesData,
    isLoading: devicesLoading,
  } = useQuery({
    queryKey: ['/api/google-search-console/devices', selectedSite, dateRange],
    queryFn: () => apiRequest('/api/google-search-console/devices', {
      method: 'POST',
      body: {
        siteUrl: selectedSite,
        dateRange: dateRange
      }
    }),
    enabled: !!selectedSite && activeSubTab === "devices",
  });
  
  // Countries data query
  const { 
    data: countriesData,
    isLoading: countriesLoading,
  } = useQuery({
    queryKey: ['/api/google-search-console/countries', selectedSite, dateRange],
    queryFn: () => apiRequest('/api/google-search-console/countries', {
      method: 'POST',
      body: {
        siteUrl: selectedSite,
        dateRange: dateRange
      }
    }),
    enabled: !!selectedSite && activeSubTab === "countries",
  });
  
  // Competitor comparison query
  const { 
    data: competitorData,
    isLoading: competitorLoading,
  } = useQuery({
    queryKey: ['/api/google-search-console/competitor-comparison', selectedSite],
    queryFn: () => apiRequest('/api/google-search-console/competitor-comparison', {
      method: 'POST',
      body: {
        siteUrl: selectedSite
      }
    }),
    enabled: !!selectedSite && activeSubTab === "competitors",
  });
  
  // Handle authorization
  const handleAuth = () => {
    if (authData?.authUrl) {
      window.open(authData.authUrl, "_blank");
    }
  };
  
  // Format date range for display
  const formatDateRange = (range: string) => {
    switch (range) {
      case "last7":
        return "Last 7 Days";
      case "last28":
        return "Last 28 Days";
      case "last90":
        return "Last 90 Days";
      case "last180":
        return "Last 180 Days";
      case "lastYear":
        return "Last Year";
      default:
        return "Last 28 Days";
    }
  };
  
  // Check if we need to authenticate
  const needsAuth = !sitesData || sitesData.length === 0;
  
  // Update selected site when sites are loaded
  useEffect(() => {
    if (sitesData && sitesData.length > 0 && !selectedSite) {
      setSelectedSite(sitesData[0].siteUrl);
    }
  }, [sitesData, selectedSite]);
  
  // Authorization screen
  if (needsAuth) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Google Search Console Integration</CardTitle>
          <CardDescription>
            Connect your Google Search Console account to access performance data and insights
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="warning">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Authentication Required</AlertTitle>
            <AlertDescription>
              You need to authorize access to your Google Search Console data to use this feature.
            </AlertDescription>
          </Alert>
          
          <Button onClick={handleAuth} disabled={!authData}>
            {authLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                Connect to Google Search Console
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </CardContent>
        <CardFooter className="text-sm text-muted-foreground">
          Your data will be securely processed and stored in accordance with our privacy policy.
        </CardFooter>
      </Card>
    );
  }
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <LineChart className="mr-2 h-5 w-5" />
              Google Search Console Analytics
            </div>
            <Select
              value={selectedSite || ""}
              onValueChange={setSelectedSite}
            >
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Select a site" />
              </SelectTrigger>
              <SelectContent>
                {sitesData?.map((site: SearchConsoleSite) => (
                  <SelectItem key={site.siteUrl} value={site.siteUrl}>
                    {site.siteUrl}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardTitle>
          <CardDescription>
            View and analyze your website's search performance data from Google Search Console
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
              <TabsList>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="keywords">Keywords</TabsTrigger>
                <TabsTrigger value="pages">Pages</TabsTrigger>
                <TabsTrigger value="devices">Devices</TabsTrigger>
                <TabsTrigger value="countries">Countries</TabsTrigger>
                <TabsTrigger value="competitors">Competitors</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <Select
              value={dateRange}
              onValueChange={setDateRange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last7">Last 7 Days</SelectItem>
                <SelectItem value="last28">Last 28 Days</SelectItem>
                <SelectItem value="last90">Last 90 Days</SelectItem>
                <SelectItem value="last180">Last 180 Days</SelectItem>
                <SelectItem value="lastYear">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-4">
            {performanceLoading ? (
              <div className="w-full h-60 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : performanceData ? (
              <>
                <div className="grid grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="py-3">
                      <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{performanceData.totals?.clicks || 0}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="py-3">
                      <CardTitle className="text-sm font-medium">Total Impressions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{performanceData.totals?.impressions || 0}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="py-3">
                      <CardTitle className="text-sm font-medium">Avg. CTR</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{((performanceData.totals?.ctr || 0) * 100).toFixed(2)}%</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="py-3">
                      <CardTitle className="text-sm font-medium">Avg. Position</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{(performanceData.totals?.position || 0).toFixed(1)}</div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Over Time</CardTitle>
                    <CardDescription>
                      {formatDateRange(dateRange)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <AreaChart
                        data={performanceData.rows || []}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={(date) => format(new Date(date), "MMM d")} 
                        />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip 
                          labelFormatter={(date) => format(new Date(date), "MMM d, yyyy")} 
                          formatter={(value, name) => {
                            if (name === "ctr") return [((value as number) * 100).toFixed(2) + "%", "CTR"];
                            if (name === "position") return [(value as number).toFixed(1), "Position"];
                            return [value, name];
                          }}
                        />
                        <Legend />
                        <Area 
                          yAxisId="left"
                          type="monotone" 
                          dataKey="clicks" 
                          name="Clicks"
                          stroke="#8884d8" 
                          fill="#8884d8" 
                          fillOpacity={0.3} 
                        />
                        <Area 
                          yAxisId="left"
                          type="monotone" 
                          dataKey="impressions" 
                          name="Impressions"
                          stroke="#82ca9d" 
                          fill="#82ca9d" 
                          fillOpacity={0.3}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No Data Available</AlertTitle>
                <AlertDescription>
                  There is no performance data available for the selected site and date range.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
          
          {/* Keywords Tab */}
          <TabsContent value="keywords" className="space-y-4">
            {keywordsLoading ? (
              <div className="w-full h-60 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : keywordsData ? (
              <Card>
                <CardHeader>
                  <CardTitle>Top Keywords</CardTitle>
                  <CardDescription>
                    {formatDateRange(dateRange)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableCaption>Keywords driving traffic to your site</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Keyword</TableHead>
                        <TableHead className="text-right">Clicks</TableHead>
                        <TableHead className="text-right">Impressions</TableHead>
                        <TableHead className="text-right">CTR</TableHead>
                        <TableHead className="text-right">Position</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {keywordsData.rows?.map((keyword: KeywordData, index: number) => (
                        <TableRow key={index}>
                          <TableCell>{keyword.keyword}</TableCell>
                          <TableCell className="text-right">{keyword.clicks}</TableCell>
                          <TableCell className="text-right">{keyword.impressions}</TableCell>
                          <TableCell className="text-right">{(keyword.ctr * 100).toFixed(2)}%</TableCell>
                          <TableCell className="text-right">{keyword.position.toFixed(1)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No Data Available</AlertTitle>
                <AlertDescription>
                  There is no keyword data available for the selected site and date range.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
          
          {/* Pages Tab */}
          <TabsContent value="pages" className="space-y-4">
            {pagesLoading ? (
              <div className="w-full h-60 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : pagesData ? (
              <Card>
                <CardHeader>
                  <CardTitle>Top Pages</CardTitle>
                  <CardDescription>
                    {formatDateRange(dateRange)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableCaption>Pages with the most search traffic</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Page</TableHead>
                        <TableHead className="text-right">Clicks</TableHead>
                        <TableHead className="text-right">Impressions</TableHead>
                        <TableHead className="text-right">CTR</TableHead>
                        <TableHead className="text-right">Position</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pagesData.rows?.map((page: PageData, index: number) => (
                        <TableRow key={index}>
                          <TableCell className="max-w-[300px] truncate">{page.page}</TableCell>
                          <TableCell className="text-right">{page.clicks}</TableCell>
                          <TableCell className="text-right">{page.impressions}</TableCell>
                          <TableCell className="text-right">{(page.ctr * 100).toFixed(2)}%</TableCell>
                          <TableCell className="text-right">{page.position.toFixed(1)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No Data Available</AlertTitle>
                <AlertDescription>
                  There is no page data available for the selected site and date range.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
          
          {/* Devices Tab */}
          <TabsContent value="devices" className="space-y-4">
            {devicesLoading ? (
              <div className="w-full h-60 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : devicesData ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Device Distribution</CardTitle>
                    <CardDescription>
                      {formatDateRange(dateRange)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex justify-center">
                    <div className="w-full max-w-lg">
                      <ResponsiveContainer width="100%" height={400}>
                        <PieChart>
                          <Pie
                            data={devicesData.rows || []}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            label={({ device, percent }) => `${device}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={150}
                            fill="#8884d8"
                            dataKey="impressions"
                            nameKey="device"
                          >
                            {devicesData.rows?.map((_: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value, name, props) => {
                              const entry = props.payload;
                              if (name === "impressions") {
                                return [`${value} (${(entry.percent * 100).toFixed(1)}%)`, "Impressions"];
                              }
                              return [value, name];
                            }}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Device Performance</CardTitle>
                    <CardDescription>
                      {formatDateRange(dateRange)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableCaption>Performance metrics by device</TableCaption>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Device</TableHead>
                          <TableHead className="text-right">Clicks</TableHead>
                          <TableHead className="text-right">Impressions</TableHead>
                          <TableHead className="text-right">CTR</TableHead>
                          <TableHead className="text-right">Position</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {devicesData.rows?.map((device: DeviceData) => (
                          <TableRow key={device.device}>
                            <TableCell>{device.device}</TableCell>
                            <TableCell className="text-right">{device.clicks}</TableCell>
                            <TableCell className="text-right">{device.impressions}</TableCell>
                            <TableCell className="text-right">{(device.ctr * 100).toFixed(2)}%</TableCell>
                            <TableCell className="text-right">{device.position.toFixed(1)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No Data Available</AlertTitle>
                <AlertDescription>
                  There is no device data available for the selected site and date range.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
          
          {/* Countries Tab */}
          <TabsContent value="countries" className="space-y-4">
            {countriesLoading ? (
              <div className="w-full h-60 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : countriesData ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Top Countries</CardTitle>
                    <CardDescription>
                      {formatDateRange(dateRange)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart
                        data={countriesData.rows?.slice(0, 10) || []}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="country" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="clicks" name="Clicks" fill="#8884d8" />
                        <Bar dataKey="impressions" name="Impressions" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Country Performance</CardTitle>
                    <CardDescription>
                      {formatDateRange(dateRange)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableCaption>Performance metrics by country</TableCaption>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Country</TableHead>
                          <TableHead className="text-right">Clicks</TableHead>
                          <TableHead className="text-right">Impressions</TableHead>
                          <TableHead className="text-right">CTR</TableHead>
                          <TableHead className="text-right">Position</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {countriesData.rows?.slice(0, 20).map((country: CountryData) => (
                          <TableRow key={country.country}>
                            <TableCell>{country.country}</TableCell>
                            <TableCell className="text-right">{country.clicks}</TableCell>
                            <TableCell className="text-right">{country.impressions}</TableCell>
                            <TableCell className="text-right">{(country.ctr * 100).toFixed(2)}%</TableCell>
                            <TableCell className="text-right">{country.position.toFixed(1)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No Data Available</AlertTitle>
                <AlertDescription>
                  There is no country data available for the selected site and date range.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
          
          {/* Competitors Tab */}
          <TabsContent value="competitors" className="space-y-4">
            {competitorLoading ? (
              <div className="w-full h-60 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : competitorData ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Competitor Analysis</CardTitle>
                    <CardDescription>
                      Compare your site with competitors on shared keywords
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableCaption>Comparison with competing websites</TableCaption>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Competitor</TableHead>
                          <TableHead className="text-right">Keyword Overlap</TableHead>
                          <TableHead className="text-right">Avg. Position</TableHead>
                          <TableHead className="text-right">Ranked Keywords</TableHead>
                          <TableHead>Top Keywords</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {competitorData.competitors?.map((competitor: CompetitorData) => (
                          <TableRow key={competitor.competitor}>
                            <TableCell>{competitor.competitor}</TableCell>
                            <TableCell className="text-right">{competitor.keywordOverlap}</TableCell>
                            <TableCell className="text-right">{competitor.avgPosition.toFixed(1)}</TableCell>
                            <TableCell className="text-right">{competitor.rankedKeywords}</TableCell>
                            <TableCell>
                              {competitor.topKeywords?.slice(0, 3).map((kw, i) => (
                                <div key={i} className="text-xs">
                                  {kw.keyword} <span className="text-muted-foreground">({kw.position})</span>
                                </div>
                              ))}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Keyword Ranking Comparison</CardTitle>
                    <CardDescription>
                      How your site ranks against competitors for shared keywords
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {competitorData.keywordComparison ? (
                      <ResponsiveContainer width="100%" height={400}>
                        <BarChart
                          data={competitorData.keywordComparison}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="keyword" />
                          <YAxis reversed />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="yourPosition" name="Your Position" fill="#8884d8" />
                          <Bar dataKey="competitorAvgPosition" name="Competitor Avg. Position" fill="#82ca9d" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No keyword comparison data available
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No Competitor Data Available</AlertTitle>
                <AlertDescription>
                  Competitor analysis data is not available for the selected site.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
        </CardContent>
        <CardFooter className="flex justify-between text-sm text-muted-foreground">
          <div>
            Last updated: {new Date().toLocaleString()}
          </div>
          <Button variant="outline" size="sm" onClick={() => refetchSites()}>
            Refresh Data
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}