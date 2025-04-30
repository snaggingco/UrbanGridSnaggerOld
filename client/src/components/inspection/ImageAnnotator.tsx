import { useState, useRef, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Loader2,
  Save,
  ArrowLeft,
  ArrowRight,
  ImageIcon,
  Pencil,
  Circle,
  Square,
  Type,
  Move,
  Undo2,
  Eraser,
} from "lucide-react";

interface Annotation {
  type: 'circle' | 'square' | 'arrow' | 'text' | 'freehand';
  x: number;
  y: number;
  width?: number;
  height?: number;
  color: string;
  text?: string;
  points?: Array<{x: number, y: number}>;
}

interface ImageAnnotatorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageId: number;
  projectId: number;
  imageUrl: string;
  description?: string | null;
  annotations?: string | null;
}

export default function ImageAnnotator({
  open,
  onOpenChange,
  imageId,
  projectId,
  imageUrl,
  description: initialDescription = null,
  annotations: initialAnnotations = null,
}: ImageAnnotatorProps) {
  const [description, setDescription] = useState(initialDescription || "");
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [currentTool, setCurrentTool] = useState<Annotation["type"] | "move" | "eraser">("freehand");
  const [currentColor, setCurrentColor] = useState<string>("#FF0000");
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentAnnotation, setCurrentAnnotation] = useState<Annotation | null>(null);
  const [selectedAnnotation, setSelectedAnnotation] = useState<number | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Load initial annotations if they exist
  useEffect(() => {
    if (initialAnnotations) {
      try {
        const parsed = JSON.parse(initialAnnotations);
        if (Array.isArray(parsed)) {
          setAnnotations(parsed);
        }
      } catch (e) {
        console.error("Error parsing annotations:", e);
      }
    }
  }, [initialAnnotations]);

  // Save canvas state to rendered annotation when annotation changes
  useEffect(() => {
    drawAnnotations();
  }, [annotations, selectedAnnotation]);

  const drawAnnotations = () => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    
    if (!canvas || !image || !image.complete) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Redraw all annotations
    annotations.forEach((annotation, index) => {
      const isSelected = index === selectedAnnotation;
      
      ctx.strokeStyle = annotation.color;
      ctx.fillStyle = annotation.color;
      ctx.lineWidth = 2;
      
      if (isSelected) {
        // Highlight selected annotation
        ctx.setLineDash([5, 3]);
      } else {
        ctx.setLineDash([]);
      }
      
      switch (annotation.type) {
        case 'circle':
          const radius = Math.max(annotation.width || 20, annotation.height || 20) / 2;
          ctx.beginPath();
          ctx.arc(annotation.x, annotation.y, radius, 0, Math.PI * 2);
          ctx.stroke();
          break;
          
        case 'square':
          const width = annotation.width || 40;
          const height = annotation.height || 40;
          ctx.beginPath();
          ctx.rect(annotation.x - width/2, annotation.y - height/2, width, height);
          ctx.stroke();
          break;
          
        case 'arrow':
          if (annotation.points && annotation.points.length >= 2) {
            const startPoint = annotation.points[0];
            const endPoint = annotation.points[annotation.points.length - 1];
            
            // Draw the line
            ctx.beginPath();
            ctx.moveTo(startPoint.x, startPoint.y);
            ctx.lineTo(endPoint.x, endPoint.y);
            ctx.stroke();
            
            // Draw the arrowhead
            const angle = Math.atan2(endPoint.y - startPoint.y, endPoint.x - startPoint.x);
            const arrowHeadLength = 15;
            
            ctx.beginPath();
            ctx.moveTo(endPoint.x, endPoint.y);
            ctx.lineTo(
              endPoint.x - arrowHeadLength * Math.cos(angle - Math.PI/6),
              endPoint.y - arrowHeadLength * Math.sin(angle - Math.PI/6)
            );
            ctx.lineTo(
              endPoint.x - arrowHeadLength * Math.cos(angle + Math.PI/6),
              endPoint.y - arrowHeadLength * Math.sin(angle + Math.PI/6)
            );
            ctx.closePath();
            ctx.fill();
          }
          break;
          
        case 'text':
          if (annotation.text) {
            ctx.font = "14px Arial";
            ctx.fillText(annotation.text, annotation.x, annotation.y);
          }
          break;
          
        case 'freehand':
          if (annotation.points && annotation.points.length > 1) {
            ctx.beginPath();
            ctx.moveTo(annotation.points[0].x, annotation.points[0].y);
            
            for (let i = 1; i < annotation.points.length; i++) {
              ctx.lineTo(annotation.points[i].x, annotation.points[i].y);
            }
            
            ctx.stroke();
          }
          break;
      }
      
      // Reset line dash
      ctx.setLineDash([]);
    });
  };

  const handleImageLoad = () => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    
    if (!canvas || !image) return;
    
    // Set canvas size to match image dimensions
    canvas.width = image.width;
    canvas.height = image.height;
    
    // Draw initial annotations
    drawAnnotations();
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (currentTool === "move") {
      // Check if clicking on an existing annotation
      for (let i = annotations.length - 1; i >= 0; i--) {
        const ann = annotations[i];
        
        // Simple hit detection - this can be improved for more accuracy
        const hitRange = 10;
        let hit = false;
        
        switch (ann.type) {
          case 'circle':
            const radius = Math.max(ann.width || 20, ann.height || 20) / 2;
            const distance = Math.sqrt(Math.pow(x - ann.x, 2) + Math.pow(y - ann.y, 2));
            hit = distance <= radius + hitRange && distance >= radius - hitRange;
            break;
            
          case 'square':
            const width = ann.width || 40;
            const height = ann.height || 40;
            const left = ann.x - width/2;
            const top = ann.y - height/2;
            hit = x >= left - hitRange && x <= left + width + hitRange && 
                  y >= top - hitRange && y <= top + height + hitRange &&
                  (x <= left + hitRange || x >= left + width - hitRange ||
                   y <= top + hitRange || y >= top + height - hitRange);
            break;
            
          case 'text':
            hit = Math.abs(x - ann.x) <= hitRange && Math.abs(y - ann.y) <= hitRange;
            break;
            
          case 'freehand':
          case 'arrow':
            if (ann.points) {
              for (const point of ann.points) {
                if (Math.abs(x - point.x) <= hitRange && Math.abs(y - point.y) <= hitRange) {
                  hit = true;
                  break;
                }
              }
            }
            break;
        }
        
        if (hit) {
          setSelectedAnnotation(i);
          setIsDrawing(true);
          return;
        }
      }
      setSelectedAnnotation(null);
      return;
    }
    
    if (currentTool === "eraser") {
      // Check if clicking on an existing annotation to erase
      for (let i = annotations.length - 1; i >= 0; i--) {
        const ann = annotations[i];
        
        // Simple hit detection - can be improved
        const hitRange = 15;
        let hit = false;
        
        switch (ann.type) {
          case 'circle':
            const radius = Math.max(ann.width || 20, ann.height || 20) / 2;
            const distance = Math.sqrt(Math.pow(x - ann.x, 2) + Math.pow(y - ann.y, 2));
            hit = distance <= radius + hitRange;
            break;
            
          case 'square':
            const width = ann.width || 40;
            const height = ann.height || 40;
            const left = ann.x - width/2;
            const top = ann.y - height/2;
            hit = x >= left - hitRange && x <= left + width + hitRange && 
                  y >= top - hitRange && y <= top + height + hitRange;
            break;
            
          case 'text':
            hit = Math.abs(x - ann.x) <= hitRange + 20 && Math.abs(y - ann.y) <= hitRange + 20;
            break;
            
          case 'freehand':
          case 'arrow':
            if (ann.points) {
              for (const point of ann.points) {
                if (Math.abs(x - point.x) <= hitRange && Math.abs(y - point.y) <= hitRange) {
                  hit = true;
                  break;
                }
              }
            }
            break;
        }
        
        if (hit) {
          // Remove this annotation
          const newAnnotations = [...annotations];
          newAnnotations.splice(i, 1);
          setAnnotations(newAnnotations);
          return;
        }
      }
      return;
    }
    
    setIsDrawing(true);
    
    let newAnnotation: Annotation;
    
    switch (currentTool) {
      case 'circle':
      case 'square':
        newAnnotation = {
          type: currentTool,
          x,
          y,
          width: 0,
          height: 0,
          color: currentColor,
        };
        break;
        
      case 'arrow':
        newAnnotation = {
          type: 'arrow',
          x,
          y,
          color: currentColor,
          points: [{ x, y }, { x, y }],
        };
        break;
        
      case 'text':
        const text = prompt('Enter text:');
        if (!text) {
          setIsDrawing(false);
          return;
        }
        newAnnotation = {
          type: 'text',
          x,
          y,
          color: currentColor,
          text,
        };
        // Add directly without dragging for text
        setAnnotations([...annotations, newAnnotation]);
        setIsDrawing(false);
        return;
        
      case 'freehand':
      default:
        newAnnotation = {
          type: 'freehand',
          x,
          y,
          color: currentColor,
          points: [{ x, y }],
        };
        break;
    }
    
    setCurrentAnnotation(newAnnotation);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (currentTool === "move" && selectedAnnotation !== null) {
      // Move the selected annotation
      const newAnnotations = [...annotations];
      const ann = newAnnotations[selectedAnnotation];
      
      // Get the movement amount
      const deltaX = x - ann.x;
      const deltaY = y - ann.y;
      
      // Update the annotation position
      ann.x = x;
      ann.y = y;
      
      // For annotations with points, move all points
      if (ann.points) {
        ann.points = ann.points.map(point => ({
          x: point.x + deltaX,
          y: point.y + deltaY,
        }));
      }
      
      setAnnotations(newAnnotations);
      return;
    }
    
    if (!currentAnnotation) return;
    
    let updatedAnnotation = { ...currentAnnotation };
    
    switch (currentAnnotation.type) {
      case 'circle':
      case 'square':
        // Calculate width and height from initial point
        const width = Math.abs(x - currentAnnotation.x) * 2;
        const height = Math.abs(y - currentAnnotation.y) * 2;
        updatedAnnotation.width = width;
        updatedAnnotation.height = height;
        break;
        
      case 'arrow':
        if (updatedAnnotation.points && updatedAnnotation.points.length > 0) {
          updatedAnnotation.points = [
            updatedAnnotation.points[0],
            { x, y },
          ];
        }
        break;
        
      case 'freehand':
        if (updatedAnnotation.points) {
          updatedAnnotation.points = [...updatedAnnotation.points, { x, y }];
        }
        break;
    }
    
    setCurrentAnnotation(updatedAnnotation);
    
    // Draw the current state
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Redraw existing annotations
    drawAnnotations();
    
    // Draw the current annotation being created
    ctx.strokeStyle = updatedAnnotation.color;
    ctx.fillStyle = updatedAnnotation.color;
    ctx.lineWidth = 2;
    
    switch (updatedAnnotation.type) {
      case 'circle':
        const radius = Math.max(updatedAnnotation.width || 0, updatedAnnotation.height || 0) / 2;
        ctx.beginPath();
        ctx.arc(updatedAnnotation.x, updatedAnnotation.y, radius, 0, Math.PI * 2);
        ctx.stroke();
        break;
        
      case 'square':
        const width = updatedAnnotation.width || 0;
        const height = updatedAnnotation.height || 0;
        ctx.beginPath();
        ctx.rect(updatedAnnotation.x - width/2, updatedAnnotation.y - height/2, width, height);
        ctx.stroke();
        break;
        
      case 'arrow':
        if (updatedAnnotation.points && updatedAnnotation.points.length >= 2) {
          const startPoint = updatedAnnotation.points[0];
          const endPoint = updatedAnnotation.points[1];
          
          // Draw the line
          ctx.beginPath();
          ctx.moveTo(startPoint.x, startPoint.y);
          ctx.lineTo(endPoint.x, endPoint.y);
          ctx.stroke();
          
          // Draw the arrowhead
          const angle = Math.atan2(endPoint.y - startPoint.y, endPoint.x - startPoint.x);
          const arrowHeadLength = 15;
          
          ctx.beginPath();
          ctx.moveTo(endPoint.x, endPoint.y);
          ctx.lineTo(
            endPoint.x - arrowHeadLength * Math.cos(angle - Math.PI/6),
            endPoint.y - arrowHeadLength * Math.sin(angle - Math.PI/6)
          );
          ctx.lineTo(
            endPoint.x - arrowHeadLength * Math.cos(angle + Math.PI/6),
            endPoint.y - arrowHeadLength * Math.sin(angle + Math.PI/6)
          );
          ctx.closePath();
          ctx.fill();
        }
        break;
        
      case 'freehand':
        if (updatedAnnotation.points && updatedAnnotation.points.length > 1) {
          ctx.beginPath();
          ctx.moveTo(updatedAnnotation.points[0].x, updatedAnnotation.points[0].y);
          
          for (let i = 1; i < updatedAnnotation.points.length; i++) {
            ctx.lineTo(updatedAnnotation.points[i].x, updatedAnnotation.points[i].y);
          }
          
          ctx.stroke();
        }
        break;
    }
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    if (currentTool === "move" || currentTool === "eraser") {
      return;
    }
    
    if (currentAnnotation) {
      setAnnotations([...annotations, currentAnnotation]);
      setCurrentAnnotation(null);
    }
  };

  const undoLastAnnotation = () => {
    if (annotations.length === 0) return;
    setAnnotations(annotations.slice(0, -1));
  };

  // Mutation to save annotations and description
  const saveMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: any }) => {
      return apiRequest(`/api/images/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId, "images"] });
      toast({
        title: "Saved successfully",
        description: "Image annotations have been saved.",
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Save failed",
        description: error.message || "Failed to save annotations.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    saveMutation.mutate({
      id: imageId,
      data: {
        description,
        annotations: JSON.stringify(annotations),
        isAnnotated: annotations.length > 0,
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Annotate Image</DialogTitle>
          <DialogDescription>
            Add markups, highlights and notes to the inspection image
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="annotate" className="w-full">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="annotate">Annotate</TabsTrigger>
            <TabsTrigger value="description">Add Description</TabsTrigger>
          </TabsList>
          
          <TabsContent value="annotate" className="space-y-4 mt-2">
            <div className="flex flex-wrap gap-2 mb-4">
              <Button
                type="button"
                variant={currentTool === "freehand" ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentTool("freehand")}
                className="gap-1"
              >
                <Pencil className="h-4 w-4" />
                Pencil
              </Button>
              
              <Button
                type="button"
                variant={currentTool === "circle" ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentTool("circle")}
                className="gap-1"
              >
                <Circle className="h-4 w-4" />
                Circle
              </Button>
              
              <Button
                type="button"
                variant={currentTool === "square" ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentTool("square")}
                className="gap-1"
              >
                <Square className="h-4 w-4" />
                Square
              </Button>
              
              <Button
                type="button"
                variant={currentTool === "arrow" ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentTool("arrow")}
                className="gap-1"
              >
                <ArrowRight className="h-4 w-4" />
                Arrow
              </Button>
              
              <Button
                type="button"
                variant={currentTool === "text" ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentTool("text")}
                className="gap-1"
              >
                <Type className="h-4 w-4" />
                Text
              </Button>
              
              <Button
                type="button"
                variant={currentTool === "move" ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentTool("move")}
                className="gap-1"
              >
                <Move className="h-4 w-4" />
                Move
              </Button>
              
              <Button
                type="button"
                variant={currentTool === "eraser" ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentTool("eraser")}
                className="gap-1"
              >
                <Eraser className="h-4 w-4" />
                Erase
              </Button>
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={undoLastAnnotation}
                className="gap-1"
                disabled={annotations.length === 0}
              >
                <Undo2 className="h-4 w-4" />
                Undo
              </Button>
            </div>
            
            <div className="flex gap-2 mb-4">
              <Label className="flex items-center gap-2">
                Color:
                <input 
                  type="color" 
                  value={currentColor}
                  onChange={(e) => setCurrentColor(e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer border-none"
                />
              </Label>
            </div>
            
            <div className="relative border rounded-md overflow-hidden">
              <div className="relative">
                <img
                  ref={imageRef}
                  src={imageUrl}
                  alt="Image to annotate"
                  className="max-w-full h-auto"
                  onLoad={handleImageLoad}
                />
                <canvas
                  ref={canvasRef}
                  className="absolute top-0 left-0 w-full h-full"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="description" className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="description">Image Description</Label>
              <Textarea
                id="description"
                placeholder="Enter a detailed description of what this image shows..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
              />
              <p className="text-xs text-muted-foreground">
                Add a clear description of what this image captures, including relevant defects,
                locations, or other important details.
              </p>
            </div>
            
            <div className="border rounded-md p-4 bg-muted/50">
              <h4 className="font-medium mb-2">Image Preview</h4>
              <div className="relative border rounded overflow-hidden">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="max-w-full h-auto"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saveMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            className="gap-2"
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Annotations
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}