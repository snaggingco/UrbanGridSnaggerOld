import React from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  insertInquirySchema, 
  type InsertInquiry, 
  insertBookingSchema, 
  type InsertBooking 
} from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type FormType = "inquiry" | "booking" | "exit";

interface UnifiedFormProps {
  formType: FormType;
  onSuccess?: () => void;
}

export default function UnifiedForm({ formType, onSuccess }: UnifiedFormProps) {
  const { toast } = useToast();
  
  // To handle the case where we need two separate forms
  const isBookingForm = formType === "booking";
  const isExitForm = formType === "exit";
  
  // We need to create two separate form handlers due to TypeScript constraints
  // For the booking form
  const bookingForm = useForm<InsertBooking>({
    resolver: zodResolver(insertBookingSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      propertyType: "apartment",
      propertyAddress: "",
      serviceTypes: [] as string[],
      serviceDate: new Date(),
      status: "not_started",
      totalAmount: 0,
    },
  });

  // For the inquiry form
  const inquiryForm = useForm<InsertInquiry>({
    resolver: zodResolver(insertInquirySchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: "",
      propertyType: "apartment", // Default to a valid value
    },
  });

  // Select the correct form based on type
  const form = isBookingForm ? bookingForm : inquiryForm;
  
  const endpoint = isBookingForm ? "/api/bookings" : "/api/inquiries";
  const buttonText = isBookingForm ? "Book Now" : "Submit Inquiry";
  const loadingText = isBookingForm ? "Processing..." : "Submitting...";
  const successTitle = isBookingForm ? "Success!" : "Success!";
  const successMessage = isBookingForm 
    ? "Your booking has been submitted. We'll confirm shortly."
    : "Your inquiry has been submitted. We'll contact you shortly.";

  // Create separate mutations for each form type
  const bookingMutation = useMutation({
    mutationFn: async (data: InsertBooking) => {
      try {
        // Use correct parameters for apiRequest: endpoint, options object with method and stringified body
        return await apiRequest<any>("/api/bookings", {
          method: "POST",
          body: JSON.stringify(data),
        });
      } catch (error) {
        console.error("Booking submission error:", error);
        throw new Error('Network error. Please check your connection and try again.');
      }
    },
    onSuccess: () => {
      toast({
        title: successTitle,
        description: successMessage,
        variant: "default",
      });
      bookingForm.reset();
      if (onSuccess) onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Booking Failed",
        description: error.message || "Please try again or contact us directly.",
        variant: "destructive",
      });
    },
  });

  const inquiryMutation = useMutation({
    mutationFn: async (data: InsertInquiry) => {
      try {
        // Use correct parameters for apiRequest: endpoint, options object with method and stringified body
        return await apiRequest<any>("/api/inquiries", {
          method: "POST",
          body: JSON.stringify(data),
        });
      } catch (error) {
        console.error("Inquiry submission error:", error);
        throw new Error('Network error. Please check your connection and try again.');
      }
    },
    onSuccess: () => {
      toast({
        title: successTitle,
        description: successMessage,
        variant: "default",
      });
      inquiryForm.reset();
      if (onSuccess) onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Please try again or contact us directly.",
        variant: "destructive",
      });
    },
  });

  // Select the appropriate mutation based on form type
  const mutation = isBookingForm ? bookingMutation : inquiryMutation;

  // Render either the booking form or inquiry form based on formType
  if (isBookingForm) {
    return <BookingFormContent form={bookingForm} mutation={bookingMutation} />;
  } else {
    return <InquiryFormContent form={inquiryForm} mutation={inquiryMutation} />;
  }
}

