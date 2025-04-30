import React from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, Building, Home, LandmarkIcon, ShoppingBag, Briefcase, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

// Entity Types
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

interface EntityManagementFormProps {
  onSubmit: (data: any) => void;
  editEntity: Entity | null;
  unitType: 'sqm' | 'sqft';
  onCancel: () => void;
}

// Form schema with validation
const entityFormSchema = z.object({
  name: z.string().min(2, {
    message: "Entity name must be at least 2 characters.",
  }),
  type: z.enum(["residential", "retail", "office", "hotel", "other"], {
    required_error: "Please select an entity type.",
  }),
  // Input mode allows direct entry of both measurements
  inputMode: z.enum(["standard", "advanced"], {
    required_error: "Please select an input mode."
  }),
  // Standard inputs
  suitArea: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
    message: "Suit area must be a valid positive number.",
  }),
  balconyArea: z.string().optional().transform(val => val || "0"),
  parkingBayArea: z.string().optional().transform(val => val || "0"),
  dedicatedCommonArea: z.string().optional().transform(val => val || "0"),
  // Advanced inputs
  sellableArea: z.string().optional().transform(val => val || "0"),
  applicableArea: z.string().optional().transform(val => val || "0"),
  totalComponentArea: z.string().optional().transform(val => val || "0"),
});

