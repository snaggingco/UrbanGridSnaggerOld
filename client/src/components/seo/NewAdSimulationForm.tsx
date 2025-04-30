import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const adSimulationFormSchema = z.object({
  keyword: z.string().min(1, "Keyword is required"),
});

type AdSimulationFormValues = z.infer<typeof adSimulationFormSchema>;

interface NewAdSimulationFormProps {
  onClose: () => void;
}

export default function NewAdSimulationForm({ onClose }: NewAdSimulationFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<AdSimulationFormValues>({
    resolver: zodResolver(adSimulationFormSchema),
    defaultValues: {
      keyword: "",
    },
  });
  
  const createSimulation = useMutation({
    mutationFn: async (data: AdSimulationFormValues & { createdBy: string }) => {
      return apiRequest("/api/seo-intelligence/ad-simulations", {
        method: "POST",
        body: data,  // Changed from 'data' to 'body' to match other components
      });
    },
    onSuccess: () => {
      toast({
        title: "Simulation created",
        description: "Your ad simulation has been created and is ready to run.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/seo-intelligence/ad-simulations'] });
      onClose();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was an error creating your simulation. Please try again.",
      });
    },
  });
  
  const onSubmit = (data: AdSimulationFormValues) => {
    // Get the username from localStorage or use a default if not available
    const username = localStorage.getItem("username") || "admin";
    
    // Add createdBy field to the data
    const completeData = {
      ...data,
      createdBy: username
    };
    
    console.log("Submitting ad simulation with complete data:", completeData);
    createSimulation.mutate(completeData);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="keyword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Keyword to simulate</FormLabel>
              <FormControl>
                <Input 
                  placeholder="e.g., property inspection dubai" 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Enter the search keyword you want to analyze
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={createSimulation.isPending}>
            {createSimulation.isPending ? "Creating..." : "Create Simulation"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}