// Booking form component
function BookingFormContent({
  form,
  mutation
}: {
  form: UseFormReturn<InsertBooking>;
  mutation: any;
}) {
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
        className="space-y-6"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700">Name</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Your name" 
                  {...field} 
                  className="border-gray-300 focus:border-[#34A853] focus:ring-[#34A853] shadow-sm rounded-md bg-white placeholder:text-gray-400"
                />
              </FormControl>
              <FormMessage className="text-sm text-red-600" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700">Email</FormLabel>
              <FormControl>
                <Input 
                  type="email" 
                  placeholder="Your email" 
                  {...field} 
                  className="border-gray-300 focus:border-[#34A853] focus:ring-[#34A853] shadow-sm rounded-md bg-white placeholder:text-gray-400"
                />
              </FormControl>
              <FormMessage className="text-sm text-red-600" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700">Phone</FormLabel>
              <FormControl>
                <PhoneInput
                  country={'ae'}
                  value={field.value}
                  onChange={(phone) => field.onChange(phone)}
                  inputClass="!w-full !h-10 !border-gray-300 !focus:border-[#34A853] !focus:ring-[#34A853] !shadow-sm !rounded-md !bg-white !text-gray-900"
                  buttonClass="!border-gray-300 !bg-white"
                  containerClass="!w-full"
                />
              </FormControl>
              <FormMessage className="text-sm text-red-600" />
            </FormItem>
          )}
        />

        <div className="space-y-3">
          <FormLabel className="text-sm font-medium text-gray-700">Services Needed</FormLabel>
          <FormDescription className="text-sm text-muted-foreground mt-0">
            Select one or more services you require
          </FormDescription>
          
          <FormField
            control={form.control}
            name="serviceTypes"
            render={({ field }) => (
              <FormItem className="space-y-6">
                <FormMessage className="text-sm text-red-600" />
                
                {/* Inspection Services Section */}
                <div className="border rounded-md p-4 bg-gray-50">
                  <h3 className="text-md font-medium text-gray-800 mb-3 border-b pb-2">Inspection Services</h3>
                  <div className="space-y-3 pl-2">
                    <FormField
                      control={form.control}
                      name="serviceTypes"
                      render={({ field }) => (
                        <FormItem
                          key="inspection-service"
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes("inspection-service")}
                              onCheckedChange={(checked) => (
                                checked
                                  ? field.onChange([...field.value || [], "inspection-service"])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== "inspection-service"
                                      ) || []
                                    )
                              )}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm font-medium text-gray-700">
                              Property Inspection
                            </FormLabel>
                            <FormDescription className="text-xs text-muted-foreground">
                              Professional inspection of your property
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                {/* Move-In Services Section */}
                <div className="border rounded-md p-4 bg-gray-50">
                  <h3 className="text-md font-medium text-gray-800 mb-3 border-b pb-2">Move-In Services</h3>
                  <div className="space-y-3 pl-2">
                    {/* Deep Cleaning */}
                    <FormField
                      control={form.control}
                      name="serviceTypes"
                      render={({ field }) => (
                        <FormItem
                          key="deep-cleaning"
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes("deep-cleaning")}
                              onCheckedChange={(checked) => (
                                checked
                                  ? field.onChange([...field.value || [], "deep-cleaning"])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== "deep-cleaning"
                                      ) || []
                                    )
                              )}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm font-medium text-gray-700">
                              Deep Cleaning
                            </FormLabel>
                            <FormDescription className="text-xs text-muted-foreground">
                              Thorough cleaning service for your property
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    {/* Pest Control */}
                    <FormField
                      control={form.control}
                      name="serviceTypes"
                      render={({ field }) => (
                        <FormItem
                          key="pest-control"
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes("pest-control")}
                              onCheckedChange={(checked) => (
                                checked
                                  ? field.onChange([...field.value || [], "pest-control"])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== "pest-control"
                                      ) || []
                                    )
                              )}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm font-medium text-gray-700">
                              Pest Control
                            </FormLabel>
                            <FormDescription className="text-xs text-muted-foreground">
                              Effective pest prevention and control for your property
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    {/* Fit-out Services */}
                    <FormField
                      control={form.control}
                      name="serviceTypes"
                      render={({ field }) => (
                        <FormItem
                          key="fit-out-services"
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes("fit-out-services")}
                              onCheckedChange={(checked) => (
                                checked
                                  ? field.onChange([...field.value || [], "fit-out-services"])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== "fit-out-services"
                                      ) || []
                                    )
                              )}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm font-medium text-gray-700">
                              Fit-out Services
                            </FormLabel>
                            <FormDescription className="text-xs text-muted-foreground">
                              Interior fit-out and renovation services
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    {/* Handyman & Maintenance */}
                    <FormField
                      control={form.control}
                      name="serviceTypes"
                      render={({ field }) => (
                        <FormItem
                          key="maintenance"
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes("maintenance")}
                              onCheckedChange={(checked) => (
                                checked
                                  ? field.onChange([...field.value || [], "maintenance"])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== "maintenance"
                                      ) || []
                                    )
                              )}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm font-medium text-gray-700">
                              Handyman & Maintenance
                            </FormLabel>
                            <FormDescription className="text-xs text-muted-foreground">
                              General maintenance and repair services
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    {/* AC Cleaning */}
                    <FormField
                      control={form.control}
                      name="serviceTypes"
                      render={({ field }) => (
                        <FormItem
                          key="ac-cleaning"
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes("ac-cleaning")}
                              onCheckedChange={(checked) => (
                                checked
                                  ? field.onChange([...field.value || [], "ac-cleaning"])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== "ac-cleaning"
                                      ) || []
                                    )
                              )}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm font-medium text-gray-700">
                              AC Cleaning
                            </FormLabel>
                            <FormDescription className="text-xs text-muted-foreground">
                              Air conditioning cleaning and maintenance
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    {/* Packers & Movers */}
                    <FormField
                      control={form.control}
                      name="serviceTypes"
                      render={({ field }) => (
                        <FormItem
                          key="packers-movers"
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes("packers-movers")}
                              onCheckedChange={(checked) => (
                                checked
                                  ? field.onChange([...field.value || [], "packers-movers"])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== "packers-movers"
                                      ) || []
                                    )
                              )}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm font-medium text-gray-700">
                              Packers & Movers
                            </FormLabel>
                            <FormDescription className="text-xs text-muted-foreground">
                              Professional packing and moving services
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="propertyType"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700">Property Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="border-gray-300 focus:border-[#34A853] focus:ring-[#34A853] shadow-sm rounded-md bg-white">
                    <SelectValue placeholder="Select property type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="villa">Villa</SelectItem>
                  <SelectItem value="townhouse">Townhouse</SelectItem>
                  <SelectItem value="office">Office</SelectItem>
                  <SelectItem value="commercial">Commercial Space</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage className="text-sm text-red-600" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="propertyAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700">Property Address</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter your property address" 
                  {...field} 
                  className="border-gray-300 focus:border-[#34A853] focus:ring-[#34A853] shadow-sm rounded-md bg-white placeholder:text-gray-400 min-h-[80px]"
                />
              </FormControl>
              <FormMessage className="text-sm text-red-600" />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          disabled={mutation.isPending} 
          className="w-full bg-[#34A853] hover:bg-[#2C9045] text-white font-medium py-2 px-4 rounded-md shadow transition-colors"
        >
          {mutation.isPending ? "Processing..." : "Book Now"}
        </Button>
      </form>
    </Form>
  );
}

