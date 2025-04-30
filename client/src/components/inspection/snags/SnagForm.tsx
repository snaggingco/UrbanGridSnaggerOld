import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon, Check, ChevronsUpDown, Loader2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Location } from "./LocationTree";
import { Snag } from "./SnagList";
import { Project } from "@shared/schema";

const snagSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  severity: z.enum(["critical", "major", "minor"]),
  category: z.string().min(1, "Category is required"),
  status: z.enum(["open", "in_progress", "resolved"]),
  location: z.string().min(1, "Room/Area is required"),
  locationId: z.number().optional(), // Store the room ID
  assignedTo: z.string().optional(),
  dueDate: z.date().optional(),
});

type SnagFormValues = z.infer<typeof snagSchema>;

interface SnagFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: number;
  snagId?: number;
  locations: Location[];
}

const categories = [
  "Structural",
  "Electrical",
  "Plumbing",
  "Finishing",
  "Mechanical",
  "Flooring",
  "Wall/Ceiling",
  "Doors/Windows",
  "External",
  "Other",
];

const assignees = [
  "John Smith (Contractor)",
  "Sarah Lee (Electrician)",
  "Mike Chen (Plumber)",
  "Lisa Wong (Project Manager)",
  "David Garcia (Finishing)",
];

export default function SnagForm({
  open,
  onOpenChange,
  projectId,
  snagId,
  locations,
}: SnagFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch snag details if editing an existing snag
  const { data: snag, isLoading: isLoadingSnag } = useQuery<Snag>({
    queryKey: [`/api/projects/${projectId}/defects/${snagId}`],
    enabled: !!snagId && !!projectId && open,
  });

  // Create form
  const form = useForm<SnagFormValues>({
    resolver: zodResolver(snagSchema),
    defaultValues: {
      title: "",
      description: "",
      severity: "minor",
      category: "",
      status: "open",
      location: "",
      locationId: undefined,
      assignedTo: undefined,
      dueDate: undefined,
    },
  });

  // Update form values when snag data is loaded
  useEffect(() => {
    if (snag) {
      // Convert locationId to number if needed
      let locationIdValue: number | undefined = undefined;
      if (snag.locationId !== null && snag.locationId !== undefined) {
        locationIdValue = typeof snag.locationId === 'string' 
          ? parseInt(String(snag.locationId), 10) 
          : Number(snag.locationId);
      }
      
      form.reset({
        title: snag.title,
        description: snag.description || "",
        severity: snag.severity as "critical" | "major" | "minor",
        category: snag.category,
        status: snag.status as "open" | "in_progress" | "resolved",
        location: snag.location,
        locationId: locationIdValue,
        assignedTo: snag.assignedTo,
        dueDate: snag.dueDate ? new Date(snag.dueDate) : undefined,
      });
    }
  }, [snag, form]);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (values: SnagFormValues) => {
      return apiRequest(`/api/projects/${projectId}/defects/${snagId}`, {
        method: "PATCH",
        body: JSON.stringify(values),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/defects`] });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/defects/${snagId}`] });
      toast({
        title: "Snag updated",
        description: "Snag has been updated successfully",
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update snag",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (values: SnagFormValues) => {
      return apiRequest(`/api/projects/${projectId}/defects`, {
        method: "POST",
        body: JSON.stringify(values),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/defects`] });
      toast({
        title: "Snag created",
        description: "Snag has been created successfully",
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create snag",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  // Get the project details to know the project location
  const { data: project } = useQuery<Project>({
    queryKey: [`/api/projects/${projectId}`],
    enabled: !!projectId,
  });

  // Prepare rooms list for the dropdown
  const prepareRooms = (rooms: Location[]): { id: string | number; name: string; path: string }[] => {
    return rooms.map(room => ({
      id: room.id, 
      name: room.name,
      path: room.name,
      type: room.type
    }));
  };

  const roomsList = prepareRooms(locations || []);

  function onSubmit(values: SnagFormValues) {
    setIsSubmitting(true);
    
    // Find the locationId associated with the selected room name
    const selectedLocation = locations?.find(loc => loc.name === values.location);
    
    // Ensure locationId is a number or undefined (not null or string)
    let locationIdValue: number | undefined = undefined;
    
    if (selectedLocation?.id) {
      // Convert to number if it's a string
      locationIdValue = typeof selectedLocation.id === 'string' 
        ? parseInt(String(selectedLocation.id), 10) 
        : Number(selectedLocation.id);
    }
    
    // Add locationId to the values being submitted
    const dataToSubmit = {
      ...values,
      locationId: locationIdValue
    };
    
    if (snagId) {
      updateMutation.mutate(dataToSubmit);
    } else {
      createMutation.mutate(dataToSubmit);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {snagId ? "Edit Snag" : "Add New Snag"}
          </DialogTitle>
          <DialogDescription>
            {snagId 
              ? "Update the details of this snag"
              : "Create a new snag to track defects or issues"}
          </DialogDescription>
        </DialogHeader>

        {isLoadingSnag && snagId ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title*</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Cracked Tile in Master Bathroom" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Provide details about the issue"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="severity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Severity*</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select severity" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="critical">Critical</SelectItem>
                          <SelectItem value="major">Major</SelectItem>
                          <SelectItem value="minor">Minor</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status*</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Category*</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "justify-between",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value
                                ? categories.find(
                                    (category) => category === field.value
                                  )
                                : "Select category"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="p-0 w-[300px]">
                          <Command>
                            <CommandInput placeholder="Search category..." />
                            <CommandEmpty>No category found.</CommandEmpty>
                            <CommandGroup>
                              {categories.map((category) => (
                                <CommandItem
                                  value={category}
                                  key={category}
                                  onSelect={() => {
                                    form.setValue("category", category);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      category === field.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {category}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Room/Area*</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a room/area" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {roomsList.length > 0 ? (
                            roomsList.map((room) => (
                              <SelectItem 
                                key={room.id} 
                                value={room.name}
                              >
                                {room.name}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="custom">
                              Add rooms first
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="assignedTo"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Assigned To</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "justify-between",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value || "Assign to someone"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="p-0 w-[300px]">
                          <Command>
                            <CommandInput placeholder="Search people..." />
                            <CommandEmpty>No person found.</CommandEmpty>
                            <CommandGroup>
                              {assignees.map((person) => (
                                <CommandItem
                                  value={person}
                                  key={person}
                                  onSelect={() => {
                                    form.setValue("assignedTo", person);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      person === field.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {person}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Due Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "justify-start text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {snagId ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {snagId ? "Update Snag" : "Create Snag"}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}