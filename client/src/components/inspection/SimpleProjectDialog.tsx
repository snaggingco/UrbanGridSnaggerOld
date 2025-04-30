import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

// Property types enum values matching the schema
const propertyTypes = [
  "Apartment",
  "Villa",
  "Townhouse",
  "Penthouse",
  "Commercial",
  "Office",
  "Retail",
  "Other",
];

const propertySizes = [
  "Studio",
  "1-bedroom",
  "2-bedroom",
  "3-bedroom",
  "4-bedroom",
  "5+ bedroom",
  "Small (<1000 sq.ft)",
  "Medium (1000-3000 sq.ft)",
  "Large (3000+ sq.ft)",
];

// Create a schema for project creation
const createProjectSchema = z.object({
  name: z.string().min(3, "Project name must be at least 3 characters"),
  clientName: z.string().min(3, "Client name must be at least 3 characters"),
  location: z.string().min(3, "Location must be at least 3 characters"),
  propertyType: z.enum(["Apartment", "Villa", "Townhouse", "Penthouse", "Commercial", "Office", "Retail", "Other"], {
    errorMap: () => ({ message: "Please select a valid property type" })
  }),
  propertySize: z.string().optional(),
  date: z.string().transform(value => new Date(value).toISOString()),
  status: z.enum(["pending", "in_progress", "completed", "cancelled"]).default("pending"),
  projectType: z.enum(["snagging", "rera_audit"]).default("snagging"),
  reraAuditType: z.enum(["condition_survey", "reserve_fund_study", "amc_cost_allocation"]).optional(),
});

type CreateProjectFormValues = z.infer<typeof createProjectSchema>;

interface SimpleProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SimpleProjectDialog({ open, onOpenChange }: SimpleProjectDialogProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Internal state for project type selection
  const [projectType, setProjectType] = useState<"snagging" | "rera_audit">("snagging");
  const [reraAuditType, setReraAuditType] = useState<"condition_survey" | "reserve_fund_study" | "amc_cost_allocation">("condition_survey");
  
  // Initialize form
  const form = useForm<CreateProjectFormValues>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: "",
      clientName: "",
      location: "",
      propertyType: "Apartment", // Default to first option
      propertySize: "",
      date: new Date().toISOString().split("T")[0],
      status: "pending",
      projectType: "snagging",
      reraAuditType: undefined,
    },
  });

  // Update form values when project type changes
  const handleProjectTypeChange = (value: "snagging" | "rera_audit") => {
    setProjectType(value);
    form.setValue("projectType", value);
    
    if (value === "rera_audit") {
      form.setValue("reraAuditType", reraAuditType as "condition_survey" | "reserve_fund_study" | "amc_cost_allocation");
    } else {
      form.setValue("reraAuditType", undefined);
    }
  };
  
  // Update RERA audit type when it changes
  const handleReraAuditTypeChange = (value: "condition_survey" | "reserve_fund_study" | "amc_cost_allocation") => {
    setReraAuditType(value);
    if (projectType === "rera_audit") {
      form.setValue("reraAuditType", value);
    }
  };
  
  const createProjectMutation = useMutation({
    mutationFn: async (data: CreateProjectFormValues) => {
      // Get stored token from localStorage
      const token = localStorage.getItem("auth_token");
      
      if (!token) {
        throw new Error("Authentication token not found. Please log in again.");
      }
      
      // Get user ID from localStorage
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      
      if (!user.id) {
        throw new Error("User ID not found. Please log in again.");
      }
      
      // Add user ID to the data
      const completeData = {
        ...data,
        userId: user.id
      };
      
      console.log("Submitting project data:", completeData);
      
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(completeData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create project");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Project created successfully",
        description: `Project '${data.name}' has been created.`,
      });
      onOpenChange(false);
      
      // Redirect to the appropriate project view based on project type
      if (data.projectType === "rera_audit") {
        if (data.reraAuditType === "amc_cost_allocation") {
          // Redirect to AMC Cost Allocation page
          setLocation(`/inspection/amc-allocation/${data.id}`);
        } else {
          // Redirect to regular RERA audit page for condition survey and reserve fund study
          setLocation(`/inspection/rera-project/${data.id}`);
        }
      } else {
        // Redirect to regular snagging project
        setLocation(`/inspection/project/${data.id}`);
      }
    },
    onError: (error) => {
      console.error("Error creating project:", error);
      toast({
        title: "Failed to create project",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  });
  
  const onSubmit = (data: CreateProjectFormValues) => {
    createProjectMutation.mutate(data);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Enter the details for your new project
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Project Type Selection */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Select Project Type</h3>
              <RadioGroup 
                value={projectType} 
                onValueChange={(value) => handleProjectTypeChange(value as "snagging" | "rera_audit")}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="snagging" id="snagging" />
                  <Label htmlFor="snagging">Snagging Project</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="rera_audit" id="rera_audit" />
                  <Label htmlFor="rera_audit">RERA Audit</Label>
                </div>
              </RadioGroup>
            </div>
            
            {/* RERA Audit Type (conditional) */}
            {projectType === "rera_audit" && (
              <div className="space-y-3 p-3 bg-gray-50 rounded-md border">
                <h3 className="text-sm font-medium">RERA Audit Type</h3>
                <RadioGroup 
                  value={reraAuditType} 
                  onValueChange={(value) => handleReraAuditTypeChange(value as "condition_survey" | "reserve_fund_study" | "amc_cost_allocation")}
                  className="flex flex-col space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="condition_survey" id="condition_survey" />
                    <Label htmlFor="condition_survey">Condition Survey</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="reserve_fund_study" id="reserve_fund_study" />
                    <Label htmlFor="reserve_fund_study">Reserve Fund Study</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="amc_cost_allocation" id="amc_cost_allocation" />
                    <Label htmlFor="amc_cost_allocation">AMC Cost Allocation</Label>
                  </div>
                </RadioGroup>
              </div>
            )}
            
            {/* Project Details */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter project name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="clientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter client name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="propertyType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property Type</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select property type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {propertyTypes.map(type => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="propertySize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property Size</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select property size" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {propertySizes.map(size => (
                            <SelectItem key={size} value={size}>
                              {size}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter property location" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Inspection Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createProjectMutation.isPending}
              >
                {createProjectMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Project"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}