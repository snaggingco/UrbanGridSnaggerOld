import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Info, Scale3dIcon, PlusCircle, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Types
interface Entity {
  id: number;
  name: string;
  type: string;
  suitArea: string;
  balconyArea?: string;
  sellableArea?: string;
  applicableArea?: string;
  dedicatedCommonArea?: string;
  parkingBayArea?: string;
  totalComponentArea?: string;
  proportionalShare?: string;
  color?: string;
}

interface SharedArea {
  id: number;
  name: string;
  type: string;
  area: string;
  description: string | null;
}

interface SharedAreaManagementFormProps {
  onSubmit: (data: any, beneficiaries: number[]) => void;
  editSharedArea: SharedArea | null;
  entities: Entity[];
  unitType: 'sqm' | 'sqft';
  onCancel: () => void;
}

// Form validation schema
const sharedAreaSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  type: z.enum(["principal_common", "common_element"], {
    required_error: "Please select a type."
  }),
  area: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
    message: "Area must be a valid positive number.",
  }),
  description: z.string().optional(),
});

const SharedAreaManagementForm: React.FC<SharedAreaManagementFormProps> = ({
  onSubmit,
  editSharedArea,
  entities,
  unitType,
  onCancel,
}) => {
  // State for tracking selected beneficiary entities
  const [selectedEntities, setSelectedEntities] = useState<number[]>([]);
  const [sharedAreaType, setSharedAreaType] = useState<string>(editSharedArea?.type || "principal_common");

  // Initialize form with default values
  const form = useForm<z.infer<typeof sharedAreaSchema>>({
    resolver: zodResolver(sharedAreaSchema),
    defaultValues: {
      name: editSharedArea?.name || "",
      type: (editSharedArea?.type as any) || "principal_common",
      area: editSharedArea?.area || "0",
      description: editSharedArea?.description || "",
    },
  });

  // Watch for type changes
  const currentType = form.watch("type");
  
  // Update selected entities when type changes
  React.useEffect(() => {
    if (currentType === "principal_common") {
      // For principal common areas, all entities are beneficiaries
      setSelectedEntities(entities.map(entity => entity.id));
      setSharedAreaType("principal_common");
    } else if (currentType === "common_element" && sharedAreaType !== "common_element") {
      // For common element areas, no entities are beneficiaries initially
      setSelectedEntities([]);
      setSharedAreaType("common_element");
    }
  }, [currentType, entities, sharedAreaType]);

  // Toggle entity selection
  const toggleEntity = (entityId: number) => {
    if (currentType === "common_element") {
      setSelectedEntities(prev => 
        prev.includes(entityId)
          ? prev.filter(id => id !== entityId)
          : [...prev, entityId]
      );
    }
  };

  // Handle form submission
  const onFormSubmit = (values: z.infer<typeof sharedAreaSchema>) => {
    // For principal common areas, all entities should be selected
    const beneficiaries = values.type === "principal_common"
      ? entities.map(entity => entity.id)
      : selectedEntities;
    
    onSubmit(values, beneficiaries);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          {/* Basic Shared Area Information */}
          <div>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Shared Area Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Main Lobby" {...field} />
                  </FormControl>
                  <FormDescription>
                    Provide a descriptive name for this shared area
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="area"
              render={({ field }) => (
                <FormItem className="mt-4">
                  <FormLabel>Area Size ({unitType})</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" step="0.01" {...field} />
                  </FormControl>
                  <FormDescription>
                    The total area of this shared space
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div>
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Area Type</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="principal_common">
                        <div className="flex items-center">
                          <Scale3dIcon className="mr-2 h-4 w-4" />
                          <span>Principal Common Area</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="common_element">
                        <div className="flex items-center">
                          <Scale3dIcon className="mr-2 h-4 w-4" />
                          <span>Common Element Area</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {field.value === "principal_common" ? (
                      <span>Allocated to all entities based on their proportional share</span>
                    ) : (
                      <span>Allocated only to selected entities</span>
                    )}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="mt-4">
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Briefly describe this shared area"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional additional details about this area
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator />

        {/* Beneficiary Selection Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-medium">Beneficiary Entities</h3>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Info className="h-3.5 w-3.5 mr-1" />
                    <span>About beneficiaries</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-sm">
                  <p>
                    Principal Common Areas benefit all entities automatically based on 
                    their sellable area ratio. For Common Element Areas, you must 
                    select which entities benefit from this area.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {currentType === "principal_common" ? (
            <Alert className="mb-4 bg-blue-50 text-blue-800 border-blue-200">
              <Info className="h-4 w-4" />
              <AlertTitle>Principal Common Area</AlertTitle>
              <AlertDescription>
                This area is automatically allocated to all entities 
                proportionally to their sellable area.
              </AlertDescription>
            </Alert>
          ) : (
            <div>
              <p className="text-sm text-muted-foreground mb-3">
                Select the entities that have access to this common element area:
              </p>
              
              <ScrollArea className="h-[200px] border rounded-md p-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">Select</TableHead>
                      <TableHead>Entity</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Area ({unitType})</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entities.map((entity) => (
                      <TableRow 
                        key={entity.id}
                        className={selectedEntities.includes(entity.id) ? "bg-slate-50" : ""}
                      >
                        <TableCell>
                          <Checkbox
                            checked={selectedEntities.includes(entity.id)}
                            onCheckedChange={() => toggleEntity(entity.id)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{entity.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {entity.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{entity.suitArea}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
              
              {entities.length > 0 && (
                <div className="mt-2 flex justify-between text-sm">
                  <span>
                    {selectedEntities.length} of {entities.length} entities selected
                  </span>
                  
                  {currentType === "common_element" && (
                    <div className="space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedEntities(entities.map(e => e.id))}
                      >
                        Select All
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedEntities([])}
                      >
                        Clear All
                      </Button>
                    </div>
                  )}
                </div>
              )}
              
              {currentType === "common_element" && selectedEntities.length === 0 && (
                <Alert className="mt-4 bg-amber-50 text-amber-800 border-amber-200">
                  <Info className="h-4 w-4" />
                  <AlertTitle>No Entities Selected</AlertTitle>
                  <AlertDescription>
                    Please select at least one entity that benefits from this common element area.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={currentType === "common_element" && selectedEntities.length === 0}
          >
            {editSharedArea ? "Update Shared Area" : "Add Shared Area"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default SharedAreaManagementForm;