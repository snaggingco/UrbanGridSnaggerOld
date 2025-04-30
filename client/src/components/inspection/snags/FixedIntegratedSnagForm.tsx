import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  CalendarIcon, 
  Check, 
  ChevronsUpDown, 
  Image as ImageIcon,
  Loader2, 
  Plus, 
  Save, 
  X,
  Pencil
} from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Define annotation type for image markups
interface Annotation {
  x: number;
  y: number;
  text: string;
}

const snagSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  severity: z.enum(["critical", "major", "minor"]),
  category: z.enum([
    "Electrical", "Plumbing", "Flooring", "Walls", "Ceiling", 
    "Doors", "HVAC", "Appliances", "Exterior", "Structural", "Other"
  ]),
  status: z.enum(["open", "in_progress", "resolved"]),
  location: z.string().min(1, "Room/Area is required"),
  locationId: z.number().optional(), // Store the room ID
  assignedTo: z.string().optional(),
  dueDate: z.date().optional(),
});

type SnagFormValues = z.infer<typeof snagSchema>;

interface IntegratedSnagFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: number;
  snagId?: number;
  locations: Location[];
}

// Match the exact categories as defined in the schema
const categories = [
  "Electrical", 
  "Plumbing", 
  "Flooring", 
  "Walls", 
  "Ceiling", 
  "Doors", 
  "HVAC", 
  "Appliances", 
  "Exterior", 
  "Structural", 
  "Other"
];

const assignees = [
  "John Smith (Contractor)",
  "Sarah Lee (Electrician)",
  "Mike Chen (Plumber)",
  "Lisa Wong (Project Manager)",
  "David Garcia (Finishing)",
];

