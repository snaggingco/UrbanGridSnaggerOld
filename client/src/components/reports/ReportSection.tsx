import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { ChevronDown, ChevronUp, GripVertical, Trash2, Eye, EyeOff, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DraggableElement } from "./DraggableElement";
import { ReportElement, ReportSection as ReportSectionType, UpdateSectionHandler, UpdateElementHandler, DeleteElementHandler, AddElementHandler } from "./types";

interface ReportSectionProps {
  section: ReportSectionType;
  updateSection: UpdateSectionHandler;
  updateElement: UpdateElementHandler;
  deleteElement: DeleteElementHandler;
  deleteSection: (sectionId: string) => void;
  addElement: AddElementHandler;
  renderElementContent: (element: ReportElement) => React.ReactNode;
  previewMode?: boolean;
}

export function ReportSection({ 
  section, 
  updateSection, 
  updateElement, 
  deleteElement, 
  deleteSection,
  addElement, 
  renderElementContent, 
  previewMode = false 
}: ReportSectionProps) {
  const [isExpanded, setIsExpanded] = useState(!section.collapsed);
  const elementIds = section.elements.map(element => element.id);

  const { setNodeRef } = useDroppable({
    id: section.id,
    data: {
      type: 'section',
      section,
      accepts: ['header', 'text', 'image', 'defect-list', 'table', 'chart', 'divider', 'signature', 'client-info', 'project-info', 'inspection-summary', 'location-section', 'image-gallery', 'page-break'],
    },
  });

  if (previewMode) {
    if (section.visible === false) return null;
    
    return (
      <div className="mb-6">
        {section.title && <h2 className="text-xl font-bold mb-4">{section.title}</h2>}
        {section.description && <p className="text-gray-600 mb-4">{section.description}</p>}
        <div className="space-y-4">
          {section.elements
            .filter(element => element.visible !== false)
            .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
            .map(element => (
              <DraggableElement
                key={element.id}
                element={element}
                sectionId={section.id}
                updateElement={updateElement}
                deleteElement={deleteElement}
                renderElementContent={renderElementContent}
                previewMode={true}
              />
            ))}
        </div>
      </div>
    );
  }

  return (
    <Card className="mb-6 border-2">
      <CardHeader className="bg-gray-50 p-3 flex flex-row items-center justify-between cursor-pointer border-b" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center">
          <Button variant="ghost" size="sm" className="cursor-grab mr-2" title="Drag to reorder">
            <GripVertical className="h-4 w-4" />
          </Button>
          <h3 className="text-md font-semibold">{section.title}</h3>
        </div>
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              updateSection(section.id, { visible: section.visible === false ? true : false });
            }}
            title={section.visible === false ? "Show section" : "Hide section"}
          >
            {section.visible === false ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              deleteSection(section.id);
            }}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
            title="Delete section"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent className="p-4">
          {section.description && (
            <div className="mb-4">
              <p className="text-sm text-gray-600">{section.description}</p>
            </div>
          )}
          <div ref={setNodeRef} className="min-h-[100px] pb-2">
            {section.elements.length === 0 ? (
              <div className="border-2 border-dashed border-gray-200 rounded-md p-6 text-center">
                <p className="text-gray-400 mb-2">Drag and drop elements here</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    const newElement: ReportElement = {
                      id: `el-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                      type: 'text',
                      content: 'Click to edit this text block',
                      sortOrder: 0
                    };
                    addElement(section.id, newElement);
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Text Block
                </Button>
              </div>
            ) : (
              <SortableContext items={elementIds} strategy={verticalListSortingStrategy}>
                {section.elements
                  .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
                  .map(element => (
                    <DraggableElement
                      key={element.id}
                      element={element}
                      sectionId={section.id}
                      updateElement={updateElement}
                      deleteElement={deleteElement}
                      renderElementContent={renderElementContent}
                    />
                  ))
                }
              </SortableContext>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}