import React, { useState } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Project } from '@shared/schema';
import { 
  Building2, 
  FileText, 
  Loader2, 
  Database,
  BarChart4,
  FileCheck,
  Gauge,
  HomeIcon
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Link } from 'wouter';

export default function ReraProjectsAdmin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Query to fetch all RERA projects
  const { data: projects, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/projects/rera-projects'],
    queryFn: async () => {
      const response = await apiRequest('/api/projects?type=rera_audit');
      return response.data || [];
    }
  });
  
  // Mutation to generate sample projects
  const generateSampleProjects = useMutation({
    mutationFn: async () => {
      setIsGenerating(true);
      const response = await apiRequest('/api/rera/sample-projects?clean=true', {
        method: 'POST'
      });
      return response;
    },
    onSuccess: (data) => {
      toast({
        title: "Success!",
        description: "Sample reserve fund projects have been generated.",
      });
      refetch(); // Refresh the projects list
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to generate sample projects. Please try again.",
        variant: "destructive",
      });
      console.error("Error generating sample projects:", error);
    },
    onSettled: () => {
      setIsGenerating(false);
    }
  });
  
  const handleGenerateProjects = () => {
    generateSampleProjects.mutate();
  };
  
  return (
    <AdminLayout title="RERA Projects" description="Manage RERA audits and reserve fund studies">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="mr-2 h-5 w-5 text-primary" />
              Reserve Fund Studies
            </CardTitle>
            <CardDescription>
              Complete RERA-compliant reserve fund studies for properties in Dubai
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Projects:</span>
                <Badge variant="outline" className="ml-auto">
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 
                   projects?.filter((p: Project) => p.reraAuditType === 'reserve_fund_study')?.length || 0}
                </Badge>
              </div>
              <div className="text-sm">
                Reserve fund studies help property owners and associations plan for future capital expenses.
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleGenerateProjects} 
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Database className="mr-2 h-4 w-4" />
                  Generate Sample Projects
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Gauge className="mr-2 h-5 w-5 text-primary" />
              Condition Assessments
            </CardTitle>
            <CardDescription>
              Building condition surveys and detailed assessments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Projects:</span>
                <Badge variant="outline" className="ml-auto">
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 
                   projects?.filter((p: Project) => p.reraAuditType === 'condition_survey')?.length || 0}
                </Badge>
              </div>
              <div className="text-sm">
                Detailed assessment of building components and systems helps in planning maintenance.
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              <FileCheck className="mr-2 h-4 w-4" />
              View Assessment Templates
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      {/* Project list */}
      <Card>
        <CardHeader>
          <CardTitle>RERA Project List</CardTitle>
          <CardDescription>All reserve fund studies and building condition assessments</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>Failed to load projects. Please try again.</AlertDescription>
            </Alert>
          ) : projects?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <HomeIcon className="mx-auto h-12 w-12 opacity-20 mb-2" />
              <p>No RERA projects found.</p>
              <p className="text-sm mt-2">Generate sample projects or create a new one.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {projects?.map((project: Project) => (
                <Card key={project.id} className="overflow-hidden">
                  <div className="grid grid-cols-1 md:grid-cols-4 items-center">
                    <div className="md:col-span-3 p-4 md:border-r">
                      <div className="flex items-start">
                        <div>
                          <h3 className="font-medium">{project.name}</h3>
                          <div className="text-sm text-muted-foreground mt-1">
                            {project.clientName} | {project.location}
                          </div>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge variant={project.reraAuditType === 'reserve_fund_study' ? 'default' : 'outline'}>
                              {project.reraAuditType === 'reserve_fund_study' ? 'Reserve Fund' : 'Condition Survey'}
                            </Badge>
                            <Badge variant={project.status === 'completed' ? 'success' : 'secondary'} className="capitalize">
                              {project.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2 p-4">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/inspection/rera-project/${project.id}`}>
                          <BarChart4 className="h-4 w-4 mr-1" />
                          Analysis
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/inspection/rera-project/${project.id}/report`}>
                          <FileText className="h-4 w-4 mr-1" />
                          Report
                        </Link>
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}