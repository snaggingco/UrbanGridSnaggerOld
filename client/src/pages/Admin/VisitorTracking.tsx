import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { format } from 'date-fns';
import AdminLayout from '@/components/layouts/AdminLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  AlertCircle,
  Calendar,
  Eye,
  Flag,
  Globe,
  Info,
  Search,
  Shield,
  Smartphone,
  User
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Type for visitor data
type Visitor = {
  id: number;
  ipAddress: string;
  visitedPage: string;
  visitTime: string;
  lastVisitTime: string;
  clickCount: number;
  userAgent?: string;
  referrer?: string;
  country?: string;
  city?: string;
  browser?: string;
  device?: string;
  operatingSystem?: string;
  sessionId?: string;
  queryParams?: Record<string, string>;
  interactionData?: Record<string, any>;
  isFlagged: boolean;
  flagReason?: string;
  conversionType?: string;
  conversionId?: number;
};

// Type for visitor stats
type VisitorStats = {
  totalVisitors: number;
  uniqueIps: number;
  suspiciousCount: number;
  visitorsByDate: Record<string, number>;
  topPages: Array<{page: string, visits: number}>;
  topReferrers: Array<{referrer: string, visits: number}>;
};

const VisitorTracking = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedIp, setSelectedIp] = useState<string | null>(null);
  const [flagDialogOpen, setFlagDialogOpen] = useState(false);
  const [flagReason, setFlagReason] = useState('');
  const [visitorToFlag, setVisitorToFlag] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPage, setFilterPage] = useState('');
  
  // Load all visitors
  const { data: visitors, isLoading: visitorsLoading } = useQuery<Visitor[]>({
    queryKey: ['/api/admin/visitors'],
    refetchInterval: 60000, // Refresh every minute
  });
  
  // Load suspicious visitors
  const { data: suspiciousVisitors, isLoading: suspiciousLoading } = useQuery<Visitor[]>({
    queryKey: ['/api/admin/visitors/suspicious'],
    refetchInterval: 60000, // Refresh every minute
  });
  
  // Load visitor statistics
  const { data: visitorStats, isLoading: statsLoading } = useQuery<VisitorStats>({
    queryKey: ['/api/admin/visitors/stats'],
    refetchInterval: 60000, // Refresh every minute
  });
  
  // Load visitors for a specific IP
  const { data: ipVisitors, isLoading: ipVisitorsLoading } = useQuery<Visitor[]>({
    queryKey: ['/api/admin/visitors/ip', selectedIp],
    enabled: !!selectedIp, // Only run this query if an IP is selected
  });
  
  // Mutation to flag a visitor as suspicious
  const flagVisitorMutation = useMutation({
    mutationFn: (data: { id: number, reason: string }) => {
      return apiRequest(`/api/admin/visitors/${data.id}/flag`, {
        method: 'PATCH',
        body: { reason: data.reason },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/visitors'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/visitors/suspicious'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/visitors/stats'] });
      if (selectedIp) {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/visitors/ip', selectedIp] });
      }
      toast({
        title: "Visitor flagged",
        description: "The visitor has been flagged as suspicious",
      });
      setFlagDialogOpen(false);
      setFlagReason('');
      setVisitorToFlag(null);
    },
    onError: (error) => {
      toast({
        title: "Error flagging visitor",
        description: "There was an error flagging the visitor",
        variant: "destructive",
      });
    },
  });
  
  // Function to handle flagging a visitor
  const handleFlagVisitor = (id: number) => {
    setVisitorToFlag(id);
    setFlagDialogOpen(true);
  };
  
  // Function to submit flag reason
  const submitFlagReason = () => {
    if (!flagReason) {
      toast({
        title: "Reason required",
        description: "Please provide a reason for flagging",
        variant: "destructive",
      });
      return;
    }
    
    if (visitorToFlag) {
      flagVisitorMutation.mutate({
        id: visitorToFlag,
        reason: flagReason,
      });
    }
  };
  
  // Function to format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm:ss');
    } catch (e) {
      return dateString;
    }
  };
  
  // Filter visitors
  const filteredVisitors = React.useMemo(() => {
    if (!visitors || !Array.isArray(visitors)) return [];
    
    return visitors.filter((visitor: Visitor) => {
      const matchesSearch = 
        visitor.ipAddress.includes(searchQuery) || 
        visitor.visitedPage.includes(searchQuery) ||
        (visitor.country && visitor.country.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (visitor.city && visitor.city.toLowerCase().includes(searchQuery.toLowerCase()));
        
      const matchesPage = !filterPage || filterPage === "all_pages" || visitor.visitedPage === filterPage;
      
      return matchesSearch && matchesPage;
    });
  }, [visitors, searchQuery, filterPage]);
  
  // Get unique pages for filter
  const uniquePages = React.useMemo(() => {
    if (!visitors || !Array.isArray(visitors)) return [];
    
    const pages = new Set<string>();
    visitors.forEach((visitor: Visitor) => {
      pages.add(visitor.visitedPage);
    });
    
    return Array.from(pages);
  }, [visitors]);
  
  // Chart data for visitors by date
  const visitorChartData = React.useMemo(() => {
    if (!visitorStats?.visitorsByDate) return [];
    
    return Object.entries(visitorStats.visitorsByDate)
      .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
      .map(([date, count]) => ({
        date: format(new Date(date), 'MMM dd'),
        count
      }));
  }, [visitorStats]);
  
  if (visitorsLoading || suspiciousLoading || statsLoading) {
    return (
      <AdminLayout title="Loading..." description="Loading visitor data...">
        <div className="flex items-center justify-center h-screen">Loading visitor data...</div>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout 
      title="Visitor Tracking" 
      description="Monitor and analyze website visitor data"
    >
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Total Visitors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{visitorStats?.totalVisitors || 0}</div>
            <p className="text-sm text-muted-foreground">From {visitorStats?.uniqueIps || 0} unique IP addresses</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Suspicious Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{visitorStats?.suspiciousCount || 0}</div>
            <p className="text-sm text-muted-foreground">Flagged visitors</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Most Popular Page</CardTitle>
          </CardHeader>
          <CardContent>
            {visitorStats?.topPages && visitorStats.topPages.length > 0 ? (
              <>
                <div className="text-xl font-bold truncate">{visitorStats.topPages[0].page}</div>
                <p className="text-sm text-muted-foreground">{visitorStats.topPages[0].visits} visits</p>
              </>
            ) : (
              <div className="text-xl">No data</div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Top Pages and Referrers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Pages</CardTitle>
            <CardDescription>Most visited pages on your site</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {visitorStats?.topPages && visitorStats.topPages.length > 0 ? (
                visitorStats.topPages.slice(0, 5).map((page, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div className="truncate max-w-[70%]">{page.page}</div>
                    <Badge variant="outline">{page.visits} visits</Badge>
                  </div>
                ))
              ) : (
                <div>No page data available</div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Top Referrers</CardTitle>
            <CardDescription>Sources directing traffic to your site</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {visitorStats?.topReferrers && visitorStats.topReferrers.length > 0 ? (
                visitorStats.topReferrers.slice(0, 5).map((referrer, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div className="truncate max-w-[70%]">{referrer.referrer || '(Direct)'}</div>
                    <Badge variant="outline">{referrer.visits} visits</Badge>
                  </div>
                ))
              ) : (
                <div>No referrer data available</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Visitor data tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="all">All Visitors</TabsTrigger>
          <TabsTrigger value="suspicious">Suspicious Activity</TabsTrigger>
          <TabsTrigger value="ip">IP Lookup</TabsTrigger>
        </TabsList>
        
        {/* All visitors tab */}
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Visitors</CardTitle>
              <CardDescription>Complete visitor log for your website</CardDescription>
              
              <div className="flex flex-col md:flex-row gap-4 mt-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by IP, page, or location"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
                
                <Select value={filterPage || "all_pages"} onValueChange={setFilterPage}>
                  <SelectTrigger className="w-full md:w-[250px]">
                    <SelectValue placeholder="Filter by page" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_pages">All pages</SelectItem>
                    {uniquePages.map((page, index) => (
                      <SelectItem key={index} value={page}>
                        {page}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-auto max-h-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Page</TableHead>
                      <TableHead>Visit Time</TableHead>
                      <TableHead>Clicks</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVisitors.length > 0 ? (
                      filteredVisitors.map((visitor: Visitor) => (
                        <TableRow key={visitor.id}>
                          <TableCell className="font-mono">
                            {visitor.ipAddress}
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {visitor.visitedPage}
                          </TableCell>
                          <TableCell>
                            {formatDate(visitor.visitTime)}
                          </TableCell>
                          <TableCell>{visitor.clickCount}</TableCell>
                          <TableCell>
                            {visitor.country || visitor.city
                              ? `${visitor.country || ''} ${visitor.city || ''}`
                              : 'Unknown'}
                          </TableCell>
                          <TableCell>
                            {visitor.isFlagged ? (
                              <Badge variant="destructive" className="flex gap-1 items-center">
                                <Flag className="h-3 w-3" />
                                Flagged
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="flex gap-1 items-center">
                                <Shield className="h-3 w-3" />
                                Normal
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="icon">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Visitor Details</DialogTitle>
                                    <DialogDescription>
                                      Complete information about this visitor
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-2 gap-2">
                                      <div>
                                        <Label>IP Address</Label>
                                        <div className="font-mono">{visitor.ipAddress}</div>
                                      </div>
                                      <div>
                                        <Label>First Visit</Label>
                                        <div>{formatDate(visitor.visitTime)}</div>
                                      </div>
                                      <div>
                                        <Label>Last Visit</Label>
                                        <div>{formatDate(visitor.lastVisitTime)}</div>
                                      </div>
                                      <div>
                                        <Label>Click Count</Label>
                                        <div>{visitor.clickCount}</div>
                                      </div>
                                      <div>
                                        <Label>Page</Label>
                                        <div className="break-words">{visitor.visitedPage}</div>
                                      </div>
                                      <div>
                                        <Label>Referrer</Label>
                                        <div className="break-words">{visitor.referrer || 'Direct'}</div>
                                      </div>
                                      <div>
                                        <Label>Location</Label>
                                        <div>{visitor.country || 'Unknown'} {visitor.city || ''}</div>
                                      </div>
                                      <div>
                                        <Label>Browser</Label>
                                        <div>{visitor.browser || 'Unknown'}</div>
                                      </div>
                                      <div>
                                        <Label>Device</Label>
                                        <div>{visitor.device || 'Unknown'}</div>
                                      </div>
                                      <div>
                                        <Label>OS</Label>
                                        <div>{visitor.operatingSystem || 'Unknown'}</div>
                                      </div>
                                    </div>
                                    
                                    {visitor.isFlagged && (
                                      <div>
                                        <Label>Flag Reason</Label>
                                        <div className="p-2 rounded bg-red-50 border border-red-200 text-sm">
                                          {visitor.flagReason}
                                        </div>
                                      </div>
                                    )}
                                    
                                    {visitor.userAgent && (
                                      <div>
                                        <Label>User Agent</Label>
                                        <div className="p-2 rounded bg-gray-50 border text-xs font-mono break-words">
                                          {visitor.userAgent}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </DialogContent>
                              </Dialog>
                              
                              {!visitor.isFlagged && (
                                <Button 
                                  variant="destructive" 
                                  size="icon"
                                  onClick={() => handleFlagVisitor(visitor.id)}
                                >
                                  <Flag className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          No visitors found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Suspicious activity tab */}
        <TabsContent value="suspicious">
          <Card>
            <CardHeader>
              <CardTitle>Suspicious Activity</CardTitle>
              <CardDescription>Visitors flagged for suspicious behavior</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-auto max-h-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Page</TableHead>
                      <TableHead>Visit Time</TableHead>
                      <TableHead>Clicks</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Flag Reason</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {suspiciousVisitors && Array.isArray(suspiciousVisitors) && suspiciousVisitors.length > 0 ? (
                      suspiciousVisitors.map((visitor: Visitor) => (
                        <TableRow key={visitor.id}>
                          <TableCell className="font-mono">
                            {visitor.ipAddress}
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {visitor.visitedPage}
                          </TableCell>
                          <TableCell>
                            {formatDate(visitor.visitTime)}
                          </TableCell>
                          <TableCell>{visitor.clickCount}</TableCell>
                          <TableCell>
                            {visitor.country || visitor.city
                              ? `${visitor.country || ''} ${visitor.city || ''}`
                              : 'Unknown'}
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {visitor.flagReason}
                          </TableCell>
                          <TableCell>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="icon">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Suspicious Visitor Details</DialogTitle>
                                  <DialogDescription>
                                    Complete information about this flagged visitor
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <Label>IP Address</Label>
                                      <div className="font-mono">{visitor.ipAddress}</div>
                                    </div>
                                    <div>
                                      <Label>First Visit</Label>
                                      <div>{formatDate(visitor.visitTime)}</div>
                                    </div>
                                    <div>
                                      <Label>Last Visit</Label>
                                      <div>{formatDate(visitor.lastVisitTime)}</div>
                                    </div>
                                    <div>
                                      <Label>Click Count</Label>
                                      <div>{visitor.clickCount}</div>
                                    </div>
                                    <div>
                                      <Label>Page</Label>
                                      <div className="break-words">{visitor.visitedPage}</div>
                                    </div>
                                    <div>
                                      <Label>Referrer</Label>
                                      <div className="break-words">{visitor.referrer || 'Direct'}</div>
                                    </div>
                                    <div>
                                      <Label>Location</Label>
                                      <div>{visitor.country || 'Unknown'} {visitor.city || ''}</div>
                                    </div>
                                    <div>
                                      <Label>Browser</Label>
                                      <div>{visitor.browser || 'Unknown'}</div>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <Label>Flag Reason</Label>
                                    <div className="p-2 rounded bg-red-50 border border-red-200 text-sm">
                                      {visitor.flagReason}
                                    </div>
                                  </div>
                                  
                                  {visitor.userAgent && (
                                    <div>
                                      <Label>User Agent</Label>
                                      <div className="p-2 rounded bg-gray-50 border text-xs font-mono break-words">
                                        {visitor.userAgent}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          No suspicious visitors found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* IP lookup tab */}
        <TabsContent value="ip">
          <Card>
            <CardHeader>
              <CardTitle>IP Address Lookup</CardTitle>
              <CardDescription>Research activity from a specific IP address</CardDescription>
              
              <div className="flex gap-4 mt-4">
                <Input
                  placeholder="Enter IP address to look up"
                  value={selectedIp || ''}
                  onChange={(e) => setSelectedIp(e.target.value)}
                />
                <Button
                  onClick={() => {
                    if (selectedIp) {
                      queryClient.invalidateQueries({ queryKey: ['/api/admin/visitors/ip', selectedIp] });
                    }
                  }}
                >
                  Look Up
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {ipVisitorsLoading ? (
                <div className="flex justify-center p-8">Loading IP data...</div>
              ) : ipVisitors && Array.isArray(ipVisitors) && ipVisitors.length > 0 ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      Activity history for {ipVisitors[0].ipAddress}
                    </h3>
                    <div className="text-sm text-muted-foreground mb-4 flex items-center gap-2">
                      <Globe className="h-4 w-4" /> 
                      <span>
                        Location: {ipVisitors[0].country || 'Unknown'} {ipVisitors[0].city || ''}
                      </span>
                    </div>
                  </div>
                  
                  <div className="rounded-md border overflow-auto max-h-[400px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Page Visited</TableHead>
                          <TableHead>Visit Time</TableHead>
                          <TableHead>Clicks</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {ipVisitors.map((visitor: Visitor) => (
                          <TableRow key={visitor.id}>
                            <TableCell className="max-w-[300px] truncate">
                              {visitor.visitedPage}
                            </TableCell>
                            <TableCell>
                              {formatDate(visitor.visitTime)}
                            </TableCell>
                            <TableCell>{visitor.clickCount}</TableCell>
                            <TableCell>
                              {visitor.isFlagged ? (
                                <Badge variant="destructive" className="flex gap-1 items-center">
                                  <Flag className="h-3 w-3" />
                                  Flagged
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="flex gap-1 items-center">
                                  <Shield className="h-3 w-3" />
                                  Normal
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="outline" size="icon">
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Visit Details</DialogTitle>
                                      <DialogDescription>
                                        Details about this specific visit
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                      <div>
                                        <Label>Page Visited</Label>
                                        <div className="break-words">{visitor.visitedPage}</div>
                                      </div>
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <Label>First Visit</Label>
                                          <div>{formatDate(visitor.visitTime)}</div>
                                        </div>
                                        <div>
                                          <Label>Last Visit</Label>
                                          <div>{formatDate(visitor.lastVisitTime)}</div>
                                        </div>
                                      </div>
                                      {visitor.referrer && (
                                        <div>
                                          <Label>Referrer</Label>
                                          <div className="break-words">{visitor.referrer}</div>
                                        </div>
                                      )}
                                      <div className="grid grid-cols-3 gap-2">
                                        <div>
                                          <Label>Browser</Label>
                                          <div>{visitor.browser || 'Unknown'}</div>
                                        </div>
                                        <div>
                                          <Label>Device</Label>
                                          <div>{visitor.device || 'Unknown'}</div>
                                        </div>
                                        <div>
                                          <Label>OS</Label>
                                          <div>{visitor.operatingSystem || 'Unknown'}</div>
                                        </div>
                                      </div>
                                      {visitor.userAgent && (
                                        <div>
                                          <Label>User Agent</Label>
                                          <div className="p-2 rounded bg-gray-50 border text-xs font-mono break-words">
                                            {visitor.userAgent}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </DialogContent>
                                </Dialog>
                                
                                {!visitor.isFlagged && (
                                  <Button 
                                    variant="destructive" 
                                    size="icon"
                                    onClick={() => handleFlagVisitor(visitor.id)}
                                  >
                                    <Flag className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ) : selectedIp ? (
                <div className="flex flex-col items-center justify-center p-12 border rounded-md">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold">No data found</h3>
                  <p className="text-muted-foreground text-center mt-2">
                    No visitor records found for IP address {selectedIp}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-12 border rounded-md">
                  <Info className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold">IP Lookup Tool</h3>
                  <p className="text-muted-foreground text-center mt-2">
                    Enter an IP address above to view all visits from that address
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Flag visitor dialog */}
      <AlertDialog open={flagDialogOpen} onOpenChange={setFlagDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Flag Visitor as Suspicious</AlertDialogTitle>
            <AlertDialogDescription>
              Flag this visitor as suspicious for potential fraudulent activity. 
              Please provide a reason for flagging.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="flagReason" className="mb-2">Flag Reason</Label>
            <Textarea 
              id="flagReason"
              value={flagReason}
              onChange={(e) => setFlagReason(e.target.value)}
              placeholder="e.g., Multiple invalid form submissions, Suspicious clickthrough pattern"
              className="mt-2"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setFlagDialogOpen(false);
              setFlagReason('');
              setVisitorToFlag(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={submitFlagReason}>
              Flag Visitor
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default VisitorTracking;