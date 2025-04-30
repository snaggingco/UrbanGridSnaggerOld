import React, { useState, useEffect, lazy, Suspense } from "react";
// Import Reserve Fund Components
const ReserveFundAnalysis = lazy(() => import('./ReserveFundAnalysis'));
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Activity,
  Building, 
  ChevronDown, 
  ChevronRight, 
  AlertTriangle, 
  Plus, 
  Trash2, 
  Check, 
  Edit, 
  Loader2,
  ImagePlus,
  InfoIcon,
  X,
  Gauge,
  Eye,
  Camera,
  FileText,
  Clock,
  FolderTree
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  loadNRM3ClassificationData, 
  NRM3Category,
  NRM3SubCategory,
  NRM3Asset 
} from "@/lib/nrm3-classification";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface ConditionAssessmentProps {
  projectId: number;
  auditType?: "condition_survey" | "reserve_fund_study";
  categoryFilter?: string | null;
}

// Condition Rating Options
const conditionRatings = [
  { value: "A", label: "A - Good", description: "Asset performs as intended with no deterioration" },
  { value: "B", label: "B - Satisfactory", description: "Asset performs as intended with minor deterioration" },
  { value: "C", label: "C - Poor", description: "Asset shows significant deterioration affecting performance" },
  { value: "D", label: "D - Bad", description: "Asset has failed or at high risk of imminent failure" }
];

// Priority Rating Options
const priorityRatings = [
  { value: "1", label: "1 - Urgent", description: "Remedial action required immediately or within 1 year" },
  { value: "2", label: "2 - Essential", description: "Remedial action required within 1-2 years" },
  { value: "3", label: "3 - Desirable", description: "Remedial action required within 3-5 years" },
  { value: "4", label: "4 - Long-term", description: "No immediate action required, monitor only" }
];

// Unit Measurement Options
const unitOptions = [
  { value: "m", label: "Meters (m)" },
  { value: "m2", label: "Square Meters (m²)" },
  { value: "m3", label: "Cubic Meters (m³)" },
  { value: "nr", label: "Number (nr)" },
  { value: "item", label: "Item" },
  { value: "set", label: "Set" },
  { value: "lot", label: "Lot" }
];

// Typical lifespan years by NRM group (first digit)
const typicalLifespans: Record<string, number> = {
  "0": 30, // Facilitating works
  "1": 60, // Substructure
  "2": 50, // Superstructure
  "3": 15, // Internal finishes
  "4": 10, // Fittings, furnishings and equipment
  "5": 25, // Services
  "6": 20, // Prefabricated buildings and building units
  "7": 20, // Work to existing buildings
  "8": 15, // External works
};

// Helper function to find an NRM3 asset by its code in the NRM3 data structure
function findNrmAssetByCode(nrm3Data: NRM3Category[], assetCode: string): NRM3Asset | null {
  for (const category of nrm3Data) {
    for (const subCategory of category.subCategories) {
      for (const asset of subCategory.assets) {
        if (asset.code === assetCode) {
          return asset;
        }
      }
    }
  }
  return null;
}

