import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GripVertical, X, ChevronDown, ChevronUp, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { ReportElement, UpdateElementHandler, DeleteElementHandler } from "./types";

interface DraggableElementProps {
  element: ReportElement;
  sectionId: string;
  updateElement: UpdateElementHandler;
  deleteElement: DeleteElementHandler;
  renderElementContent: (element: ReportElement) => React.ReactNode;
  previewMode?: boolean;
}

export function DraggableElement({
  element,
  sectionId,
  updateElement,
  deleteElement,
  renderElementContent,
  previewMode = false,
}: DraggableElementProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: element.id,
    data: {
      type: element.type,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: "relative" as const,
  };

  if (previewMode) {
    return element.visible !== false ? (
      <div className="report-element">{renderElementContent(element)}</div>
    ) : null;
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="mb-3 overflow-hidden border-2 group hover:border-blue-200"
    >
      <div className="bg-gray-50 flex items-center justify-between p-2 border-b">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            className="cursor-grab"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium text-gray-600">
            {element.title || getElementTypeTitle(element.type)}
          </span>
        </div>
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => updateElement(sectionId, element.id, { visible: element.visible === false ? true : false })}
            title={element.visible === false ? "Show" : "Hide"}
          >
            {element.visible === false ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => deleteElement(sectionId, element.id)}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {isExpanded && (
        <CardContent className="p-3">
          {renderElementContent(element)}
        </CardContent>
      )}
    </Card>
  );
}

function getElementTypeTitle(type: string): string {
  // Convert camelCase or kebab-case to Title Case
  return type
    .replace(/-/g, " ")
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase());
}