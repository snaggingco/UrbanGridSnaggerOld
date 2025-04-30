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
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SeoCompetitorAnalysis } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

const recommendationFormSchema = z.object({
  analysisId: z.string().min(1, "Analysis is required"),
  category: z.string().min(1, "Category is required"),
  priority: z.string().min(1, "Priority is required"),
  recommendation: z.string().min(5, "Recommendation must be at least 5 characters"),
  impact: z.string().min(5, "Impact must be at least 5 characters"),
});

type RecommendationFormValues = z.infer<typeof recommendationFormSchema>;

interface NewRecommendationFormProps {
  onClose: () => void;
  analyses: SeoCompetitorAnalysis[];
}

export default function NewRecommendationForm({ onClose, analyses }: NewRecommendationFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<RecommendationFormValues>({
    resolver: zodResolver(recommendationFormSchema),
    defaultValues: {
      analysisId: "",
      category: "",
      priority: "",
      recommendation: "",
      impact: "",
    },
  });
  
  const createRecommendation = useMutation({
    mutationFn: async (data: RecommendationFormValues) => {
      return apiRequest("/api/seo-intelligence/recommendations", {
        method: "POST",
        data: {
          ...data,
          analysisId: parseInt(data.analysisId),
        },
      });
    },
    onSuccess: () => {
      toast({
        title: "Recommendation created",
        description: "Your SEO recommendation has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/seo-intelligence/recommendations'] });
      onClose();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was an error creating your recommendation. Please try again.",
      });
    },
  });
  
  const onSubmit = (data: RecommendationFormValues) => {
    createRecommendation.mutate(data);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="analysisId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Analysis</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an analysis" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {analyses.map((analysis) => (
                    <SelectItem key={analysis.id} value={analysis.id.toString()}>
                      {analysis.targetDomain.replace(/(^\w+:|^)\/\//, '')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Select the analysis this recommendation belongs to
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="keywords">Keywords</SelectItem>
                    <SelectItem value="on-page">On-Page</SelectItem>
                    <SelectItem value="off-page">Off-Page</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="content">Content</SelectItem>
                    <SelectItem value="backlinks">Backlinks</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="recommendation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Recommendation</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add more target keywords focused on specific Dubai neighborhoods"
                  className="min-h-[80px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Provide a clear, actionable recommendation
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="impact"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expected Impact</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Higher local search visibility in specific areas"
                  className="min-h-[80px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Describe what positive impact this change will have
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={createRecommendation.isPending}>
            {createRecommendation.isPending ? "Creating..." : "Create Recommendation"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}