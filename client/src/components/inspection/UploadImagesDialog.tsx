import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  ImageIcon,
  UploadIcon,
  XIcon,
  Loader2,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface UploadImagesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: number;
  defectId?: number | null;
}

export default function UploadImagesDialog({
  open,
  onOpenChange,
  projectId,
  defectId,
}: UploadImagesDialogProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return apiRequest("/api/images/upload", {
        method: "POST",
        body: formData,
        headers: {
          // Don't set Content-Type here as it will be set automatically with the correct boundary
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "images"] });
    },
    onError: (error: any) => {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload image.",
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      
      // Validate file types
      const validFiles = newFiles.filter(file => 
        file.type.startsWith('image/')
      );
      
      if (validFiles.length !== newFiles.length) {
        toast({
          title: "Invalid files",
          description: "Only image files are allowed.",
          variant: "destructive",
        });
      }
      
      // Create preview URLs
      const newPreviewUrls = validFiles.map(file => URL.createObjectURL(file));
      
      setFiles(prev => [...prev, ...validFiles]);
      setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(previewUrls[index]);
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one image to upload.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setProgress(0);
    
    let successCount = 0;
    const totalFiles = files.length;

    // Upload files one by one
    for (let i = 0; i < files.length; i++) {
      const formData = new FormData();
      formData.append('image', files[i]);
      formData.append('projectId', projectId.toString());
      
      if (defectId) {
        formData.append('defectId', defectId.toString());
      }

      try {
        await uploadMutation.mutateAsync(formData);
        successCount++;
        
        // Update progress
        const newProgress = Math.round((successCount / totalFiles) * 100);
        setProgress(newProgress);
      } catch (error) {
        // Error is handled by the mutation
        console.error("Failed to upload file:", error);
      }
    }

    // Clean up
    setUploading(false);
    
    if (successCount > 0) {
      toast({
        title: "Upload complete",
        description: `Successfully uploaded ${successCount} of ${totalFiles} images.`,
      });
      
      // Reset the state after successful upload
      // Revoke all object URLs first
      previewUrls.forEach(url => URL.revokeObjectURL(url));
      
      setFiles([]);
      setPreviewUrls([]);
      onOpenChange(false);
    } else {
      toast({
        title: "Upload failed",
        description: "No images were uploaded. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      
      // Validate file types
      const validFiles = droppedFiles.filter(file => 
        file.type.startsWith('image/')
      );
      
      if (validFiles.length !== droppedFiles.length) {
        toast({
          title: "Invalid files",
          description: "Only image files are allowed.",
          variant: "destructive",
        });
      }
      
      // Create preview URLs
      const newPreviewUrls = validFiles.map(file => URL.createObjectURL(file));
      
      setFiles(prev => [...prev, ...validFiles]);
      setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!newOpen && !uploading) {
        // Clean up preview URLs when dialog is closed
        previewUrls.forEach(url => URL.revokeObjectURL(url));
        setFiles([]);
        setPreviewUrls([]);
      }
      onOpenChange(newOpen);
    }}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Upload Inspection Photos</DialogTitle>
          <DialogDescription>
            Upload photos of the property or specific defects for the inspection report
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-4">
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
              "hover:border-primary/50 hover:bg-muted/50"
            )}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={uploading}
            />
            
            <UploadIcon className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
            
            <h3 className="text-lg font-medium mb-1">
              Drag & drop images or click to browse
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              Supports JPG, PNG, GIF up to 5MB
            </p>
            
            <Button 
              type="button" 
              variant="outline"
              disabled={uploading}
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              Select Images
            </Button>
          </div>

          {previewUrls.length > 0 && (
            <>
              <Separator />
              
              <div>
                <h4 className="font-medium mb-3">Selected Images ({previewUrls.length})</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {previewUrls.map((url, index) => (
                    <Card key={url} className="overflow-hidden group relative">
                      <CardContent className="p-0">
                        <div className="aspect-video overflow-hidden">
                          <img 
                            src={url} 
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6 opacity-80 hover:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(index);
                          }}
                          disabled={uploading}
                        >
                          <XIcon className="h-3 w-3" />
                        </Button>
                        
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-1 text-xs truncate">
                          {files[index]?.name || `Image ${index + 1}`}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </>
          )}

          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={uploading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={files.length === 0 || uploading}
            onClick={handleUpload}
            className="gap-2"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <UploadIcon className="h-4 w-4" />
                Upload {files.length > 0 ? `(${files.length})` : ""}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}