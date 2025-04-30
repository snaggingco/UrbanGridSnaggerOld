import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Inquiry, Booking } from '@shared/schema';
import { Helmet } from 'react-helmet';
import { useToast } from '@/hooks/use-toast';
import { RefreshCw } from 'lucide-react';

import LeadTracker from '@/components/admin/LeadTracker';
import BusinessCycleTracker from '@/components/admin/BusinessCycleTracker';
import AdminLayout from '@/components/layouts/AdminLayout';

const LeadManagement: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>('inquiries');

  // Fetch inquiries
  const { 
    data: inquiries = [], 
    isLoading: isLoadingInquiries,
    isError: isInquiriesError,
    refetch: refetchInquiries
  } = useQuery<Inquiry[]>({
    queryKey: ['/api/inquiries'],
    retry: 1,
  });

  // Fetch bookings
  const { 
    data: bookings = [], 
    isLoading: isLoadingBookings,
    isError: isBookingsError,
    refetch: refetchBookings
  } = useQuery<Booking[]>({
    queryKey: ['/api/bookings'],
    retry: 1,
  });

  // Handle errors
  useEffect(() => {
    if (isInquiriesError) {
      toast({
        title: 'Error fetching inquiries',
        description: 'There was a problem loading the inquiries data.',
        variant: 'destructive'
      });
    }
    
    if (isBookingsError) {
      toast({
        title: 'Error fetching bookings',
        description: 'There was a problem loading the bookings data.',
        variant: 'destructive'
      });
    }
  }, [isInquiriesError, isBookingsError, toast]);

  const handleRefresh = () => {
    refetchInquiries();
    refetchBookings();
    toast({
      title: 'Data refreshed',
      description: 'The latest data has been loaded.',
    });
  };

  return (
    <AdminLayout 
      title="Lead Management" 
      description="Track and manage leads throughout the business cycle"
    >
      <Helmet>
        <title>Lead Management - Snagging By UrbanGrid</title>
      </Helmet>

      <div className="flex justify-end mb-6">
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
          <TabsTrigger value="inquiries">Lead Tracking</TabsTrigger>
          <TabsTrigger value="bookings">Business Cycle</TabsTrigger>
        </TabsList>
        
        <TabsContent value="inquiries">
          <Card>
            <CardHeader>
              <CardTitle>Lead Tracking</CardTitle>
              <CardDescription>
                Manage website inquiries and track their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingInquiries ? (
                <div className="flex justify-center items-center h-64">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <LeadTracker inquiries={inquiries} bookings={bookings} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="bookings">
          <Card>
            <CardHeader>
              <CardTitle>Business Cycle Management</CardTitle>
              <CardDescription>
                Track the complete business cycle from booking to payment and reporting
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingBookings ? (
                <div className="flex justify-center items-center h-64">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <BusinessCycleTracker bookings={bookings} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default LeadManagement;