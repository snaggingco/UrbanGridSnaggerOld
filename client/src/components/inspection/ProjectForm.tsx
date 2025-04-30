import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

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
  reraAuditType: z.enum(["condition_survey", "reserve_fund_study"]).optional(),
});

type CreateProjectFormValues = z.infer<typeof createProjectSchema>;

interface ProjectFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ProjectForm({ open, onOpenChange }: ProjectFormProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Get project type from localStorage
  const projectType = localStorage.getItem("lastProjectType") || "snagging";
  const reraAuditType = localStorage.getItem("reraAuditType") || "condition_survey";
  
  const form = useForm<CreateProjectFormValues>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: "",
      clientName: "",
      location: "",
      propertyType: "Apartment", // Default to avoid type error
      propertySize: "",
      date: new Date().toISOString().split("T")[0],
      status: "pending",
      projectType: projectType === "rera_audit" ? "rera_audit" : "snagging",
      reraAuditType: projectType === "rera_audit" ? 
        (reraAuditType === "reserve_fund_study" ? "reserve_fund_study" : "condition_survey") 
        : undefined,
    },
  });
  
  const createProjectMutation = useMutation({
    mutationFn: async (data: CreateProjectFormValues) => {
      // Get stored token from localStorage
      const token = localStorage.getItem("auth_token");
      
      if (!token) {
        throw new Error("Authentication token not found. Please log in again.");
      }
      
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
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
        setLocation(`/inspection/rera-audit/${data.id}`);
      } else {
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
    // Get user ID from localStorage
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    
    if (!user.id) {
      toast({
        title: "Authentication error",
        description: "User ID not found. Please log in again.",
        variant: "destructive"
      });
      return;
    }
    
    // Create a complete data object with all required fields
    const completeData = {
      ...data,
      userId: user.id
    };
    
    console.log("Submitting project data:", completeData);
    createProjectMutation.mutate(completeData);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New {projectType === "rera_audit" ? "RERA Audit" : "Snagging"} Project</DialogTitle>
          <DialogDescription>
            Enter the details for your new project
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
            
            {/* Hidden fields for project type and RERA audit type */}
            <input type="hidden" {...form.register("projectType")} />
            {projectType === "rera_audit" && (
              <input type="hidden" {...form.register("reraAuditType")} />
            )}
            
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