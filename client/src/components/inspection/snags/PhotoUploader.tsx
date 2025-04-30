import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Edit, X, Upload, Image as ImageIcon, Pencil, Loader2, Save, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface PhotoUploaderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: number;
  defectId?: number | null;
}

interface Annotation {
  x: number;
  y: number;
  text: string;
}

export default function PhotoUploader({
  open,
  onOpenChange,
  projectId,
  defectId,
}: PhotoUploaderProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [isAnnotating, setIsAnnotating] = useState(false);
  const [annotations, setAnnotations] = useState<Annotation[][]>([]);
  const [currentAnnotation, setCurrentAnnotation] = useState<string>("");
  const imageRef = useRef<HTMLImageElement>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
      
      // Create previews
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setPreviews(prev => [...prev, ...newPreviews]);
      
      // Initialize annotations array for new images
      setAnnotations(prev => [...prev, ...newFiles.map(() => [])]);
    }
  };

  const removeImage = (index: number) => {
    const newFiles = [...files];
    const newPreviews = [...previews];
    const newAnnotations = [...annotations];
    
    // Revoke object URL to avoid memory leaks
    URL.revokeObjectURL(previews[index]);
    
    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);
    newAnnotations.splice(index, 1);
    
    setFiles(newFiles);
    setPreviews(newPreviews);
    setAnnotations(newAnnotations);
    
    if (selectedImageIndex === index) {
      setSelectedImageIndex(null);
      setIsAnnotating(false);
    } else if (selectedImageIndex !== null && selectedImageIndex > index) {
      setSelectedImageIndex(selectedImageIndex - 1);
    }
  };

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!isAnnotating || !imageRef.current || selectedImageIndex === null) return;
    
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    if (currentAnnotation.trim()) {
      const newAnnotations = [...annotations];
      newAnnotations[selectedImageIndex] = [
        ...newAnnotations[selectedImageIndex],
        { x, y, text: currentAnnotation.trim() }
      ];
      setAnnotations(newAnnotations);
      setCurrentAnnotation("");
    }
  };

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (files.length === 0) return;
      
      setIsUploading(true);
      setUploadProgress(0);
      
      // Create FormData
      const formData = new FormData();
      
      // Add files
      files.forEach((file, index) => {
        formData.append('images', file);
        
        // Add annotations if they exist
        if (annotations[index] && annotations[index].length > 0) {
          formData.append(`annotations[${index}]`, JSON.stringify(annotations[index]));
        }
      });
      
      // Add description
      formData.append('description', description);
      
      // Add defect ID if available
      if (defectId) {
        formData.append('defectId', defectId.toString());
      }
      
      // Simulate progress for demo
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = Math.min(prev + 10, 90);
          return newProgress;
        });
      }, 300);
      
      try {
        // Upload request
        await apiRequest(`/api/projects/${projectId}/images/upload`, {
          method: "POST",
          body: formData,
        });
        
        clearInterval(progressInterval);
        setUploadProgress(100);
        
        return true;
      } catch (error) {
        clearInterval(progressInterval);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "images"] });
      if (defectId) {
        queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "defects", defectId] });
      }
      
      // Show success message
      toast({
        title: "Images uploaded",
        description: `Successfully uploaded ${files.length} image${files.length > 1 ? 's' : ''}`,
      });
      
      // Reset form
      resetForm();
      
      // Close dialog after a brief delay to show 100% completion
      setTimeout(() => {
        onOpenChange(false);
      }, 500);
    },
    onError: (error: any) => {
      toast({
        title: "Upload failed",
        description: error.message || "An error occurred during upload",
        variant: "destructive",
      });
      setIsUploading(false);
    },
  });

  const resetForm = () => {
    // Clean up object URLs
    previews.forEach(preview => URL.revokeObjectURL(preview));
    
    setFiles([]);
    setPreviews([]);
    setDescription("");
    setSelectedImageIndex(null);
    setIsAnnotating(false);
    setAnnotations([]);
    setCurrentAnnotation("");
    setUploadProgress(0);
    setIsUploading(false);
  };

  const handleClose = () => {
    if (!isUploading) {
      resetForm();
      onOpenChange(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    uploadMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Photos</DialogTitle>
          <DialogDescription>
            {defectId 
              ? "Upload photos related to this snag" 
              : "Upload photos for the project"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="images">Images</Label>
            <div className="border border-dashed rounded-lg p-6 text-center">
              {previews.length === 0 ? (
                <div className="flex flex-col items-center justify-center">
                  <ImageIcon className="h-10 w-10 text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500 mb-4">
                    Drag and drop images here, or click to select files
                  </p>
                  <Input
                    id="images"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("images")?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Select Images
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {previews.map((preview, index) => (
                      <div
                        key={index}
                        className={`relative group aspect-square border rounded-md overflow-hidden ${
                          selectedImageIndex === index ? "ring-2 ring-primary" : ""
                        }`}
                      >
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                          onClick={() => setSelectedImageIndex(index)}
                        />
                        <button
                          type="button"
                          className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeImage(index);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </button>
                        {annotations[index]?.length > 0 && (
                          <div className="absolute bottom-1 left-1 bg-yellow-500 text-white rounded-md px-1 text-xs">
                            {annotations[index].length} {annotations[index].length === 1 ? 'annotation' : 'annotations'}
                          </div>
                        )}
                      </div>
                    ))}
                    <div className="border border-dashed rounded-md flex items-center justify-center">
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-full w-full text-gray-500"
                        onClick={() => document.getElementById("images")?.click()}
                      >
                        <Plus className="h-6 w-6" />
                      </Button>
                      <Input
                        id="images"
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </div>
                  </div>
                  
                  {selectedImageIndex !== null && (
                    <div className="space-y-4">
                      <div className="relative border rounded-md overflow-hidden">
                        <img
                          ref={imageRef}
                          src={previews[selectedImageIndex]}
                          alt={`Selected image ${selectedImageIndex + 1}`}
                          className="w-full object-contain max-h-[300px]"
                          onClick={handleImageClick}
                          style={{ cursor: isAnnotating ? 'crosshair' : 'default' }}
                        />
                        
                        {/* Annotation markers */}
                        {annotations[selectedImageIndex]?.map((annotation, i) => (
                          <div
                            key={i}
                            className="absolute w-5 h-5 bg-yellow-500 text-white rounded-full flex items-center justify-center -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                            style={{
                              left: `${annotation.x}%`,
                              top: `${annotation.y}%`,
                            }}
                            title={annotation.text}
                          >
                            {i + 1}
                          </div>
                        ))}
                        
                        <div className="absolute top-2 right-2 flex space-x-2">
                          <Button
                            type="button"
                            size="sm"
                            variant={isAnnotating ? "default" : "outline"}
                            className="h-8"
                            onClick={() => setIsAnnotating(!isAnnotating)}
                          >
                            <Pencil className="h-3.5 w-3.5 mr-1" />
                            {isAnnotating ? "Cancel" : "Annotate"}
                          </Button>
                        </div>
                      </div>
                      
                      {isAnnotating && (
                        <div className="flex space-x-2">
                          <Input
                            placeholder="Enter annotation text and click on image..."
                            value={currentAnnotation}
                            onChange={(e) => setCurrentAnnotation(e.target.value)}
                            className="flex-1"
                          />
                        </div>
                      )}
                      
                      {annotations[selectedImageIndex]?.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium">Annotations</h4>
                          <div className="space-y-1 max-h-[150px] overflow-y-auto">
                            {annotations[selectedImageIndex].map((annotation, i) => (
                              <div
                                key={i}
                                className="flex items-start space-x-2 text-sm"
                              >
                                <div className="w-5 h-5 bg-yellow-500 text-white rounded-full flex items-center justify-center flex-shrink-0">
                                  {i + 1}
                                </div>
                                <p className="text-gray-700 flex-1">{annotation.text}</p>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-5 w-5"
                                  onClick={() => {
                                    const newAnnotations = [...annotations];
                                    newAnnotations[selectedImageIndex] = newAnnotations[selectedImageIndex].filter((_, index) => index !== i);
                                    setAnnotations(newAnnotations);
                                  }}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Provide a description for these images"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Uploading...</span>
                <span className="text-sm">{uploadProgress}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={files.length === 0 || isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Upload {files.length} {files.length === 1 ? 'Image' : 'Images'}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}