const EntityManagementForm: React.FC<EntityManagementFormProps> = ({
  onSubmit,
  editEntity,
  unitType,
  onCancel,
}) => {
  // Initialize form with default values
  const form = useForm<z.infer<typeof entityFormSchema>>({
    resolver: zodResolver(entityFormSchema),
    defaultValues: {
      name: editEntity?.name || "",
      type: (editEntity?.type as any) || "residential",
      inputMode: "standard",
      suitArea: editEntity?.suitArea || "0",
      balconyArea: editEntity?.balconyArea || "0",
      parkingBayArea: editEntity?.parkingBayArea || "0",
      dedicatedCommonArea: editEntity?.dedicatedCommonArea || "0",
      sellableArea: editEntity?.sellableArea || "0",
      applicableArea: editEntity?.applicableArea || "0",
      totalComponentArea: editEntity?.totalComponentArea || "0",
    },
  });

  const inputMode = form.watch("inputMode");
  const suitArea = form.watch("suitArea");
  const balconyArea = form.watch("balconyArea");
  const dedicatedCommonArea = form.watch("dedicatedCommonArea");

  // Calculate derived fields based on input values
  React.useEffect(() => {
    if (inputMode === "standard") {
      const calculatedSellableArea = (
        parseFloat(suitArea || "0") +
        parseFloat(balconyArea || "0")
      ).toString();
      
      const calculatedApplicableArea = (
        parseFloat(suitArea || "0") +
        (parseFloat(balconyArea || "0") * 0.25)
      ).toString();
      
      form.setValue("sellableArea", calculatedSellableArea);
      form.setValue("applicableArea", calculatedApplicableArea);
    }
  }, [inputMode, suitArea, balconyArea, dedicatedCommonArea, form]);

  // Handle form submission
  const onFormSubmit = (values: z.infer<typeof entityFormSchema>) => {
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          {/* Basic Entity Information */}
          <div>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Entity Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Residential Tower" {...field} />
                  </FormControl>
                  <FormDescription>
                    Provide a clear name for this entity
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="mt-4">
                  <FormLabel>Entity Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select entity type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="residential">
                        <div className="flex items-center">
                          <Home className="mr-2 h-4 w-4" />
                          <span>Residential</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="retail">
                        <div className="flex items-center">
                          <ShoppingBag className="mr-2 h-4 w-4" />
                          <span>Retail</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="office">
                        <div className="flex items-center">
                          <Briefcase className="mr-2 h-4 w-4" />
                          <span>Office</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="hotel">
                        <div className="flex items-center">
                          <LandmarkIcon className="mr-2 h-4 w-4" />
                          <span>Hotel</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="other">
                        <div className="flex items-center">
                          <Building className="mr-2 h-4 w-4" />
                          <span>Other</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    The category this entity belongs to
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Input Mode Selection */}
          <div>
            <FormField
              control={form.control}
              name="inputMode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Input Mode</FormLabel>
                  <Tabs
                    value={field.value}
                    onValueChange={field.onChange}
                    className="w-full"
                  >
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="standard">Standard</TabsTrigger>
                      <TabsTrigger value="advanced">Advanced</TabsTrigger>
                    </TabsList>
                    <TabsContent value="standard" className="mt-2">
                      <Card>
                        <CardContent className="pt-4">
                          <p className="text-sm text-muted-foreground">
                            Standard mode lets you input basic measurements. 
                            Sellable and applicable areas will be calculated automatically.
                          </p>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    <TabsContent value="advanced" className="mt-2">
                      <Card>
                        <CardContent className="pt-4">
                          <p className="text-sm text-muted-foreground">
                            Advanced mode allows direct input of sellable and applicable areas
                            instead of having them calculated.
                          </p>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator />

        {/* Standard Mode Fields */}
        <div className={cn("grid grid-cols-2 gap-6", inputMode === "standard" ? "" : "hidden")}>
          <div>
            <FormField
              control={form.control}
              name="suitArea"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Suit Area ({unitType})</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" step="0.01" {...field} />
                  </FormControl>
                  <FormDescription>
                    The primary interior area of the entity
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="balconyArea"
              render={({ field }) => (
                <FormItem className="mt-4">
                  <FormLabel>Balcony Area ({unitType})</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" step="0.01" {...field} />
                  </FormControl>
                  <FormDescription>
                    Any balcony or exterior spaces
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div>
            <FormField
              control={form.control}
              name="parkingBayArea"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parking Bay Area ({unitType})</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" step="0.01" {...field} />
                  </FormControl>
                  <FormDescription>
                    Any dedicated parking spaces
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dedicatedCommonArea"
              render={({ field }) => (
                <FormItem className="mt-4">
                  <FormLabel>Dedicated Common Area ({unitType})</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" step="0.01" {...field} />
                  </FormControl>
                  <FormDescription>
                    Common areas exclusive to this entity
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Advanced Mode Fields */}
        <div className={cn("grid grid-cols-2 gap-6", inputMode === "advanced" ? "" : "hidden")}>
          <div>
            <FormField
              control={form.control}
              name="sellableArea"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sellable Area ({unitType})</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" step="0.01" {...field} />
                  </FormControl>
                  <FormDescription>
                    Total sellable area (suit + balcony)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="applicableArea"
              render={({ field }) => (
                <FormItem className="mt-4">
                  <FormLabel>Applicable Area ({unitType})</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" step="0.01" {...field} />
                  </FormControl>
                  <FormDescription>
                    Suit area plus 25% of balcony area
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div>
            <FormField
              control={form.control}
              name="parkingBayArea"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parking Bay Area ({unitType})</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" step="0.01" {...field} />
                  </FormControl>
                  <FormDescription>
                    Any dedicated parking spaces
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="totalComponentArea"
              render={({ field }) => (
                <FormItem className="mt-4">
                  <FormLabel>Total Component Area ({unitType})</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" step="0.01" {...field} />
                  </FormControl>
                  <FormDescription>
                    Optional: manually specify the total component area
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Automatically Calculated Fields (Display Only) */}
        {inputMode === "standard" && (
          <div className="bg-slate-50 p-4 rounded-md border">
            <h3 className="text-sm font-medium mb-2">Calculated Values</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Sellable Area ({unitType})</p>
                <p className="text-sm font-medium">{parseFloat(form.getValues("sellableArea") || "0").toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Applicable Area ({unitType})</p>
                <p className="text-sm font-medium">{parseFloat(form.getValues("applicableArea") || "0").toFixed(2)}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {editEntity ? "Update Entity" : "Add Entity"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default EntityManagementForm;