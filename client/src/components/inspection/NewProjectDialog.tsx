import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Building, ClipboardList, Info } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface NewProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function NewProjectDialog({ open, onOpenChange }: NewProjectDialogProps) {
  const [, setLocation] = useLocation();
  const [projectType, setProjectType] = useState<"snagging" | "rera_audit">("snagging");
  const [reraAuditType, setReraAuditType] = useState<"condition_survey" | "reserve_fund_study">("condition_survey");
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  
  // Clear localStorage values and set defaults when dialog opens
  useEffect(() => {
    if (open) {
      // Reset project type selection when dialog opens
      setProjectType("snagging");
      setReraAuditType("condition_survey");
      
      // Clear any existing values in localStorage to start fresh
      localStorage.removeItem("lastProjectType");
      localStorage.removeItem("reraAuditType");
    }
  }, [open]);
  
  // Save selected project type to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("lastProjectType", projectType);
  }, [projectType]);
  
  function handleCreateProject() {
    onOpenChange(false);
    
    if (projectType === "snagging") {
      // For Snagging Projects, just update localStorage
      localStorage.setItem("lastProjectType", "snagging");
    } else if (projectType === "rera_audit") {
      // For RERA Audit projects, store both project type and audit type
      localStorage.setItem("lastProjectType", "rera_audit");
      localStorage.setItem("reraAuditType", reraAuditType);
    }
    
    // Using window.location.href allows us to bypass the React Router
    // and force the search parameters to be processed again
    window.location.href = "/inspection/projects?create=true";
  }
  
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Select the type of project you want to create
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <RadioGroup 
              value={projectType} 
              onValueChange={(value) => setProjectType(value as "snagging" | "rera_audit")}
              className="flex flex-col space-y-3"
            >
              <div>
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="snagging" id="snagging" />
                  <Label htmlFor="snagging" className="font-medium cursor-pointer">Snagging Project</Label>
                </div>
                
                <div className="ml-7 mt-2 text-sm text-gray-500">
                  Standard inspection project for documenting defects and generating snagging reports.
                </div>
              </div>
              
              <div>
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="rera_audit" id="rera_audit" />
                  <Label htmlFor="rera_audit" className="font-medium cursor-pointer flex items-center">
                    RERA Audit Service
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-5 w-5 ml-1"
                      onClick={(e) => {
                        e.preventDefault();
                        setInfoDialogOpen(true);
                      }}
                    >
                      <Info className="h-4 w-4 text-gray-500" />
                    </Button>
                  </Label>
                </div>
                
                <div className="ml-7 mt-2 text-sm text-gray-500">
                  Property audit as per RERA (Real Estate Regulatory Authority) requirements.
                </div>
                
                {projectType === "rera_audit" && (
                  <div className="ml-7 mt-4 border rounded-md p-3">
                    <p className="text-sm font-medium mb-2">Select RERA Audit Type:</p>
                    <RadioGroup 
                      value={reraAuditType} 
                      onValueChange={(value) => setReraAuditType(value as "condition_survey" | "reserve_fund_study")}
                      className="space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="condition_survey" id="condition_survey" />
                        <Label htmlFor="condition_survey" className="cursor-pointer">Condition Survey</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="reserve_fund_study" id="reserve_fund_study" />
                        <Label htmlFor="reserve_fund_study" className="cursor-pointer">Reserve Fund Study</Label>
                      </div>
                    </RadioGroup>
                  </div>
                )}
              </div>
            </RadioGroup>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <Card className={`border-2 ${projectType === "snagging" ? 'border-blue-500 bg-blue-50' : 'border-transparent'} cursor-pointer transition-colors`}
                onClick={() => setProjectType("snagging")}
              >
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-3 mt-2">
                    <Building className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-medium">Snagging</h3>
                  <p className="text-sm text-gray-500 mt-1">Defects documentation and reports</p>
                </CardContent>
              </Card>
              
              <Card className={`border-2 ${projectType === "rera_audit" ? 'border-purple-500 bg-purple-50' : 'border-transparent'} cursor-pointer transition-colors`}
                onClick={() => setProjectType("rera_audit")}
              >
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center mb-3 mt-2">
                    <ClipboardList className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-medium">RERA Audit</h3>
                  <p className="text-sm text-gray-500 mt-1">Regulatory inspection & analysis</p>
                </CardContent>
              </Card>
            </div>
          </div>
          
          <DialogFooter className="sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleCreateProject}
            >
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={infoDialogOpen} onOpenChange={setInfoDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>About RERA Audit Services</AlertDialogTitle>
            <AlertDialogDescription>
              <p className="mb-3">
                RERA Audit Services are specialized inspections conducted according to Dubai's Real Estate Regulatory Authority standards.
              </p>
              
              <div className="space-y-2 mb-3">
                <p className="font-semibold">Condition Survey:</p>
                <p className="text-sm">
                  A comprehensive assessment of a property's current condition, identifying defects, maintenance issues, and potential risks.
                </p>
                
                <p className="font-semibold mt-2">Reserve Fund Study:</p>
                <p className="text-sm">
                  An advanced analysis that includes condition assessment plus detailed financial planning for future maintenance and replacement costs based on the NRM3 classification framework.
                </p>
              </div>
              
              <p className="text-sm text-gray-600">
                Both services follow a structured assessment process and generate specialized reports compliant with RERA requirements.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Close</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}