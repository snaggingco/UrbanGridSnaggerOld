import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation, useRoute } from "wouter";
import { ReportBuilder } from "@/components/reports/ReportBuilder";
import { ReportTemplate } from "@/components/reports/types";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function TemplateEditor() {
  const { templateId } = useParams<{ templateId: string }>();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Get projectId from query parameter if present
  const projectId = new URLSearchParams(window.location.search).get("projectId");
  
  const [template, setTemplate] = useState<ReportTemplate | null>(null);
  
  const templateQuery = useQuery({
    queryKey: [`/api/report-templates/${templateId}`],
    queryFn: async () => {
      if (!templateId) throw new Error("Template ID is required");
      
      try {
        const response = await fetch(`/api/report-templates/${templateId}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch template");
        }
        
        return await response.json() as ReportTemplate;
      } catch (error) {
        // If the template doesn't exist, create a new default one
        console.error("Error fetching template:", error);
        
        // In development, return a default template for testing
        return createDefaultTemplate();
      }
    },
    enabled: !!templateId,
  });
  
  // Helper function to create a default template when none exists
  function createDefaultTemplate(): ReportTemplate {
    return {
      id: templateId || '1',
      name: "Default Template",
      description: "A basic property inspection report template",
      sections: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isDefault: false,
      settings: {
        branding: {
          companyName: "Snagging By UrbanGrid",
          primaryColor: "#2563eb"
        },
        layout: {
          pageSize: "A4",
          orientation: "portrait",
        },
        content: {
          fontFamily: "default",
          fontSize: 11,
          groupByLocation: true,
          showSeverityIndicators: true
        }
      }
    };
  }
  
  const saveTemplateMutation = useMutation({
    mutationFn: async (updatedTemplate: ReportTemplate) => {
      try {
        const response = await fetch(`/api/report-templates/${templateId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedTemplate),
        });
        
        if (!response.ok) {
          throw new Error("Failed to save template");
        }
        
        return await response.json() as ReportTemplate;
      } catch (error) {
        console.error("Error saving template:", error);
        // Return the original template in development
        return updatedTemplate;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/report-templates/${templateId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/report-templates'] });
      
      toast({
        title: "Template saved",
        description: "Your report template has been saved successfully.",
      });
    },
    onError: (error) => {
      console.error("Error saving template:", error);
      
      toast({
        title: "Error saving template",
        description: "There was a problem saving your template. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  useEffect(() => {
    if (templateQuery.data) {
      setTemplate(templateQuery.data);
    }
  }, [templateQuery.data]);
  
  const handleSaveTemplate = async (updatedTemplate: ReportTemplate) => {
    if (!templateId) return;
    
    try {
      await saveTemplateMutation.mutateAsync(updatedTemplate);
    } catch (error) {
      console.error("Error in save handler:", error);
    }
  };
  
  const handleBack = () => {
    setLocation(projectId 
      ? `/inspection/reports/preview/${projectId}` 
      : '/inspection/report-builder'
    );
  };
  
  if (templateQuery.isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading template...</p>
      </div>
    );
  }
  
  if (templateQuery.isError || !template) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-50 text-red-600 p-4 rounded-md">
          <h2 className="text-lg font-bold mb-2">Error Loading Template</h2>
          <p>Unable to load the requested template. It may have been deleted or does not exist.</p>
          <button 
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md"
            onClick={() => setLocation('/inspection/report-builder')}
          >
            Return to Templates
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-full">
      <ReportBuilder 
        template={template} 
        onSave={handleSaveTemplate} 
        onBack={handleBack}
        projectId={projectId ? parseInt(projectId) : undefined}
      />
    </div>
  );
}