// AssetRegistryTable Component
function AssetRegistryTable({ 
  classifications, 
  assessments, 
  locations, 
  projectId,
  conditionRatings,
  priorityRatings,
  onEditAssessment,
  resetForm,
  setSelectedNrmGroup,
  setSelectedNrmSubElement,
  setSelectedNrmAsset,
  setSelectedLocation,
  setQuantity,
  setUnit,
  setEditMode,
  setCreateDialogOpen,
  auditType,
  nrm3Data
}) {
  const { toast } = useToast();
  const [ratingStates, setRatingStates] = useState({});

  // Initialize rating states based on existing assessments
  useEffect(() => {
    if (classifications && assessments) {
      const initialStates = {};
      
      classifications.forEach(classification => {
        const assessment = assessments.find(a => a.classificationId === classification.id);
        initialStates[classification.id] = {
          conditionRating: assessment?.conditionRating || "",
          priorityRating: assessment?.priorityRating || "",
          isSubmitting: false
        };
      });
      
      setRatingStates(initialStates);
    }
  }, [classifications, assessments]);

  // Update a specific rating state
  const updateRatingState = (classificationId, field, value) => {
    setRatingStates(prev => ({
      ...prev,
      [classificationId]: {
        ...prev[classificationId],
        [field]: value
      }
    }));
  };

  // Handle quick assessment
  const handleQuickAssessment = async (classification) => {
    const classificationId = classification.id;
    const state = ratingStates[classificationId] || { conditionRating: "", priorityRating: "", isSubmitting: false };
    const assessment = assessments?.find(a => a.classificationId === classificationId);
    const isAssessed = !!assessment;
    
    if (!state.conditionRating || !state.priorityRating) {
      toast({
        title: "Missing information",
        description: "Please select both condition and priority ratings.",
        variant: "destructive",
      });
      return;
    }
    
    // Set submitting state
    setRatingStates(prev => ({
      ...prev,
      [classificationId]: {
        ...prev[classificationId],
        isSubmitting: true
      }
    }));
    
    try {
      if (isAssessed) {
        // Update existing assessment
        await apiRequest(`/api/rera/projects/${projectId}/condition-assessments/${assessment.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            conditionRating: state.conditionRating,
            priorityRating: state.priorityRating,
          }),
        });
      } else {
        // Create new assessment
        const assessmentResponse = await apiRequest(`/api/rera/projects/${projectId}/condition-assessments`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            projectId,
            classificationId,
            locationId: classification.locationId,
            conditionRating: state.conditionRating,
            priorityRating: state.priorityRating,
          }),
        });
        
        // We no longer auto-create lifecycle cost entries since we now directly use the condition assessment data
        // in the Reserve Fund Analysis to calculate lifecycle costs
      }
      
      queryClient.invalidateQueries({ queryKey: ["/api/rera/projects", projectId, "condition-assessments"] });
      
      toast({
        title: isAssessed ? "Assessment updated" : "Assessment created",
        description: `The condition assessment has been ${isAssessed ? 'updated' : 'created'} successfully.`,
      });
    } catch (error) {
      console.error("Error with assessment:", error);
      toast({
        title: "Error",
        description: `Failed to ${isAssessed ? 'update' : 'create'} assessment. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setRatingStates(prev => ({
        ...prev,
        [classificationId]: {
          ...prev[classificationId],
          isSubmitting: false
        }
      }));
    }
  };

  // Sort classifications to show unassessed items first
  const sortedClassifications = [...classifications].sort((a, b) => {
    const aAssessed = assessments?.some(assessment => assessment.classificationId === a.id);
    const bAssessed = assessments?.some(assessment => assessment.classificationId === b.id);
    
    if (aAssessed === bAssessed) return 0;
    return aAssessed ? 1 : -1;
  });

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Asset Name</TableHead>
            <TableHead>NRM Code</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Condition Rating</TableHead>
            <TableHead>Priority Rating</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedClassifications.map(classification => {
            const location = locations?.find(l => l.id === classification.locationId);
            const assessment = assessments?.find(a => a.classificationId === classification.id);
            const isAssessed = !!assessment;
            const state = ratingStates[classification.id] || { conditionRating: "", priorityRating: "", isSubmitting: false };
            
            return (
              <TableRow key={classification.id} className={!isAssessed ? "bg-muted/25" : ""}>
                <TableCell className="font-medium">
                  {classification.description}
                </TableCell>
                <TableCell>
                  <code className="px-1 py-0.5 bg-muted rounded text-xs">
                    {classification.nrmElement}
                  </code>
                </TableCell>
                <TableCell>
                  {location?.name || "General"}
                </TableCell>
                <TableCell>
                  {classification.quantity || 1} {classification.unit || "item"}
                </TableCell>
                <TableCell>
                  <Select 
                    value={state.conditionRating} 
                    onValueChange={value => updateRatingState(classification.id, 'conditionRating', value)}
                    disabled={state.isSubmitting}
                  >
                    <SelectTrigger id={`condition-${classification.id}`} className="w-[120px]">
                      <SelectValue placeholder="Condition" />
                    </SelectTrigger>
                    <SelectContent>
                      {conditionRatings.map(rating => (
                        <SelectItem key={rating.value} value={rating.value}>
                          {rating.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Select 
                    value={state.priorityRating} 
                    onValueChange={value => updateRatingState(classification.id, 'priorityRating', value)}
                    disabled={state.isSubmitting}
                  >
                    <SelectTrigger id={`priority-${classification.id}`} className="w-[120px]">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {priorityRatings.map(rating => (
                        <SelectItem key={rating.value} value={rating.value}>
                          {rating.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  {isAssessed ? (
                    <Badge className="bg-green-500">Assessed</Badge>
                  ) : (
                    <Badge variant="outline" className="border-amber-500 text-amber-500">Pending</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleQuickAssessment(classification)}
                      disabled={state.isSubmitting}
                    >
                      {state.isSubmitting ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : isAssessed ? (
                        <>Update</>
                      ) : (
                        <>Save</>
                      )}
                    </Button>
                    
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        if (isAssessed) {
                          onEditAssessment(assessment);
                        } else {
                          resetForm();
                          setSelectedNrmGroup(classification.nrmGroup);
                          setSelectedNrmSubElement(classification.nrmSubGroup);
                          setSelectedNrmAsset(classification.nrmElement);
                          setSelectedLocation(classification.locationId?.toString() || "");
                          setQuantity(classification.quantity || "1");
                          setUnit(classification.unit || "item");
                          setEditMode(false);
                          setCreateDialogOpen(true);
                        }
                      }}
                    >
                      Advanced
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

export default function ConditionAssessment({ projectId, auditType = "condition_survey" }: ConditionAssessmentProps) {
  const { toast } = useToast();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [nrm3Data, setNrm3Data] = useState<NRM3Category[]>([]);
  const [isLoadingNrm3, setIsLoadingNrm3] = useState(false);
  const [selectedNrmGroup, setSelectedNrmGroup] = useState<string>("");
  const [selectedNrmSubElement, setSelectedNrmSubElement] = useState<string>("");
  const [selectedNrmAsset, setSelectedNrmAsset] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("");
  const [unit, setUnit] = useState<string>("item");
  const [conditionRating, setConditionRating] = useState<string>("");
  const [priorityRating, setPriorityRating] = useState<string>("");
  const [observations, setObservations] = useState<string>("");
  const [recommendations, setRecommendations] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<number | null>(null);
  const [expandedClassifications, setExpandedClassifications] = useState<Record<number, boolean>>({});
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [fileInputRef, setFileInputRef] = useState<HTMLInputElement | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [currentPhotoAssessmentId, setCurrentPhotoAssessmentId] = useState<number | null>(null);

  // Load NRM3 classification data
  useEffect(() => {
    async function fetchNrm3Data() {
      setIsLoadingNrm3(true);
      try {
        const data = await loadNRM3ClassificationData();
        setNrm3Data(data);
      } catch (error) {
        console.error("Error loading NRM3 data:", error);
        toast({
          title: "Error",
          description: "Failed to load NRM3 classification data.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingNrm3(false);
      }
    }
    
    fetchNrm3Data();
  }, [toast]);

  // Reset form fields
  const resetForm = () => {
    setSelectedNrmGroup("");
    setSelectedNrmSubElement("");
    setSelectedNrmAsset("");
    setSelectedLocation("");
    setQuantity("1");
    setUnit("item");
    setConditionRating("");
    setPriorityRating("");
    setObservations("");
    setRecommendations("");
    setEditMode(false);
    setSelectedAssessmentId(null);
  };

  // Fetch project
  const { data: project, isLoading: isLoadingProject } = useQuery({
    queryKey: ["/api/rera/projects", projectId],
    queryFn: async () => {
      return await apiRequest(`/api/rera/projects/${projectId}`);
    }
  });

  // Fetch locations
  const { data: locations, isLoading: isLoadingLocations } = useQuery({
    queryKey: ["/api/rera/projects", projectId, "locations"],
    queryFn: async () => {
      try {
        return await apiRequest(`/api/rera/projects/${projectId}/locations`);
      } catch (error) {
        console.error("Error fetching locations:", error);
        return [];
      }
    }
  });

  // Fetch classifications
  const { data: classifications, isLoading: isLoadingClassifications } = useQuery({
    queryKey: ["/api/rera/projects", projectId, "classifications"],
    queryFn: async () => {
      try {
        return await apiRequest(`/api/rera/projects/${projectId}/classifications`);
      } catch (error) {
        console.error("Error fetching classifications:", error);
        return [];
      }
    }
  });

  // Fetch condition assessments
  const { data: assessments, isLoading: isLoadingAssessments } = useQuery({
    queryKey: ["/api/rera/projects", projectId, "condition-assessments"],
    queryFn: async () => {
      try {
        return await apiRequest(`/api/rera/projects/${projectId}/condition-assessments`);
      } catch (error) {
        console.error("Error fetching assessments:", error);
        return [];
      }
    }
  });

  // We no longer need to fetch lifecycle costs as they're calculated on-the-fly in the Reserve Fund Analysis component

  // Calculated metrics

  // Calculate overall condition score (0-100, where 100 is perfect)
  const calculateOverallCondition = () => {
    if (!assessments || assessments.length === 0) return 0;
    
    const conditionValues = {
      "A": 1.0, // Good
      "B": 0.7, // Satisfactory
      "C": 0.4, // Poor
      "D": 0.1  // Bad
    };
    
    let totalWeight = 0;
    let weightedScore = 0;
    
    assessments.forEach(assessment => {
      const classification = classifications?.find(c => c.id === assessment.classificationId);
      if (classification) {
        const weight = parseFloat(classification.quantity) || 1;
        const conditionValue = conditionValues[assessment.conditionRating] || 0.5;
        
        weightedScore += weight * conditionValue;
        totalWeight += weight;
      }
    });
    
    if (totalWeight === 0) return 0;
    return Math.round((weightedScore / totalWeight) * 100);
  };

  // Calculate priority distribution
  const calculatePriorityDistribution = () => {
    if (!assessments || assessments.length === 0) {
      return { urgent: 0, essential: 0, desirable: 0, longTerm: 0 };
    }
    
    const priorities = {
      urgent: 0,
      essential: 0,
      desirable: 0,
      longTerm: 0
    };
    
    assessments.forEach(assessment => {
      switch (assessment.priorityRating) {
        case "1":
          priorities.urgent++;
          break;
        case "2":
          priorities.essential++;
          break;
        case "3":
          priorities.desirable++;
          break;
        case "4":
          priorities.longTerm++;
          break;
      }
    });
    
    return priorities;
  };

  // Create assessment mutation
  const createAssessmentMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest(`/api/rera/projects/${projectId}/condition-assessments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rera/projects", projectId, "condition-assessments"] });
      toast({
        title: "Assessment created",
        description: "Condition assessment has been created successfully.",
      });
      setCreateDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      console.error("Error creating assessment:", error);
      toast({
        title: "Error",
        description: "Failed to create condition assessment. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Update assessment mutation
  const updateAssessmentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return await apiRequest(`/api/rera/projects/${projectId}/condition-assessments/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rera/projects", projectId, "condition-assessments"] });
      toast({
        title: "Assessment updated",
        description: "Condition assessment has been updated successfully.",
      });
      setCreateDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      console.error("Error updating assessment:", error);
      toast({
        title: "Error",
        description: "Failed to update condition assessment. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Handle assessment creation
  const handleCreateAssessment = async () => {
    // Validate form
    if (
      !selectedNrmGroup || 
      !selectedNrmSubElement || 
      !selectedNrmAsset || 
      !selectedLocation || 
      !conditionRating || 
      !priorityRating
    ) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    setIsCreating(true);
    
    try {
      // First, check if a classification for this asset already exists
      let classificationId;
      const existingClassification = classifications?.find(
        c => c.nrmElement === selectedNrmAsset && c.locationId === parseInt(selectedLocation)
      );
      
      if (existingClassification) {
        classificationId = existingClassification.id;
      } else {
        // Create a new classification
        const asset = findNrmAssetByCode(nrm3Data, selectedNrmAsset);
        const classificationResponse = await apiRequest(`/api/rera/projects/${projectId}/classifications`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            projectId,
            locationId: selectedLocation === "general" ? null : parseInt(selectedLocation),
            nrmGroup: selectedNrmGroup,
            nrmSubGroup: selectedNrmSubElement,
            nrmElement: selectedNrmAsset,
            description: asset?.name || selectedNrmAsset,
            quantity: quantity || "1",
            unit: unit || "item",
          }),
        });
        
        classificationId = classificationResponse.id;
      }
      
      // Then create the assessment
      await createAssessmentMutation.mutateAsync({
        projectId,
        classificationId,
        conditionRating,
        priorityRating,
        observations: observations || null,
        recommendations: recommendations || null,
      });
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/rera/projects", projectId, "classifications"] });
    } catch (error) {
      console.error("Error in assessment creation flow:", error);
      toast({
        title: "Error",
        description: "Failed to create assessment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Handle assessment update
  const handleUpdateAssessment = async () => {
    if (!selectedAssessmentId || !conditionRating || !priorityRating) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    setIsCreating(true);
    
    try {
      await updateAssessmentMutation.mutateAsync({
        id: selectedAssessmentId,
        data: {
          conditionRating,
          priorityRating,
          observations: observations || null,
          recommendations: recommendations || null,
        }
      });
    } catch (error) {
      console.error("Error updating assessment:", error);
    } finally {
      setIsCreating(false);
    }
  };

  // Handle edit assessment
  const handleEditAssessment = (assessment: any) => {
    setEditMode(true);
    setSelectedAssessmentId(assessment.id);
    
    // Find the classification for this assessment
    const classification = classifications?.find(c => c.id === assessment.classificationId);
    
    if (classification) {
      setSelectedNrmGroup(classification.nrmGroup);
      setSelectedNrmSubElement(classification.nrmSubGroup);
      setSelectedNrmAsset(classification.nrmElement);
      setSelectedLocation(classification.locationId?.toString() || "general");
      setQuantity(classification.quantity || "1");
      setUnit(classification.unit || "item");
    }
    
    setConditionRating(assessment.conditionRating);
    setPriorityRating(assessment.priorityRating);
    setObservations(assessment.observations || "");
    setRecommendations(assessment.recommendations || "");
    
    setCreateDialogOpen(true);
  };

  // Handle file selection for photo upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(filesArray);
    }
  };

  // Handle photo upload
  const handleUploadPhotos = async () => {
    if (!selectedFiles.length || !currentPhotoAssessmentId) return;
    
    setUploadingPhotos(true);
    
    try {
      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('photos', file);
      });
      
      await apiRequest(`/api/rera/projects/${projectId}/condition-assessments/${currentPhotoAssessmentId}/photos`, {
        method: "POST",
        body: formData,
      });
      
      toast({
        title: "Photos uploaded",
        description: `${selectedFiles.length} photos have been uploaded successfully.`,
      });
      
      setUploadDialogOpen(false);
      setSelectedFiles([]);
      
      // Refresh assessment data to show uploaded photos
      queryClient.invalidateQueries({ queryKey: ["/api/rera/projects", projectId, "condition-assessments"] });
    } catch (error) {
      console.error("Error uploading photos:", error);
      toast({
        title: "Error",
        description: "Failed to upload photos. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingPhotos(false);
    }
  };

  // Show loading state while fetching data
  const isLoading = isLoadingLocations || isLoadingClassifications || isLoadingAssessments || isLoadingNrm3 || isLoadingProject;
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Calculate metrics
  const conditionScore = calculateOverallCondition();
  const priorityDistribution = calculatePriorityDistribution();
  
  // Count the number of classifications with assessments
  const assessedCount = assessments?.length || 0;
  const totalClassifications = classifications?.length || 0;
  const assessmentCompletionPercentage = totalClassifications ? Math.round((assessedCount / totalClassifications) * 100) : 0;

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Asset Condition Registry</CardTitle>
          <CardDescription>
            Assess the condition and priority of building components according to NRM3 classification
          </CardDescription>
        </CardHeader>
        <CardContent>
          {classifications && classifications.length > 0 ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="py-1 px-3">
                    {assessedCount} of {totalClassifications} assets assessed
                  </Badge>
                  
                  <div className="w-48 flex items-center space-x-2">
                    <Progress value={assessmentCompletionPercentage} className="h-2" />
                    <span className="text-xs">{assessmentCompletionPercentage}%</span>
                  </div>
                  
                  {assessedCount > 0 && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center space-x-2 ml-3">
                            <Badge className={`py-1 px-3 ${
                              conditionScore >= 90 ? 'bg-green-100 text-green-800 hover:bg-green-100' : 
                              conditionScore >= 70 ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' : 
                              conditionScore >= 50 ? 'bg-amber-100 text-amber-800 hover:bg-amber-100' : 
                              'bg-red-100 text-red-800 hover:bg-red-100'
                            }`}>
                              <Activity className="h-3.5 w-3.5 mr-1" />
                              Overall Score: {conditionScore}
                            </Badge>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                          <div className="space-y-1">
                            <p className="text-xs font-medium">Asset Condition Score</p>
                            <p className="text-xs">Scale: 0-100, where 100 is perfect condition</p>
                            <p className="text-xs text-muted-foreground">
                              Based on weighted average of all assessments
                            </p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
                
                <Button
                  onClick={() => {
                    resetForm();
                    setCreateDialogOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Assessment
                </Button>
              </div>
              
              <AssetRegistryTable 
                classifications={classifications} 
                assessments={assessments} 
                locations={locations}
                projectId={projectId}
                conditionRatings={conditionRatings}
                priorityRatings={priorityRatings}
                onEditAssessment={handleEditAssessment}
                resetForm={resetForm}
                setSelectedNrmGroup={setSelectedNrmGroup}
                setSelectedNrmSubElement={setSelectedNrmSubElement}
                setSelectedNrmAsset={setSelectedNrmAsset}
                setSelectedLocation={setSelectedLocation}
                setQuantity={setQuantity}
                setUnit={setUnit}
                setEditMode={setEditMode}
                setCreateDialogOpen={setCreateDialogOpen}
                auditType={auditType}
                nrm3Data={nrm3Data}
              />
              
              {/* Reserve Fund Analysis - Only shown for reserve fund study projects */}
              {auditType === "reserve_fund_study" && (
                <div className="mt-8 border rounded-lg p-6 bg-card">
                  <h3 className="text-xl font-semibold mb-4">Reserve Fund Analysis</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Calculate the funding requirements for long-term capital expenditures based on asset conditions
                  </p>
                  
                  <Suspense fallback={<div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
                    <ReserveFundAnalysis 
                      projectId={projectId} 
                      classifications={classifications} 
                      assessments={assessments}
                    />
                  </Suspense>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No assets to assess</h3>
              <p className="text-muted-foreground mb-6">
                Start by adding assets to the project using the NRM3 Framework tab
              </p>
              <Button
                onClick={() => {
                  resetForm();
                  setCreateDialogOpen(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Assessment
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Assessment Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{editMode ? "Edit Assessment" : "Add Condition Assessment"}</DialogTitle>
            <DialogDescription>
              {editMode 
                ? "Update the condition assessment for this asset" 
                : "Assess the condition of a building asset according to NRM3 framework"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            {/* Left Column - Asset Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Asset Information</h3>
              <Separator />
              
              {/* Existing Classifications Section - Only show if classifications exist */}
              {!editMode && classifications && classifications.length > 0 && (
                <div className="space-y-2 mb-6">
                  <Label htmlFor="existingClassification">Use Existing Classification</Label>
                  <Select
                    onValueChange={(value) => {
                      const classification = classifications.find((c: any) => c.id === parseInt(value));
                      if (classification) {
                        setSelectedNrmGroup(classification.nrmGroup);
                        setSelectedNrmSubElement(classification.nrmSubGroup);
                        setSelectedNrmAsset(classification.nrmElement);
                        setSelectedLocation(classification.locationId?.toString() || "");
                        setQuantity(classification.quantity || "1");
                        setUnit(classification.unit || "item");
                      }
                    }}
                  >
                    <SelectTrigger id="existingClassification">
                      <SelectValue placeholder="Select existing asset" />
                    </SelectTrigger>
                    <SelectContent>
                      {classifications.map((classification: any) => (
                        <SelectItem key={classification.id} value={classification.id.toString()}>
                          {classification.description} ({classification.nrmElement})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="text-xs text-muted-foreground mt-1">
                    Select an existing asset classification or create a new one below
                  </div>
                </div>
              )}
              
              {/* NRM Group selection */}
              <div className="space-y-2">
                <Label htmlFor="nrmGroup">
                  NRM Group 
                  {!editMode && <span className="text-destructive ml-1">*</span>}
                </Label>
                <Select 
                  value={selectedNrmGroup} 
                  onValueChange={(value) => {
                    setSelectedNrmGroup(value);
                    setSelectedNrmSubElement("");
                    setSelectedNrmAsset("");
                  }}
                  disabled={editMode}
                >
                  <SelectTrigger id="nrmGroup">
                    <SelectValue placeholder="Select NRM group" />
                  </SelectTrigger>
                  <SelectContent>
                    {nrm3Data.map(group => (
                      <SelectItem key={group.code} value={group.code}>
                        {group.code}. {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Sub-Element selection - only enabled if a group is selected */}
              <div className="space-y-2">
                <Label htmlFor="nrmSubElement">
                  Sub-Element
                  {!editMode && <span className="text-destructive ml-1">*</span>}
                </Label>
                <Select 
                  value={selectedNrmSubElement} 
                  onValueChange={(value) => {
                    setSelectedNrmSubElement(value);
                    setSelectedNrmAsset("");
                  }}
                  disabled={!selectedNrmGroup || editMode}
                >
                  <SelectTrigger id="nrmSubElement">
                    <SelectValue placeholder="Select sub-element" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedNrmGroup && nrm3Data
                      .find(group => group.code === selectedNrmGroup)
                      ?.subCategories.map(subElement => (
                        <SelectItem key={subElement.code} value={subElement.code}>
                          {subElement.code}. {subElement.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Asset selection - only enabled if a sub-element is selected */}
              <div className="space-y-2">
                <Label htmlFor="nrmAsset">
                  Asset
                  {!editMode && <span className="text-destructive ml-1">*</span>}
                </Label>
                <Select 
                  value={selectedNrmAsset} 
                  onValueChange={setSelectedNrmAsset}
                  disabled={!selectedNrmSubElement || editMode}
                >
                  <SelectTrigger id="nrmAsset">
                    <SelectValue placeholder="Select asset" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedNrmGroup && selectedNrmSubElement && nrm3Data
                      .find(group => group.code === selectedNrmGroup)
                      ?.subCategories.find(sub => sub.code === selectedNrmSubElement)
                      ?.assets.map(asset => (
                        <SelectItem key={asset.code} value={asset.code}>
                          {asset.code}. {asset.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Location selection */}
              <div className="space-y-2">
                <Label htmlFor="location">
                  Location
                  {!editMode && <span className="text-destructive ml-1">*</span>}
                </Label>
                <Select 
                  value={selectedLocation} 
                  onValueChange={setSelectedLocation}
                  disabled={editMode}
                >
                  <SelectTrigger id="location">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General / Whole Building</SelectItem>
                    {locations && Array.isArray(locations) && locations.map((location: any) => (
                      <SelectItem key={location.id} value={location.id.toString()}>
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Quantity and Unit */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    placeholder="e.g., 5"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    disabled={editMode}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Select 
                    value={unit} 
                    onValueChange={setUnit}
                    disabled={editMode}
                  >
                    <SelectTrigger id="unit">
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {unitOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            {/* Right Column - Condition Assessment */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Condition Assessment</h3>
              <Separator />
              
              {/* Condition Rating */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Label htmlFor="conditionRating">
                    Condition Rating
                    <span className="text-destructive ml-1">*</span>
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <InfoIcon className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent className="w-80">
                        <ul className="text-xs space-y-1">
                          {conditionRatings.map(rating => (
                            <li key={rating.value}>
                              <strong>{rating.label}</strong>: {rating.description}
                            </li>
                          ))}
                        </ul>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Select 
                  value={conditionRating} 
                  onValueChange={setConditionRating}
                >
                  <SelectTrigger id="conditionRating">
                    <SelectValue placeholder="Select condition rating" />
                  </SelectTrigger>
                  <SelectContent>
                    {conditionRatings.map(rating => (
                      <SelectItem key={rating.value} value={rating.value}>
                        {rating.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Priority Rating */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Label htmlFor="priorityRating">
                    Priority Rating
                    <span className="text-destructive ml-1">*</span>
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <InfoIcon className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent className="w-80">
                        <ul className="text-xs space-y-1">
                          {priorityRatings.map(rating => (
                            <li key={rating.value}>
                              <strong>{rating.label}</strong>: {rating.description}
                            </li>
                          ))}
                        </ul>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Select 
                  value={priorityRating} 
                  onValueChange={setPriorityRating}
                >
                  <SelectTrigger id="priorityRating">
                    <SelectValue placeholder="Select priority rating" />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityRatings.map(rating => (
                      <SelectItem key={rating.value} value={rating.value}>
                        {rating.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Observations */}
              <div className="space-y-2">
                <Label htmlFor="observations">Observations</Label>
                <Textarea
                  id="observations"
                  placeholder="Describe the current condition and any issues observed..."
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  rows={3}
                />
              </div>
              
              {/* Recommendations */}
              <div className="space-y-2">
                <Label htmlFor="recommendations">Recommendations</Label>
                <Textarea
                  id="recommendations"
                  placeholder="Recommended actions to address any issues..."
                  value={recommendations}
                  onChange={(e) => setRecommendations(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setCreateDialogOpen(false)} 
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button 
              onClick={editMode ? handleUpdateAssessment : handleCreateAssessment} 
              disabled={isCreating}
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {editMode ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  {editMode ? "Update Assessment" : "Create Assessment"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Photos Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Photos</DialogTitle>
            <DialogDescription>
              Upload photos related to this condition assessment
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="border-2 border-dashed rounded-md p-6 text-center">
              <Button 
                variant="outline" 
                className="mb-2"
                onClick={() => fileInputRef?.click()}
              >
                <ImagePlus className="mr-2 h-4 w-4" /> 
                Select Photos
              </Button>
              <input 
                type="file" 
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
                ref={(ref) => setFileInputRef(ref)}
              />
              <p className="text-sm text-muted-foreground">
                Drag and drop or click to select photos. Maximum 5MB per image.
              </p>
            </div>
            
            {selectedFiles.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Selected Files ({selectedFiles.length})</h4>
                <div className="max-h-40 overflow-y-auto">
                  <ul className="space-y-1">
                    {selectedFiles.map((file, index) => (
                      <li key={index} className="text-sm flex items-center justify-between">
                        <span className="truncate max-w-[200px]">{file.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {Math.round(file.size / 1024)} KB
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setUploadDialogOpen(false);
                setSelectedFiles([]);
              }}
              disabled={uploadingPhotos}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUploadPhotos}
              disabled={selectedFiles.length === 0 || uploadingPhotos}
            >
              {uploadingPhotos ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Camera className="mr-2 h-4 w-4" />
                  Upload Photos
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}