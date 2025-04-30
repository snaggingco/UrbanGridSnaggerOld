import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ImageIcon, Edit, Loader2, ImageOff, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import ImageAnnotator from "./ImageAnnotator";

interface Image {
  id: number;
  url: string;
  projectId: number;
  defectId?: number | null;
  description?: string | null;
  annotations?: string | null;
  isAnnotated?: boolean;
  filename: string;
  createdAt: string;
}

interface PhotoViewerProps {
  projectId: number;
  defectId?: number | null;
}

export default function PhotoViewer({ projectId, defectId }: PhotoViewerProps) {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [annotatorOpen, setAnnotatorOpen] = useState(false);
  
  // Fetch images for this project or defect
  const { data: images, isLoading, error } = useQuery<Image[]>({
    queryKey: defectId 
      ? ["/api/defects", defectId, "images"] 
      : ["/api/projects", projectId, "images"],
    enabled: viewerOpen,
  });
  
  // Viewing a specific image in the annotator
  const currentImage = images && images.length > currentIndex ? images[currentIndex] : null;
  
  return (
    <>
      <Dialog open={viewerOpen} onOpenChange={setViewerOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="outline"
            size="sm"
            className="gap-1"
          >
            <ImageIcon className="h-4 w-4" />
            View Photos
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[900px]">
          <DialogHeader>
            <DialogTitle>Inspection Photos</DialogTitle>
            <DialogDescription>
              {defectId 
                ? "Photos related to this specific defect" 
                : "All photos for this inspection project"}
            </DialogDescription>
          </DialogHeader>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <ImageOff className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Failed to load images</h3>
              <p className="text-muted-foreground max-w-md">
                There was a problem loading the photos. Please try again.
              </p>
            </div>
          ) : !images || images.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <ImageOff className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No photos</h3>
              <p className="text-muted-foreground max-w-md">
                No photos have been uploaded for this {defectId ? "defect" : "project"}.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <Carousel
                setApi={(api) => {
                  api?.on("select", () => {
                    setCurrentIndex(api.selectedScrollSnap());
                  });
                }}
              >
                <CarouselContent>
                  {images.map((image, index) => (
                    <CarouselItem key={image.id}>
                      <Card className="overflow-hidden">
                        <div className="relative">
                          <img
                            src={image.url}
                            alt={`Inspection photo ${index + 1}`}
                            className="w-full h-auto"
                          />
                          {image.isAnnotated && (
                            <Badge 
                              className="absolute top-2 right-2 bg-yellow-500 text-white border-none"
                              variant="secondary"
                            >
                              <Pencil className="h-3 w-3 mr-1" />
                              Annotated
                            </Badge>
                          )}
                        </div>
                        <CardContent className="p-4">
                          <div className="flex justify-between">
                            <div>
                              <p className="font-medium text-sm truncate">
                                {image.filename}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(image.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setAnnotatorOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Annotate
                            </Button>
                          </div>
                          {image.description && (
                            <p className="mt-2 text-sm text-gray-700">
                              {image.description}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <div className="flex justify-center gap-2 mt-2">
                  <CarouselPrevious className="static transform-none" />
                  <span className="flex items-center text-sm">
                    {currentIndex + 1} of {images.length}
                  </span>
                  <CarouselNext className="static transform-none" />
                </div>
              </Carousel>
              
              <div className="grid grid-cols-5 gap-2">
                {images.map((image, index) => (
                  <div
                    key={image.id}
                    className={cn(
                      "border rounded-md overflow-hidden cursor-pointer transition-all duration-200",
                      index === currentIndex ? "ring-2 ring-primary" : "",
                    )}
                    onClick={() => setCurrentIndex(index)}
                  >
                    <div className="relative aspect-square">
                      <img
                        src={image.url}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {image.isAnnotated && (
                        <div className="absolute bottom-0 right-0 bg-yellow-500 text-white rounded-tl-md p-0.5">
                          <Pencil className="h-3 w-3" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Image Annotator Dialog */}
      {currentImage && (
        <ImageAnnotator
          open={annotatorOpen}
          onOpenChange={setAnnotatorOpen}
          imageId={currentImage.id}
          projectId={projectId}
          imageUrl={currentImage.url}
          description={currentImage.description}
          annotations={currentImage.annotations}
        />
      )}
    </>
  );
}