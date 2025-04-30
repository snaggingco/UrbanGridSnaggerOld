import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { FilePlus, Search, ChevronLeft, Calendar, Edit, Copy, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation, useRoute, Link } from "wouter";
import { ReportTemplate } from "@/components/reports/types";
import { apiRequest } from "@/lib/queryClient";

// Placeholder for a default template
const createDefaultTemplate = (): ReportTemplate => {
  return {
    id: `default-${Date.now()}`,
    name: "New Template",
    description: "Your customized report template",
    createdAt: new Date(),
    updatedAt: new Date(),
    isDefault: false,
    sections: [],
    settings: {
      branding: {
        logo: "",
        primaryColor: "#2563eb",
        secondaryColor: "#e5e7eb",
        companyName: "Snagging By UrbanGrid",
        showPageNumbers: true,
        showDateOnEveryPage: true,
      },
      layout: {
        pageSize: "A4",
        orientation: "portrait",
        margins: {
          top: 20,
          right: 20,
          bottom: 20,
          left: 20,
        },
        headerHeight: 40,
        footerHeight: 40,
      },
      content: {
        fontFamily: "default",
        fontSize: 11,
        defectsPerPage: 4,
        imagesPerDefect: 3,
        includeRemedialActions: true,
        includeCostEstimates: false,
        includeLocationMap: true,
        groupByLocation: true,
        showSeverityIndicators: true,
      },
    },
  };
};

export function TemplateSelection() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();
  const { projectId } = useParams<{ projectId?: string }>();
  
  const templatesQuery = useQuery({
    queryKey: ['/api/report-templates'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/report-templates');
        if (!response.ok) {
          throw new Error("Failed to fetch templates");
        }
        return await response.json() as ReportTemplate[];
      } catch (error) {
        console.error("Error fetching templates:", error);
        // Return empty array for now (development only)
        return [];
      }
    }
  });

  const createTemplateMutation = useMutation({
    mutationFn: async (template: ReportTemplate) => {
      try {
        const response = await fetch('/api/report-templates', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(template),
        });
        
        if (!response.ok) {
          throw new Error("Failed to create template");
        }
        
        return await response.json() as ReportTemplate;
      } catch (error) {
        console.error("Error creating template:", error);
        // Return the original template for development
        return template;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/report-templates'] });
    },
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: async (templateId: string) => {
      try {
        const response = await fetch(`/api/report-templates/${templateId}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error("Failed to delete template");
        }
      } catch (error) {
        console.error("Error deleting template:", error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/report-templates'] });
    },
  });
  
  const handleCreateTemplate = async () => {
    try {
      const newTemplate = createDefaultTemplate();
      await createTemplateMutation.mutateAsync(newTemplate);
      setLocation(`/inspection/report-builder/edit/${newTemplate.id}${projectId ? `?projectId=${projectId}` : ''}`);
    } catch (error) {
      console.error("Error creating template:", error);
    }
  };
  
  const handleDeleteTemplate = async (templateId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (window.confirm("Are you sure you want to delete this template?")) {
      try {
        await deleteTemplateMutation.mutateAsync(templateId);
      } catch (error) {
        console.error("Error deleting template:", error);
      }
    }
  };
  
  const handleDuplicateTemplate = async (template: ReportTemplate, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    try {
      const duplicatedTemplate: ReportTemplate = {
        ...template,
        id: `template-${Date.now()}`,
        name: `${template.name} (Copy)`,
        createdAt: new Date(),
        updatedAt: new Date(),
        isDefault: false,
      };
      
      await createTemplateMutation.mutateAsync(duplicatedTemplate);
    } catch (error) {
      console.error("Error duplicating template:", error);
    }
  };
  
  const filteredTemplates = templatesQuery.data?.filter(template => {
    return template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           (template.description?.toLowerCase().includes(searchQuery.toLowerCase()));
  }) || [];
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-6">
        <Button variant="ghost" className="mr-2" onClick={() => setLocation("/inspection/reports")}>
          <ChevronLeft className="h-4 w-4 mr-1" /> Back to Reports
        </Button>
        <h1 className="text-2xl font-bold">Report Templates</h1>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input 
            className="pl-10"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button onClick={handleCreateTemplate}>
          <FilePlus className="h-4 w-4 mr-1" /> Create Template
        </Button>
      </div>
      
      {templatesQuery.isLoading ? (
        <div className="flex justify-center p-12">
          <p>Loading templates...</p>
        </div>
      ) : templatesQuery.isError ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-md">
          <p>Error loading templates. Please try again.</p>
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-md">
          <p className="text-gray-500 mb-4">No templates found</p>
          <Button onClick={handleCreateTemplate}>
            <FilePlus className="h-4 w-4 mr-1" /> Create Your First Template
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <Card 
              key={template.id} 
              className="hover:border-blue-300 cursor-pointer transition-colors"
              onClick={() => setLocation(`/inspection/report-builder/edit/${template.id}${projectId ? `?projectId=${projectId}` : ''}`)}
            >
              <CardHeader className="flex flex-row items-start justify-between bg-gray-50 border-b">
                <div>
                  <h3 className="text-lg font-semibold">{template.name}</h3>
                  {template.isDefault && (
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-md mt-1">
                      Default Template
                    </span>
                  )}
                </div>
                <div className="flex space-x-1">
                  <Button 
                    size="sm" 
                    variant="ghost"
                    title="Edit Template"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    title="Duplicate Template"
                    onClick={(e) => handleDuplicateTemplate(template, e)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    title="Delete Template"
                    onClick={(e) => handleDeleteTemplate(template.id, e)}
                    className="text-red-500 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {template.description || "No description provided"}
                </p>
                <div className="text-xs text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" /> 
                    Created: {new Date(template.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center mt-1">
                    <Calendar className="h-3 w-3 mr-1" /> 
                    Updated: {new Date(template.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50 border-t p-3">
                <div className="w-full flex justify-between items-center">
                  <span className="text-sm">
                    {template.sections.length} {template.sections.length === 1 ? 'section' : 'sections'}
                  </span>
                  <Button size="sm">
                    Use Template
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}