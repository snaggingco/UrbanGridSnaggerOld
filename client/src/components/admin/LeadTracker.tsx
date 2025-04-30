import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Booking, Inquiry, InsertBooking } from '@shared/schema';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, ApiError } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';

// TypeScript type for service types
type ServiceType = 'handover' | 'warranty' | 'resale' | 'construction';
type PropertyType = 'apartment' | 'villa' | 'townhouse' | 'commercial';

// Lead status options for the status dropdown
type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal_sent' | 'negotiating' | 'won' | 'lost' | 'on_hold';

const leadStatusOptions: { value: LeadStatus; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'proposal_sent', label: 'Proposal Sent' },
  { value: 'negotiating', label: 'Negotiating' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' },
  { value: 'on_hold', label: 'On Hold' }
];

interface LeadTrackerProps {
  inquiries: Inquiry[];
  bookings: Booking[];
}

const LeadTracker: React.FC<LeadTrackerProps> = ({ inquiries, bookings }) => {
  const { toast } = useToast();
  const [editInquiry, setEditInquiry] = useState<Inquiry | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [editedValues, setEditedValues] = useState<Partial<Inquiry>>({});
  const [bookingValues, setBookingValues] = useState<Partial<InsertBooking>>({});
  
  // Mutation to update an inquiry
  const updateInquiryMutation = useMutation({
    mutationFn: async (updatedInquiry: { id: number; data: Partial<Inquiry> }) => {
      return apiRequest(`/api/inquiries/${updatedInquiry.id}`, {
        method: 'PATCH',
        body: updatedInquiry.data
      });
    },
    onSuccess: () => {
      toast({ title: 'Inquiry updated successfully' });
      queryClient.invalidateQueries({ queryKey: ['/api/inquiries'] });
      setIsEditing(false);
      setEditInquiry(null);
    },
    onError: (error: ApiError) => {
      toast({ 
        title: 'Failed to update inquiry', 
        description: error.message,
        variant: 'destructive'
      });
    }
  });
  
  // Mutation to convert an inquiry to a booking
  const convertToBookingMutation = useMutation({
    mutationFn: async ({ inquiryId, bookingData }: { inquiryId: number; bookingData: Partial<InsertBooking> }) => {
      return apiRequest(`/api/inquiries/${inquiryId}/convert`, {
        method: 'POST',
        body: bookingData
      });
    },
    onSuccess: () => {
      toast({ title: 'Inquiry converted to booking successfully' });
      queryClient.invalidateQueries({ queryKey: ['/api/inquiries'] });
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      setIsConverting(false);
      setEditInquiry(null);
    },
    onError: (error: ApiError) => {
      toast({ 
        title: 'Failed to convert inquiry', 
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const handleEditInquiry = (inquiry: Inquiry) => {
    setEditInquiry(inquiry);
    setEditedValues({
      name: inquiry.name,
      email: inquiry.email,
      phone: inquiry.phone,
      leadStatus: inquiry.leadStatus,
      leadSource: inquiry.leadSource,
      adminNotes: inquiry.adminNotes
    });
    setIsEditing(true);
  };

  const handleConvertInquiry = (inquiry: Inquiry) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    setEditInquiry(inquiry);
    setBookingValues({
      name: inquiry.name,
      email: inquiry.email,
      phone: inquiry.phone,
      propertyType: 'apartment' as PropertyType, // Set default property type
      propertyAddress: '',
      serviceDate: tomorrow, // Set to tomorrow's date
      serviceTypes: [] as ServiceType[], // Explicitly type as array of service types
      leadSource: inquiry.leadSource || undefined, // Convert null to undefined
      adminNotes: inquiry.adminNotes || undefined, // Convert null to undefined
      status: 'not_started', // Changed from 'pending' to 'not_started' to match schema
      paymentStatus: 'pending',
      totalAmount: 0,
      amountPaid: 0,
      inquiryId: inquiry.id
    });
    setIsConverting(true);
  };

  const handleUpdateInquiry = () => {
    if (editInquiry) {
      updateInquiryMutation.mutate({ id: editInquiry.id, data: editedValues });
    }
  };

  const handleConvertToBooking = () => {
    if (editInquiry) {
      convertToBookingMutation.mutate({ 
        inquiryId: editInquiry.id, 
        bookingData: bookingValues
      });
    }
  };

  // Helper function to determine if an inquiry has been converted to a booking
  const isInquiryConverted = (inquiryId: number): boolean => {
    return bookings.some(booking => booking.inquiryId === inquiryId);
  };

  // Helper to render status badges with appropriate colors
  const renderStatusBadge = (status: string) => {
    let variant = 'default';
    
    switch (status) {
      case 'new':
        variant = 'default';
        break;
      case 'contacted':
        variant = 'secondary';
        break;
      case 'qualified':
        variant = 'outline';
        break;
      case 'proposal_sent':
        variant = 'primary';
        break;
      case 'negotiating':
        variant = 'secondary';
        break;
      case 'won':
        variant = 'success';
        break;
      case 'lost':
        variant = 'destructive';
        break;
      case 'on_hold':
        variant = 'outline';
        break;
      default:
        variant = 'default';
    }
    
    // @ts-ignore - The variant prop types don't match exactly with our custom variants
    return <Badge variant={variant}>{status.replace('_', ' ')}</Badge>;
  };

  return (
    <div>
      <Table>
        <TableCaption>List of inquiries from the website</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {inquiries.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8">No inquiries found</TableCell>
            </TableRow>
          ) : (
            inquiries.map((inquiry) => (
              <TableRow key={inquiry.id}>
                <TableCell>{format(new Date(inquiry.createdAt), 'MMM dd, yyyy')}</TableCell>
                <TableCell className="font-medium">{inquiry.name}</TableCell>
                <TableCell>
                  <div>{inquiry.email}</div>
                  <div className="text-sm text-muted-foreground">{inquiry.phone}</div>
                </TableCell>
                <TableCell>{renderStatusBadge(inquiry.leadStatus || 'new')}</TableCell>
                <TableCell>{inquiry.leadSource || 'Website'}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleEditInquiry(inquiry)}>
                      Edit
                    </Button>
                    {!isInquiryConverted(inquiry.id) && (
                      <Button variant="secondary" size="sm" onClick={() => handleConvertInquiry(inquiry)}>
                        Convert
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Edit Inquiry Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Inquiry</DialogTitle>
            <DialogDescription>
              Update the inquiry details and status.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={editedValues.name || ''}
                  onChange={(e) => setEditedValues({ ...editedValues, name: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={editedValues.email || ''}
                  onChange={(e) => setEditedValues({ ...editedValues, email: e.target.value })}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={editedValues.phone || ''}
                  onChange={(e) => setEditedValues({ ...editedValues, phone: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="leadSource">Lead Source</Label>
                <Input
                  id="leadSource"
                  value={editedValues.leadSource || ''}
                  onChange={(e) => setEditedValues({ ...editedValues, leadSource: e.target.value })}
                  placeholder="Website, Referral, Google, etc."
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Lead Status</Label>
              <Select
                value={editedValues.leadStatus || 'new'}
                onValueChange={(value) => setEditedValues({ ...editedValues, leadStatus: value as LeadStatus })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {leadStatusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="adminNotes">Notes</Label>
              <Textarea
                id="adminNotes"
                value={editedValues.adminNotes || ''}
                onChange={(e) => setEditedValues({ ...editedValues, adminNotes: e.target.value })}
                placeholder="Add notes about this lead"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
            <Button onClick={handleUpdateInquiry} disabled={updateInquiryMutation.isPending}>
              {updateInquiryMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Convert to Booking Dialog */}
      <Dialog open={isConverting} onOpenChange={setIsConverting}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Convert to Booking</DialogTitle>
            <DialogDescription>
              Create a new booking from this inquiry.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bookingName">Name</Label>
                <Input
                  id="bookingName"
                  value={bookingValues.name || ''}
                  onChange={(e) => setBookingValues({ ...bookingValues, name: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bookingEmail">Email</Label>
                <Input
                  id="bookingEmail"
                  type="email"
                  value={bookingValues.email || ''}
                  onChange={(e) => setBookingValues({ ...bookingValues, email: e.target.value })}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bookingPhone">Phone</Label>
                <Input
                  id="bookingPhone"
                  value={bookingValues.phone || ''}
                  onChange={(e) => setBookingValues({ ...bookingValues, phone: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="propertyType">Property Type</Label>
                <Select
                  value={bookingValues.propertyType || 'apartment'}
                  onValueChange={(value: PropertyType) => setBookingValues({ ...bookingValues, propertyType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select property type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apartment">Apartment</SelectItem>
                    <SelectItem value="villa">Villa</SelectItem>
                    <SelectItem value="townhouse">Townhouse</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="propertyAddress">Property Address</Label>
              <Textarea
                id="propertyAddress"
                value={bookingValues.propertyAddress || ''}
                onChange={(e) => setBookingValues({ ...bookingValues, propertyAddress: e.target.value })}
                placeholder="Enter the property address"
                rows={2}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="serviceDate">Service Date</Label>
                <Input
                  id="serviceDate"
                  type="date"
                  value={bookingValues.serviceDate instanceof Date 
                    ? bookingValues.serviceDate.toISOString().split('T')[0] 
                    : ''}
                  onChange={(e) => {
                    // Convert the string date to a Date object
                    const date = e.target.value ? new Date(e.target.value) : new Date();
                    setBookingValues({ ...bookingValues, serviceDate: date });
                  }}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="totalAmount">Total Amount (AED)</Label>
                <Input
                  id="totalAmount"
                  type="number"
                  value={bookingValues.totalAmount || ''}
                  onChange={(e) => setBookingValues({ ...bookingValues, totalAmount: parseFloat(e.target.value) })}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="serviceTypes">Service Types</Label>
              <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="handover"
                    checked={bookingValues.serviceTypes?.includes('handover') || false}
                    onChange={(e) => {
                      const currentTypes = bookingValues.serviceTypes || [];
                      if (e.target.checked) {
                        setBookingValues({ 
                          ...bookingValues, 
                          serviceTypes: [...currentTypes, 'handover'] 
                        });
                      } else {
                        setBookingValues({ 
                          ...bookingValues, 
                          serviceTypes: currentTypes.filter(type => type !== 'handover')
                        });
                      }
                    }}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="handover" className="text-sm font-normal">Handover Inspection</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="warranty"
                    checked={bookingValues.serviceTypes?.includes('warranty') || false}
                    onChange={(e) => {
                      const currentTypes = bookingValues.serviceTypes || [];
                      if (e.target.checked) {
                        setBookingValues({ 
                          ...bookingValues, 
                          serviceTypes: [...currentTypes, 'warranty'] 
                        });
                      } else {
                        setBookingValues({ 
                          ...bookingValues, 
                          serviceTypes: currentTypes.filter(type => type !== 'warranty')
                        });
                      }
                    }}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="warranty" className="text-sm font-normal">Warranty Inspection</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="resale"
                    checked={bookingValues.serviceTypes?.includes('resale') || false}
                    onChange={(e) => {
                      const currentTypes = bookingValues.serviceTypes || [];
                      if (e.target.checked) {
                        setBookingValues({ 
                          ...bookingValues, 
                          serviceTypes: [...currentTypes, 'resale'] 
                        });
                      } else {
                        setBookingValues({ 
                          ...bookingValues, 
                          serviceTypes: currentTypes.filter(type => type !== 'resale')
                        });
                      }
                    }}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="resale" className="text-sm font-normal">Resale Inspection</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="construction"
                    checked={bookingValues.serviceTypes?.includes('construction') || false}
                    onChange={(e) => {
                      const currentTypes = bookingValues.serviceTypes || [];
                      if (e.target.checked) {
                        setBookingValues({ 
                          ...bookingValues, 
                          serviceTypes: [...currentTypes, 'construction'] 
                        });
                      } else {
                        setBookingValues({ 
                          ...bookingValues, 
                          serviceTypes: currentTypes.filter(type => type !== 'construction')
                        });
                      }
                    }}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="construction" className="text-sm font-normal">Construction Inspection</Label>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="adminNotes">Notes</Label>
              <Textarea
                id="adminNotes"
                value={bookingValues.adminNotes || ''}
                onChange={(e) => setBookingValues({ ...bookingValues, adminNotes: e.target.value })}
                placeholder="Add notes about this booking"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConverting(false)}>Cancel</Button>
            <Button onClick={handleConvertToBooking} disabled={convertToBookingMutation.isPending}>
              {convertToBookingMutation.isPending ? 'Converting...' : 'Create Booking'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LeadTracker;