export default function IntegratedSnagForm({
  open,
  onOpenChange,
  projectId,
  snagId,
  locations,
}: IntegratedSnagFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  // State for photo upload and annotations
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [annotations, setAnnotations] = useState<Annotation[][]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [isAnnotating, setIsAnnotating] = useState(false);
  const [currentAnnotation, setCurrentAnnotation] = useState<string>("");
  const imageRef = useRef<HTMLImageElement>(null);

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
      category: "Other", // Default to a valid category
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
      
      // Ensure category is one of the valid options or default to "Other"
      let validCategory = snag.category as "Electrical" | "Plumbing" | "Flooring" | "Walls" | "Ceiling" | 
        "Doors" | "HVAC" | "Appliances" | "Exterior" | "Structural" | "Other";
      
      // Fallback to "Other" if the category from API is not in our list
      if (!categories.includes(validCategory as string)) {
        validCategory = "Other";
      }
      
      form.reset({
        title: snag.title,
        description: snag.description || "",
        severity: snag.severity as "critical" | "major" | "minor",
        category: validCategory,
        status: snag.status as "open" | "in_progress" | "resolved",
        location: snag.location,
        locationId: locationIdValue,
        assignedTo: snag.assignedTo,
        dueDate: snag.dueDate ? new Date(snag.dueDate) : undefined,
      });
    }
  }, [snag, form]);

  // Fetch snag images if editing
  const { data: snagImages } = useQuery<any[]>({
    queryKey: [`/api/defects/${snagId}/images`],
    enabled: !!snagId && open,
  });

  // Load any existing images when editing a snag
  useEffect(() => {
    if (snagImages && Array.isArray(snagImages) && snagImages.length > 0) {
      // We can't actually load the files, but we can show the previews
      const newPreviews = snagImages.map((img: any) => img.url);
      setPreviews(newPreviews);
      
      // Initialize annotations array for existing images
      const newAnnotations = snagImages.map((img: any) => {
        if (img.annotations) {
          try {
            return JSON.parse(img.annotations);
          } catch (e) {
            console.error("Error parsing annotations:", e);
            return [];
          }
        }
        return [];
      });
      setAnnotations(newAnnotations);
    }
  }, [snagImages]);

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

  // Create mutation with images
  const createMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return apiRequest(`/api/projects/${projectId}/defects-with-images`, {
        method: "POST",
        body: formData,
        isFormData: true, // Skip JSON.stringify for FormData
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}/defects`] });
      toast({
        title: "Snag created",
        description: "Snag has been created successfully with images",
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
  const prepareRooms = (rooms: Location[] | undefined): { id: string | number; name: string; path: string; type?: string }[] => {
    if (!rooms || !Array.isArray(rooms)) return [];
    return rooms.map(room => ({
      id: room.id, 
      name: room.name,
      path: room.name,
      type: room.type
    }));
  };

  const roomsList = prepareRooms(locations);

  // Handle file input change (photo upload)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
      
      // Create previews
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setPreviews(prev => [...prev, ...newPreviews]);
      
      // Initialize annotations array for new images
      setAnnotations(prev => [...prev, ...newFiles.map(() => [])]);
    }
  };

  // Handle removing an image
  const handleRemoveImage = (index: number) => {
    const newFiles = [...files];
    const newPreviews = [...previews];
    const newAnnotations = [...annotations];
    
    // Remove the file if it exists (might not for existing images)
    if (index < files.length) {
      newFiles.splice(index, 1);
    }
    
    newPreviews.splice(index, 1);
    newAnnotations.splice(index, 1);
    
    setFiles(newFiles);
    setPreviews(newPreviews);
    setAnnotations(newAnnotations);
    
    // Reset selected image if needed
    if (selectedImageIndex === index) {
      setSelectedImageIndex(null);
    } else if (selectedImageIndex !== null && selectedImageIndex > index) {
      setSelectedImageIndex(selectedImageIndex - 1);
    }
  };

  // Handle selecting an image for annotation
  const handleSelectImage = (index: number) => {
    setSelectedImageIndex(index);
    setIsAnnotating(false);
  };

  // Handle image click for annotation
  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!isAnnotating || !imageRef.current || selectedImageIndex === null || !currentAnnotation.trim()) {
      return;
    }
    
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Add the annotation
    const newAnnotations = [...annotations];
    newAnnotations[selectedImageIndex] = [
      ...newAnnotations[selectedImageIndex],
      { x, y, text: currentAnnotation.trim() }
    ];
    
    setAnnotations(newAnnotations);
    setCurrentAnnotation("");
    setIsAnnotating(false);
  };

  // Handle form submission
  async function onSubmit(values: SnagFormValues) {
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
      // For editing existing snags, we'll just update the snag details
      // (image upload would be handled separately)
      updateMutation.mutate(dataToSubmit);
    } else {
      // For new snags, we'll create a FormData object to send both the snag data and any images
      const formData = new FormData();
      
      // Add snag data as a JSON string
      formData.append('defectData', JSON.stringify(dataToSubmit));
      
      // Add any images
      files.forEach((file, index) => {
        formData.append('images', file);
        
        // Add annotations for this image if any
        if (annotations[index] && annotations[index].length > 0) {
          formData.append(`annotations[${index}]`, JSON.stringify(annotations[index]));
        }
        
        // Add image description (empty for now, could be added to the UI later)
        formData.append(`description[${index}]`, '');
      });
      
      createMutation.mutate(formData);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] flex flex-col overflow-y-auto">
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

        <div className="flex-1 flex flex-col mt-2">
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="flex-1 flex flex-col w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Snag Details</TabsTrigger>
              <TabsTrigger value="photos">
                Photos {previews.length > 0 && `(${previews.length})`}
              </TabsTrigger>
            </TabsList>
            
            <div className="overflow-y-auto flex-1 mt-2">
              <TabsContent value="details" className="mt-0 p-1">
                {isLoadingSnag && snagId ? (
                  <div className="flex justify-center items-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} id="snag-form" className="space-y-6">
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
                                            form.setValue("category", 
                                              category as "Electrical" | "Plumbing" | "Flooring" | "Walls" | 
                                              "Ceiling" | "Doors" | "HVAC" | "Appliances" | "Exterior" | 
                                              "Structural" | "Other");
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
                    </form>
                  </Form>
                )}
              </TabsContent>
              
              <TabsContent value="photos" className="mt-0 p-1">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Photos & Annotations</h3>
                    
                    <div>
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="gap-1" 
                        onClick={() => document.getElementById("snag-images")?.click()}
                      >
                        <Plus className="h-4 w-4" />
                        Add Photos
                      </Button>
                      <Input
                        id="snag-images"
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </div>
                  </div>
                  
                  {previews.length === 0 ? (
                    <div className="border-2 border-dashed rounded-md p-10 text-center">
                      <ImageIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-gray-500">No photos added yet</p>
                      <p className="text-gray-400 text-sm mb-3">Upload images of the defect</p>
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="mx-auto"
                        onClick={() => document.getElementById("snag-images")?.click()}
                      >
                        Upload Images
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {previews.map((preview, index) => (
                          <div 
                            key={index} 
                            className={cn(
                              "relative border rounded-md overflow-hidden aspect-square cursor-pointer group",
                              selectedImageIndex === index ? "ring-2 ring-primary" : ""
                            )}
                            onClick={() => handleSelectImage(index)}
                          >
                            <img
                              src={preview}
                              alt={`Image ${index + 1}`}
                              className="object-cover w-full h-full"
                            />
                            <Button
                              type="button"
                              size="icon"
                              variant="destructive"
                              className="h-6 w-6 absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveImage(index);
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                            {annotations[index]?.length > 0 && (
                              <div className="absolute bottom-1 right-1 bg-yellow-500 text-white rounded p-1">
                                <Pencil className="h-3 w-3" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      {selectedImageIndex !== null && (
                        <div className="space-y-4">
                          <div className="relative border rounded-md overflow-hidden">
                            <img
                              ref={imageRef}
                              src={previews[selectedImageIndex]}
                              alt={`Selected image ${selectedImageIndex + 1}`}
                              className="w-full object-contain max-h-[400px]"
                              onClick={handleImageClick}
                              style={{ cursor: isAnnotating ? 'crosshair' : 'default' }}
                            />
                            
                            {/* Annotation markers */}
                            {annotations[selectedImageIndex]?.map((annotation, i) => (
                              <div
                                key={i}
                                className="absolute w-5 h-5 bg-yellow-500 text-white rounded-full flex items-center justify-center -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                                style={{
                                  left: `${annotation.x}%`,
                                  top: `${annotation.y}%`,
                                }}
                                title={annotation.text}
                              >
                                {i + 1}
                              </div>
                            ))}
                            
                            <div className="absolute top-2 right-2 flex space-x-2">
                              <Button
                                type="button"
                                size="sm"
                                variant={isAnnotating ? "default" : "outline"}
                                className="h-8"
                                onClick={() => setIsAnnotating(!isAnnotating)}
                              >
                                <Pencil className="h-3.5 w-3.5 mr-1" />
                                {isAnnotating ? "Cancel" : "Annotate"}
                              </Button>
                            </div>
                          </div>
                          
                          {isAnnotating && (
                            <div className="flex space-x-2">
                              <Input
                                placeholder="Enter annotation text and click on image..."
                                value={currentAnnotation}
                                onChange={(e) => setCurrentAnnotation(e.target.value)}
                                className="flex-1"
                              />
                            </div>
                          )}
                          
                          {annotations[selectedImageIndex]?.length > 0 && (
                            <div className="space-y-2">
                              <h4 className="text-sm font-medium">Annotations</h4>
                              <div className="space-y-1 max-h-[150px] overflow-y-auto">
                                {annotations[selectedImageIndex].map((annotation, i) => (
                                  <div
                                    key={i}
                                    className="flex items-start space-x-2 text-sm"
                                  >
                                    <div className="w-5 h-5 bg-yellow-500 text-white rounded-full flex items-center justify-center flex-shrink-0">
                                      {i + 1}
                                    </div>
                                    <p className="text-gray-700 flex-1">{annotation.text}</p>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-5 w-5"
                                      onClick={() => {
                                        const newAnnotations = [...annotations];
                                        newAnnotations[selectedImageIndex] = newAnnotations[selectedImageIndex].filter((_, index) => index !== i);
                                        setAnnotations(newAnnotations);
                                      }}
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <DialogFooter className="pt-4">
          <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            type="submit"
            form="snag-form"
            disabled={isSubmitting}
          >
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
      </DialogContent>
    </Dialog>
  );
}