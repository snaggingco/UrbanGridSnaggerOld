import React from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';

export default function AdminSettings() {
  const { toast } = useToast();
  
  const generalForm = useForm({
    defaultValues: {
      companyName: 'Snagging By UrbanGrid',
      email: 'info@snagging.me',
      phone: '+971 50 123 4567',
      address: 'Naema Ali Buamim Building - 306 - Al Bada\'a - Dubai',
      defaultCurrency: 'AED',
      adminNotifications: true,
      clientNotifications: true
    }
  });

  const serviceForm = useForm({
    defaultValues: {
      // Inspection services
      inspectionDescription: 'Professional property inspection services in Dubai',
      
      // Inspection pricing tiers (per sq.ft)
      inspectionPriceTier1Min: 0,
      inspectionPriceTier1Max: 1000,
      inspectionPriceTier1Price: 3.5,
      
      inspectionPriceTier2Min: 1001,
      inspectionPriceTier2Max: 2000,
      inspectionPriceTier2Price: 3.0,
      
      inspectionPriceTier3Min: 2001,
      inspectionPriceTier3Max: 3500,
      inspectionPriceTier3Price: 2.5,
      
      inspectionPriceTier4Min: 3501,
      inspectionPriceTier4Max: 5000,
      inspectionPriceTier4Price: 2.0,
      
      inspectionPriceTier5Min: 5001,
      inspectionPriceTier5Max: 10000,
      inspectionPriceTier5Price: 1.5,
      
      // RERA Audits
      reraAuditsDescription: 'Condition Survey and Advanced Reserve Fund Analysis services for properties',
      conditionSurveyBasePrice: 4000,
      reserveFundAnalysisBasePrice: 5500,
      
      // Move-In services
      moveInDescription: 'Comprehensive move-in services for your new property',
      
      // Move-In pricing by property types
      deepCleaningStudioPrice: 350,
      deepCleaning1BRPrice: 500,
      deepCleaning2BRPrice: 700,
      deepCleaning3BRPrice: 900,
      deepCleaning4BRPrice: 1200,
      deepCleaning5BRPrice: 1500,
      deepCleaningVillaPrice: 2000,
      
      pestControlStudioPrice: 200,
      pestControl1BRPrice: 300,
      pestControl2BRPrice: 400,
      pestControl3BRPrice: 500,
      pestControl4BRPrice: 600,
      pestControl5BRPrice: 700,
      pestControlVillaPrice: 1000,
      
      fitoutBasePrice: 1200,
      maintenanceBasePrice: 350,
      acCleaningBasePrice: 250,
      moversBasePrice: 800
    }
  });

  const websiteForm = useForm({
    defaultValues: {
      seoTitle: 'Dubai Property Inspection & Snagging Services | UrbanGrid',
      seoDescription: 'Professional property inspection and snagging services in Dubai. Expert inspectors ensure your property is defect-free. Book now!',
      googleAnalyticsId: 'UA-XXXXXXXX-X',
      primaryDomain: 'urbangrid.ae',
      secondaryDomain: 'snagging.me',
      socialFacebook: 'https://facebook.com/urbangridme',
      socialInstagram: 'https://instagram.com/urbangridme',
      socialLinkedin: 'https://linkedin.com/company/urbangrid'
    }
  });

  const handleSaveGeneral = (data: any) => {
    console.log('Saving general settings:', data);
    toast({
      title: 'Settings Saved',
      description: 'General settings have been updated successfully.',
    });
  };

  const handleSaveServices = (data: any) => {
    console.log('Saving service settings:', data);
    toast({
      title: 'Settings Saved',
      description: 'Service settings have been updated successfully.',
    });
  };

  const handleSaveWebsite = (data: any) => {
    console.log('Saving website settings:', data);
    toast({
      title: 'Settings Saved',
      description: 'Website settings have been updated successfully.',
    });
  };

  return (
    <AdminLayout title="Settings" description="Configure system and application settings">
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="website">Website</TabsTrigger>
        </TabsList>
        
        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Manage your company information and notification preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...generalForm}>
                <form onSubmit={generalForm.handleSubmit(handleSaveGeneral)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={generalForm.control}
                      name="companyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={generalForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={generalForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={generalForm.control}
                      name="defaultCurrency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Default Currency</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select currency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="AED">AED (United Arab Emirates Dirham)</SelectItem>
                              <SelectItem value="USD">USD (US Dollar)</SelectItem>
                              <SelectItem value="EUR">EUR (Euro)</SelectItem>
                              <SelectItem value="GBP">GBP (British Pound)</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={generalForm.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Address</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Notifications</h3>
                    
                    <FormField
                      control={generalForm.control}
                      name="adminNotifications"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Admin Notifications</FormLabel>
                            <FormDescription>
                              Receive email notifications for new bookings and inquiries
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={generalForm.control}
                      name="clientNotifications"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Client Notifications</FormLabel>
                            <FormDescription>
                              Send automated emails to clients about their bookings
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Button type="submit">Save Changes</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Services Settings */}
        <TabsContent value="services">
          <Card>
            <CardHeader>
              <CardTitle>Service Settings</CardTitle>
              <CardDescription>Configure service offerings and pricing</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...serviceForm}>
                <form onSubmit={serviceForm.handleSubmit(handleSaveServices)} className="space-y-6">
                  {/* Inspection Services & Pricing */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">Inspection Services</h3>
                      <Button variant="outline" size="sm" type="button">
                        Calculate Sample Price
                      </Button>
                    </div>
                    
                    <FormField
                      control={serviceForm.control}
                      name="inspectionDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Service Description</FormLabel>
                          <FormControl>
                            <Textarea {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <div className="bg-gray-50 p-4 rounded-md border">
                      <h4 className="font-medium mb-4">Pricing Tiers by Square Footage</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Set price per square foot for different property size ranges
                      </p>
                      
                      <div className="space-y-4">
                        {/* Tier 1 */}
                        <div className="grid grid-cols-3 gap-4 items-end">
                          <FormField
                            control={serviceForm.control}
                            name="inspectionPriceTier1Min"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Min Sq.Ft</FormLabel>
                                <FormControl>
                                  <Input type="number" {...field} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={serviceForm.control}
                            name="inspectionPriceTier1Max"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Max Sq.Ft</FormLabel>
                                <FormControl>
                                  <Input type="number" {...field} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={serviceForm.control}
                            name="inspectionPriceTier1Price"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Price (AED per sq.ft)</FormLabel>
                                <FormControl>
                                  <Input type="number" step="0.1" {...field} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        {/* Tier 2 */}
                        <div className="grid grid-cols-3 gap-4 items-end">
                          <FormField
                            control={serviceForm.control}
                            name="inspectionPriceTier2Min"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Min Sq.Ft</FormLabel>
                                <FormControl>
                                  <Input type="number" {...field} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={serviceForm.control}
                            name="inspectionPriceTier2Max"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Max Sq.Ft</FormLabel>
                                <FormControl>
                                  <Input type="number" {...field} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={serviceForm.control}
                            name="inspectionPriceTier2Price"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Price (AED per sq.ft)</FormLabel>
                                <FormControl>
                                  <Input type="number" step="0.1" {...field} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        {/* Additional tiers follow the same pattern */}
                        {/* RERA Audits */}
                        {/* Move-In Services */}
                      </div>
                    </div>
                  </div>
                  
                  <Button type="submit">Save Changes</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Website Settings */}
        <TabsContent value="website">
          <Card>
            <CardHeader>
              <CardTitle>Website Settings</CardTitle>
              <CardDescription>Configure website SEO and social media information</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...websiteForm}>
                <form onSubmit={websiteForm.handleSubmit(handleSaveWebsite)} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">SEO Settings</h3>
                    
                    <FormField
                      control={websiteForm.control}
                      name="seoTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Page Title</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>
                            The title that appears in search engine results (50-60 characters ideal)
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={websiteForm.control}
                      name="seoDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Meta Description</FormLabel>
                          <FormControl>
                            <Textarea {...field} />
                          </FormControl>
                          <FormDescription>
                            The description that appears in search engine results (150-160 characters ideal)
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={websiteForm.control}
                      name="googleAnalyticsId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Google Analytics ID</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Domain Settings</h3>
                    
                    <FormField
                      control={websiteForm.control}
                      name="primaryDomain"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Primary Domain</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>
                            Main domain used for SEO and marketing
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={websiteForm.control}
                      name="secondaryDomain"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Secondary Domain</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>
                            Will redirect to primary domain
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Social Media</h3>
                    
                    <FormField
                      control={websiteForm.control}
                      name="socialFacebook"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Facebook URL</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={websiteForm.control}
                      name="socialInstagram"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Instagram URL</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={websiteForm.control}
                      name="socialLinkedin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>LinkedIn URL</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Button type="submit">Save Changes</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}