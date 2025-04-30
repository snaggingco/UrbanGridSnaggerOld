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
  DialogTitle 
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
import { Progress } from '@/components/ui/progress';
import { Booking } from '@shared/schema';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, ApiError } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';

// Type definitions for status options
type PaymentStatus = 'pending' | 'partial' | 'paid' | 'overdue' | 'refunded';
type InspectionStatus = 'not_started' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
type ReportStatus = 'not_started' | 'in_progress' | 'sent' | 'approved';

interface BusinessCycleTrackerProps {
  bookings: Booking[];
}

const BusinessCycleTracker: React.FC<BusinessCycleTrackerProps> = ({ bookings }) => {
  const { toast } = useToast();
  const [editBooking, setEditBooking] = useState<Booking | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedValues, setEditedValues] = useState<Partial<Booking>>({});
  
  // Mutation to update a booking
  const updateBookingMutation = useMutation({
    mutationFn: async (updatedBooking: { id: number; data: Partial<Booking> }) => {
      return apiRequest(`/api/bookings/${updatedBooking.id}`, {
        method: 'PATCH',
        body: updatedBooking.data
      });
    },
    onSuccess: () => {
      toast({ title: 'Booking updated successfully' });
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      setIsEditing(false);
      setEditBooking(null);
    },
    onError: (error: ApiError) => {
      toast({ 
        title: 'Failed to update booking', 
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const handleEditBooking = (booking: Booking) => {
    setEditBooking(booking);
    setEditedValues({
      name: booking.name,
      email: booking.email,
      phone: booking.phone,
      propertyType: booking.propertyType,
      propertyAddress: booking.propertyAddress,
      serviceDate: booking.serviceDate,
      totalAmount: booking.totalAmount,
      amountPaid: booking.amountPaid,
      paymentStatus: booking.paymentStatus,
      status: booking.status,
      adminNotes: booking.adminNotes
    });
    setIsEditing(true);
  };

  const handleUpdateBooking = () => {
    if (editBooking) {
      updateBookingMutation.mutate({ id: editBooking.id, data: editedValues });
    }
  };

  // Helper function to calculate payment progress percentage
  const getPaymentProgress = (booking: Booking) => {
    // Calculate percentage of payment complete
    if (!booking.totalAmount || booking.totalAmount === 0) {
      return 0;
    }
    
    // If amountPaid is null, treat it as 0
    const amountPaid = booking.amountPaid ?? 0;
    const percentage = (amountPaid / booking.totalAmount) * 100;
    return Math.min(Math.round(percentage), 100); // Ensure we don't exceed 100%
  };

  // Helper to render status badges with appropriate colors
  const renderStatusBadge = (status: string, type: 'payment' | 'inspection' | 'report') => {
    let variant = 'default';
    
    if (type === 'payment') {
      switch (status) {
        case 'pending':
          variant = 'secondary';
          break;
        case 'partial':
          variant = 'warning';
          break;
        case 'paid':
          variant = 'success';
          break;
        case 'overdue':
          variant = 'destructive';
          break;
        case 'refunded':
          variant = 'outline';
          break;
        default:
          variant = 'default';
      }
    } else if (type === 'inspection') {
      switch (status) {
        case 'not_started':
          variant = 'secondary';
          break;
        case 'scheduled':
          variant = 'info';
          break;
        case 'in_progress':
          variant = 'warning';
          break;
        case 'completed':
          variant = 'success';
          break;
        case 'cancelled':
          variant = 'destructive';
          break;
        default:
          variant = 'default';
      }
    } else if (type === 'report') {
      switch (status) {
        case 'not_started':
          variant = 'secondary';
          break;
        case 'in_progress':
          variant = 'warning';
          break;
        case 'sent':
          variant = 'info';
          break;
        case 'approved':
          variant = 'success';
          break;
        default:
          variant = 'default';
      }
    }
    
    // @ts-ignore - The variant prop types don't match exactly with our custom variants
    return <Badge variant={variant}>{status.replace(/_/g, ' ')}</Badge>;
  };

  const getStatusTypeForBookingStatus = (status: string): 'inspection' => {
    return 'inspection';
  };

  return (
    <div>
      <Table>
        <TableCaption>List of active bookings</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Booking Date</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Service Date</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8">No bookings found</TableCell>
            </TableRow>
          ) : (
            bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell>{format(new Date(booking.createdAt), 'MMM dd, yyyy')}</TableCell>
                <TableCell>
                  <div className="font-medium">{booking.name}</div>
                  <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                    {booking.propertyAddress}
                  </div>
                </TableCell>
                <TableCell>
                  {booking.serviceDate ? format(new Date(booking.serviceDate), 'MMM dd, yyyy') : 'Not scheduled'}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">
                        {renderStatusBadge(booking.paymentStatus || 'pending', 'payment')}
                      </span>
                      <span className="text-sm font-medium">
                        {booking.amountPaid ?? 0} / {booking.totalAmount} AED
                      </span>
                    </div>
                    <Progress value={getPaymentProgress(booking)} className="h-2" />
                  </div>
                </TableCell>
                <TableCell>
                  {renderStatusBadge(
                    booking.status || 'not_started', 
                    getStatusTypeForBookingStatus(booking.status || 'not_started')
                  )}
                </TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" onClick={() => handleEditBooking(booking)}>
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Edit Booking Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Booking</DialogTitle>
            <DialogDescription>
              Update the booking details, payment information, and status.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Customer Name</Label>
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
                <Label htmlFor="serviceDate">Service Date</Label>
                <Input
                  id="serviceDate"
                  type="date"
                  value={editedValues.serviceDate ? new Date(editedValues.serviceDate).toISOString().split('T')[0] : ''}
                  onChange={(e) => setEditedValues({ ...editedValues, serviceDate: e.target.value })}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="propertyAddress">Property Address</Label>
              <Textarea
                id="propertyAddress"
                value={editedValues.propertyAddress || ''}
                onChange={(e) => setEditedValues({ ...editedValues, propertyAddress: e.target.value })}
                rows={2}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="totalAmount">Total Amount (AED)</Label>
                <Input
                  id="totalAmount"
                  type="number"
                  value={editedValues.totalAmount || ''}
                  onChange={(e) => setEditedValues({ 
                    ...editedValues, 
                    totalAmount: e.target.value ? parseFloat(e.target.value) : 0 
                  })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="amountPaid">Amount Paid (AED)</Label>
                <Input
                  id="amountPaid"
                  type="number"
                  value={editedValues.amountPaid !== undefined ? editedValues.amountPaid : ''}
                  onChange={(e) => setEditedValues({ 
                    ...editedValues, 
                    amountPaid: e.target.value ? parseFloat(e.target.value) : 0 
                  })}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="paymentStatus">Payment Status</Label>
                <Select
                  value={editedValues.paymentStatus || 'pending'}
                  onValueChange={(value) => setEditedValues({ ...editedValues, paymentStatus: value as PaymentStatus })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="inspectionStatus">Inspection Status</Label>
                <Select
                  value={editedValues.status || 'not_started'}
                  onValueChange={(value) => setEditedValues({ ...editedValues, status: value as InspectionStatus })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select inspection status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not_started">Not Started</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="adminNotes">Admin Notes</Label>
              <Textarea
                id="adminNotes"
                value={editedValues.adminNotes || ''}
                onChange={(e) => setEditedValues({ ...editedValues, adminNotes: e.target.value })}
                placeholder="Add admin notes about this booking"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
            <Button onClick={handleUpdateBooking} disabled={updateBookingMutation.isPending}>
              {updateBookingMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BusinessCycleTracker;