// Inquiry form component
function InquiryFormContent({
  form,
  mutation
}: {
  form: UseFormReturn<InsertInquiry>;
  mutation: any;
}) {
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
        className="space-y-6"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700">Name</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Your name" 
                  {...field} 
                  className="border-gray-300 focus:border-[#34A853] focus:ring-[#34A853] shadow-sm rounded-md bg-white placeholder:text-gray-400"
                />
              </FormControl>
              <FormMessage className="text-sm text-red-600" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700">Email</FormLabel>
              <FormControl>
                <Input 
                  type="email" 
                  placeholder="Your email" 
                  {...field} 
                  className="border-gray-300 focus:border-[#34A853] focus:ring-[#34A853] shadow-sm rounded-md bg-white placeholder:text-gray-400"
                />
              </FormControl>
              <FormMessage className="text-sm text-red-600" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700">Phone</FormLabel>
              <FormControl>
                <PhoneInput
                  country={'ae'}
                  value={field.value}
                  onChange={(phone) => field.onChange(phone)}
                  inputClass="!w-full !h-10 !border-gray-300 !focus:border-[#34A853] !focus:ring-[#34A853] !shadow-sm !rounded-md !bg-white !text-gray-900"
                  buttonClass="!border-gray-300 !bg-white"
                  containerClass="!w-full"
                />
              </FormControl>
              <FormMessage className="text-sm text-red-600" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="propertyType"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700">Property Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="border-gray-300 focus:border-[#34A853] focus:ring-[#34A853] shadow-sm rounded-md bg-white">
                    <SelectValue placeholder="Select property type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="villa">Villa</SelectItem>
                  <SelectItem value="townhouse">Townhouse</SelectItem>
                  <SelectItem value="office">Office</SelectItem>
                  <SelectItem value="commercial">Commercial Space</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage className="text-sm text-red-600" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700">Message</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Tell us about your requirements" 
                  {...field} 
                  className="border-gray-300 focus:border-[#34A853] focus:ring-[#34A853] shadow-sm rounded-md bg-white placeholder:text-gray-400 min-h-[100px]"
                />
              </FormControl>
              <FormMessage className="text-sm text-red-600" />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          disabled={mutation.isPending} 
          className="w-full bg-[#34A853] hover:bg-[#2C9045] text-white font-medium py-2 px-4 rounded-md shadow transition-colors"
        >
          {mutation.isPending ? "Submitting..." : "Send Inquiry"}
        </Button>
      </form>
    </Form>
  );
}