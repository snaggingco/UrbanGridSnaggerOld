import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const analysisFormSchema = z.object({
  targetDomain: z.string()
    .url({ message: "Please enter a valid URL (e.g., https://example.com)" })
    .min(1, "Target domain is required"),
  competitorDomains: z.array(
    z.string().url({ message: "Please enter a valid URL (e.g., https://example.com)" })
  ),
  keywords: z.array(z.string().min(1, "Keyword cannot be empty")),
});

type AnalysisFormValues = z.infer<typeof analysisFormSchema>;

interface NewAnalysisFormProps {
  onClose: () => void;
}

export default function NewAnalysisForm({ onClose }: NewAnalysisFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newCompetitor, setNewCompetitor] = useState("");
  const [newKeyword, setNewKeyword] = useState("");
  
  const form = useForm<AnalysisFormValues>({
    resolver: zodResolver(analysisFormSchema),
    defaultValues: {
      targetDomain: "",
      competitorDomains: [],
      keywords: [],
    },
  });
  
  const createAnalysis = useMutation({
    mutationFn: async (data: AnalysisFormValues) => {
      // Log the form data to understand what values we're getting
      console.log("Form data values:", data);
      
      const requestData = {
        ...data,
        status: "pending",
        createdBy: "admin" // Hardcoding for now since we have authentication issues
      };
      
      // Log the final request payload
      console.log("Sending request payload:", requestData);
      
      return apiRequest("/api/seo-intelligence/competitor-analysis", {
        method: "POST",
        body: requestData,
      });
    },
    onSuccess: (response) => {
      console.log("Analysis creation success response:", response);
      toast({
        title: "Analysis created",
        description: "Your competitor analysis has been created and is now processing.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/seo-intelligence/competitor-analysis'] });
      onClose();
    },
    onError: (error) => {
      console.error("Analysis creation error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was an error creating your analysis. Please try again.",
      });
    },
  });
  
  const onSubmit = (data: AnalysisFormValues) => {
    // Get the username from localStorage or use a default if not available
    const username = localStorage.getItem("username") || "admin";
    
    // Add createdBy field to the data
    const completeData = {
      ...data,
      createdBy: username
    };
    
    console.log("Submitting with complete data:", completeData);
    createAnalysis.mutate(completeData);
  };
  
  const addCompetitor = () => {
    if (!newCompetitor) return;
    
    try {
      // Validate URL format
      const url = new URL(newCompetitor);
      
      // Add protocol if missing
      let formattedUrl = newCompetitor;
      if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
        formattedUrl = `https://${formattedUrl}`;
      }
      
      const currentCompetitors = form.getValues().competitorDomains;
      form.setValue("competitorDomains", [...currentCompetitors, formattedUrl]);
      setNewCompetitor("");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Invalid URL",
        description: "Please enter a valid URL (e.g., https://example.com)",
      });
    }
  };
  
  const removeCompetitor = (index: number) => {
    const currentCompetitors = form.getValues().competitorDomains;
    form.setValue(
      "competitorDomains", 
      currentCompetitors.filter((_, i) => i !== index)
    );
  };
  
  const addKeyword = () => {
    if (!newKeyword) return;
    
    const currentKeywords = form.getValues().keywords;
    form.setValue("keywords", [...currentKeywords, newKeyword]);
    setNewKeyword("");
  };
  
  const removeKeyword = (index: number) => {
    const currentKeywords = form.getValues().keywords;
    form.setValue(
      "keywords", 
      currentKeywords.filter((_, i) => i !== index)
    );
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="targetDomain"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Website</FormLabel>
              <FormControl>
                <Input 
                  placeholder="https://yourwebsite.com" 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Enter the full URL of your website
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div>
          <Label>Competitor Websites</Label>
          <div className="flex mt-2">
            <Input
              placeholder="https://competitor.com"
              value={newCompetitor}
              onChange={(e) => setNewCompetitor(e.target.value)}
              className="flex-1 mr-2"
            />
            <Button 
              type="button" 
              onClick={addCompetitor}
              variant="secondary"
            >
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Add up to 5 competitor websites to compare against
          </p>
          
          <div className="mt-3 space-y-2">
            {form.watch("competitorDomains").map((domain, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md">
                <span className="text-sm truncate flex-1">{domain}</span>
                <Button 
                  type="button"
                  variant="ghost" 
                  size="sm"
                  onClick={() => removeCompetitor(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          {form.formState.errors.competitorDomains && (
            <p className="text-sm text-destructive mt-2">
              {form.formState.errors.competitorDomains.message}
            </p>
          )}
        </div>
        
        <div>
          <Label>Target Keywords</Label>
          <div className="flex mt-2">
            <Input
              placeholder="property inspection dubai"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              className="flex-1 mr-2"
            />
            <Button 
              type="button" 
              onClick={addKeyword}
              variant="secondary"
            >
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Add keywords you want to target and analyze
          </p>
          
          <div className="mt-3 space-y-2">
            {form.watch("keywords").map((keyword, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md">
                <span className="text-sm truncate flex-1">{keyword}</span>
                <Button 
                  type="button"
                  variant="ghost" 
                  size="sm"
                  onClick={() => removeKeyword(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          {form.formState.errors.keywords && (
            <p className="text-sm text-destructive mt-2">
              {form.formState.errors.keywords.message}
            </p>
          )}
        </div>
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={createAnalysis.isPending}>
            {createAnalysis.isPending ? "Creating..." : "Create Analysis"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}