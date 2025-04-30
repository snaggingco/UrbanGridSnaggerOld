import { useState, useCallback, useRef } from "react";
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  UniqueIdentifier
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { nanoid } from "nanoid";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, Save, Eye, Printer, Plus, Settings } from "lucide-react";
import { ReportSection } from "./ReportSection";
import { ReportElementSelector } from "./ReportElementSelector";
import { getElementEditor, renderPreviewElement } from "./ElementRenderers";
import { 
  ReportTemplate, 
  ReportElement, 
  ReportSection as ReportSectionType, 
  ReportElementType
} from "./types";
import { PrintButton } from "./PrintButton";

interface ReportBuilderProps {
  template: ReportTemplate;
  onSave: (template: ReportTemplate) => void;
  onBack: () => void;
  projectId?: number;
}

export function ReportBuilder({ template, onSave, onBack, projectId }: ReportBuilderProps) {
  const [reportTemplate, setReportTemplate] = useState<ReportTemplate>(template);
  const [activeTab, setActiveTab] = useState<string>("edit");
  const [activeElement, setActiveElement] = useState<{ sectionId: string; elementId: string } | null>(null);
  
  const printRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Update template basic info
  const updateTemplateInfo = (updates: Partial<ReportTemplate>) => {
    setReportTemplate(prev => ({ ...prev, ...updates }));
  };

  // Add a new section to the report
  const addSection = () => {
    const newSection: ReportSectionType = {
      id: `section-${nanoid(6)}`,
      title: "New Section",
      elements: [],
      sortOrder: reportTemplate.sections.length
    };
    
    setReportTemplate(prev => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }));
  };

  // Update a specific section
  const updateSection = useCallback((sectionId: string, updates: Partial<ReportSectionType>) => {
    setReportTemplate(prev => ({
      ...prev,
      sections: prev.sections.map(section => 
        section.id === sectionId ? { ...section, ...updates } : section
      )
    }));
  }, []);

  // Delete a section
  const deleteSection = useCallback((sectionId: string) => {
    setReportTemplate(prev => ({
      ...prev,
      sections: prev.sections.filter(section => section.id !== sectionId)
    }));
    if (activeElement?.sectionId === sectionId) {
      setActiveElement(null);
    }
  }, [activeElement]);

  // Add a new element to a section
  const addElement = useCallback((sectionId: string, element: ReportElement) => {
    setReportTemplate(prev => ({
      ...prev,
      sections: prev.sections.map(section => {
        if (section.id === sectionId) {
          const maxSortOrder = Math.max(0, ...section.elements.map(el => el.sortOrder || 0));
          return {
            ...section,
            elements: [...section.elements, { 
              ...element, 
              sortOrder: element.sortOrder ?? maxSortOrder + 1
            }]
          };
        }
        return section;
      })
    }));
    setActiveElement({ sectionId, elementId: element.id });
  }, []);

  // Update a specific element
  const updateElement = useCallback((sectionId: string, elementId: string, updates: Partial<ReportElement>) => {
    setReportTemplate(prev => ({
      ...prev,
      sections: prev.sections.map(section => {
        if (section.id === sectionId) {
          return {
            ...section,
            elements: section.elements.map(element => 
              element.id === elementId ? { ...element, ...updates } : element
            )
          };
        }
        return section;
      })
    }));
  }, []);

  // Delete an element
  const deleteElement = useCallback((sectionId: string, elementId: string) => {
    setReportTemplate(prev => ({
      ...prev,
      sections: prev.sections.map(section => {
        if (section.id === sectionId) {
          return {
            ...section,
            elements: section.elements.filter(element => element.id !== elementId)
          };
        }
        return section;
      })
    }));
    if (activeElement?.elementId === elementId) {
      setActiveElement(null);
    }
  }, [activeElement]);

  // Create a new element when selected from the sidebar
  const handleSelectElement = useCallback((type: ReportElementType) => {
    if (reportTemplate.sections.length === 0) {
      // If no sections exist, create one first
      const newSectionId = `section-${nanoid(6)}`;
      const newSection: ReportSectionType = {
        id: newSectionId,
        title: "New Section",
        elements: [],
        sortOrder: 0
      };
      
      const newElement: ReportElement = {
        id: `element-${nanoid(6)}`,
        type,
        sortOrder: 0
      };
      
      setReportTemplate(prev => ({
        ...prev,
        sections: [...prev.sections, {
          ...newSection,
          elements: [newElement]
        }]
      }));
      
      setActiveElement({ sectionId: newSectionId, elementId: newElement.id });
    } else {
      // Add to the first section by default
      const targetSectionId = reportTemplate.sections[0].id;
      const newElement: ReportElement = {
        id: `element-${nanoid(6)}`,
        type,
        sortOrder: reportTemplate.sections[0].elements.length
      };
      
      addElement(targetSectionId, newElement);
    }
  }, [reportTemplate.sections, addElement]);

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeId = active.id.toString();
    
    // Find which section contains this element
    for (const section of reportTemplate.sections) {
      const foundElement = section.elements.find(el => el.id === activeId);
      if (foundElement) {
        setActiveElement({ sectionId: section.id, elementId: activeId });
        break;
      }
    }
  };

  // Handle drag over
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;
    
    const activeId = active.id.toString();
    const overId = over.id.toString();
    
    // Skip if nothing has changed
    if (activeId === overId) return;
    
    // Check if we're dragging a new element from the palette
    const isNewElementDrag = active.data?.current?.isNew;
    if (isNewElementDrag) return; // This will be handled in handleDragEnd
    
    // Get current active element data
    if (!activeElement) return;
    
    const { sectionId: activeContainerId, elementId } = activeElement;
    
    // Find the section that contains the over element
    let overContainer: string | null = null;
    let isOverContainer = false;
    
    // Check if dropping over a section
    const isSection = reportTemplate.sections.some(s => s.id === overId);
    if (isSection) {
      overContainer = overId;
      isOverContainer = true;
    } else {
      // Find which section contains the element we're hovering over
      for (const section of reportTemplate.sections) {
        if (section.elements.some(el => el.id === overId)) {
          overContainer = section.id;
          break;
        }
      }
    }
    
    if (!overContainer) return;
    
    // Skip if dropping in the same container and not over a container
    if (activeContainerId === overContainer && !isOverContainer) return;
    
    // If we're moving between containers
    if (activeContainerId !== overContainer) {
      setReportTemplate(prev => {
        // Find source and destination sections
        const sourceSection = prev.sections.find(s => s.id === activeContainerId)!;
        const destSection = prev.sections.find(s => s.id === overContainer)!;
        
        // Find the element being moved
        const elementToMove = sourceSection.elements.find(el => el.id === elementId)!;
        
        // Create new source elements without the moved element
        const newSourceElements = sourceSection.elements.filter(el => el.id !== elementId);
        
        // Create new destination elements with the moved element
        let newDestElements;
        if (isOverContainer) {
          // If dropping directly on a container, add to the end
          newDestElements = [...destSection.elements, { ...elementToMove, sortOrder: destSection.elements.length }];
        } else {
          // If dropping on an element, insert at that position
          const overElementIndex = destSection.elements.findIndex(el => el.id === overId);
          newDestElements = [...destSection.elements];
          newDestElements.splice(overElementIndex, 0, { ...elementToMove, sortOrder: overElementIndex });
          // Update sort orders
          newDestElements = newDestElements.map((el, idx) => ({ ...el, sortOrder: idx }));
        }
        
        // Return updated template
        return {
          ...prev,
          sections: prev.sections.map(section => {
            if (section.id === activeContainerId) {
              return { ...section, elements: newSourceElements };
            }
            if (section.id === overContainer) {
              return { ...section, elements: newDestElements };
            }
            return section;
          })
        };
      });
      
      // Update the active element tracking
      setActiveElement({ sectionId: overContainer, elementId });
    }
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const activeId = active.id.toString();
    const overId = over.id.toString();
    
    // Check if we're dragging a new element from the palette
    const isNewElementDrag = active.data?.current?.isNew;
    const elementType = active.data?.current?.type as ReportElementType | undefined;
    
    if (isNewElementDrag && elementType) {
      // Find which section we're dropping on
      let targetSectionId: string | null = null;
      
      // Check if we're dropping on a section directly
      const isSection = reportTemplate.sections.some(s => s.id === overId);
      if (isSection) {
        targetSectionId = overId;
      } else {
        // Check if we're dropping on an element
        for (const section of reportTemplate.sections) {
          if (section.elements.some(el => el.id === overId)) {
            targetSectionId = section.id;
            break;
          }
        }
      }
      
      if (targetSectionId) {
        // Create the new element
        const newElement: ReportElement = {
          id: `element-${nanoid(6)}`,
          type: elementType,
          sortOrder: reportTemplate.sections.find(s => s.id === targetSectionId)?.elements.length || 0
        };
        
        addElement(targetSectionId, newElement);
      }
      
      return;
    }
    
    // For reordering elements within the same section
    if (activeElement && activeId !== overId) {
      const { sectionId } = activeElement;
      
      setReportTemplate(prev => {
        const section = prev.sections.find(s => s.id === sectionId)!;
        const oldIndex = section.elements.findIndex(el => el.id === activeId);
        const newIndex = section.elements.findIndex(el => el.id === overId);
        
        if (oldIndex !== -1 && newIndex !== -1) {
          const reorderedElements = arrayMove(section.elements, oldIndex, newIndex)
            .map((el, idx) => ({ ...el, sortOrder: idx }));
          
          return {
            ...prev,
            sections: prev.sections.map(s => 
              s.id === sectionId ? { ...s, elements: reorderedElements } : s
            )
          };
        }
        
        return prev;
      });
    }
  };

  // Handle saving the template
  const handleSave = () => {
    const updatedTemplate = {
      ...reportTemplate,
      updatedAt: new Date()
    };
    onSave(updatedTemplate);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b p-4 flex justify-between items-center">
        <div className="flex items-center">
          <Button variant="ghost" onClick={onBack} className="mr-2">
            <ChevronLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <div>
            <h1 className="text-xl font-bold">Report Template Editor</h1>
            <p className="text-sm text-gray-500">
              {activeTab === "edit" ? "Edit your report template" : activeTab === "preview" ? "Preview report" : "Settings"}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
            <TabsList>
              <TabsTrigger value="edit">Edit</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-1" /> Save
          </Button>
          <PrintButton contentRef={printRef} />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow overflow-hidden">
        <TabsContent value="edit" className="m-0 h-full">
          <div className="flex h-full">
            {/* Left Sidebar - Elements Palette */}
            <div className="w-64 bg-gray-50 border-r p-4 overflow-y-auto">
              <ReportElementSelector onSelectElement={handleSelectElement} />
            </div>

            {/* Middle - Template Sections and Elements */}
            <div className="flex-1 p-4 overflow-y-auto">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
              >
                <div className="mb-4 flex justify-between items-center">
                  <Input
                    value={reportTemplate.name}
                    onChange={(e) => updateTemplateInfo({ name: e.target.value })}
                    placeholder="Template Name"
                    className="max-w-md"
                  />
                  <Button onClick={addSection}>
                    <Plus className="h-4 w-4 mr-1" /> Add Section
                  </Button>
                </div>

                <div className="mb-4">
                  <Textarea
                    value={reportTemplate.description || ""}
                    onChange={(e) => updateTemplateInfo({ description: e.target.value })}
                    placeholder="Template Description"
                    rows={2}
                  />
                </div>

                {reportTemplate.sections.length === 0 ? (
                  <div className="text-center py-16 border-2 border-dashed rounded-md">
                    <p className="text-gray-400 mb-4">Your report template is empty</p>
                    <Button onClick={addSection}>
                      <Plus className="h-4 w-4 mr-1" /> Add Section
                    </Button>
                  </div>
                ) : (
                  reportTemplate.sections
                    .sort((a, b) => a.sortOrder - b.sortOrder)
                    .map(section => (
                      <ReportSection
                        key={section.id}
                        section={section}
                        updateSection={updateSection}
                        updateElement={updateElement}
                        deleteElement={deleteElement}
                        deleteSection={deleteSection}
                        addElement={addElement}
                        renderElementContent={(element) => getElementEditor(element, section.id, updateElement)}
                      />
                    ))
                )}
              </DndContext>
            </div>

            {/* Right Sidebar - Properties */}
            <div className="w-72 bg-gray-50 border-l p-4 overflow-y-auto">
              <h3 className="text-md font-medium mb-3">Properties</h3>
              {activeElement ? (
                <div>
                  <p className="text-sm text-gray-500 mb-4">
                    Configure the selected element
                  </p>
                  {(() => {
                    const section = reportTemplate.sections.find(s => s.id === activeElement.sectionId);
                    const element = section?.elements.find(e => e.id === activeElement.elementId);
                    if (section && element) {
                      return getElementEditor(element, section.id, updateElement);
                    }
                    return <p>Select an element to edit its properties</p>;
                  })()}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  Select an element to edit its properties
                </p>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="m-0 h-full overflow-auto">
          <div className="max-w-3xl mx-auto bg-white p-8 shadow-sm" ref={printRef}>
            <div className="mb-6">
              <h1 className="text-2xl font-bold">{reportTemplate.name}</h1>
              {reportTemplate.description && <p className="text-gray-600 mt-2">{reportTemplate.description}</p>}
            </div>
            
            {reportTemplate.sections
              .filter(section => section.visible !== false)
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map(section => (
                <ReportSection
                  key={section.id}
                  section={section}
                  updateSection={updateSection}
                  updateElement={updateElement}
                  deleteElement={deleteElement}
                  deleteSection={deleteSection}
                  addElement={addElement}
                  renderElementContent={renderPreviewElement}
                  previewMode={true}
                />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="m-0 h-full overflow-auto">
          <div className="max-w-3xl mx-auto p-6">
            <Card className="mb-6">
              <div className="p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                  <Settings className="h-5 w-5 mr-2" /> Report Settings
                </h2>
                
                <div className="space-y-6">
                  {/* Branding Settings */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Branding</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="companyName">Company Name</Label>
                        <Input 
                          id="companyName" 
                          value={reportTemplate.settings.branding.companyName || ""} 
                          onChange={(e) => setReportTemplate(prev => ({
                            ...prev,
                            settings: {
                              ...prev.settings,
                              branding: {
                                ...prev.settings.branding,
                                companyName: e.target.value
                              }
                            }
                          }))}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="primaryColor">Primary Color</Label>
                        <div className="flex">
                          <input 
                            type="color" 
                            id="primaryColor" 
                            value={reportTemplate.settings.branding.primaryColor || "#2563eb"} 
                            onChange={(e) => setReportTemplate(prev => ({
                              ...prev,
                              settings: {
                                ...prev.settings,
                                branding: {
                                  ...prev.settings.branding,
                                  primaryColor: e.target.value
                                }
                              }
                            }))}
                            className="w-12 h-10 p-0 border rounded mr-2"
                          />
                          <Input 
                            value={reportTemplate.settings.branding.primaryColor || "#2563eb"} 
                            onChange={(e) => setReportTemplate(prev => ({
                              ...prev,
                              settings: {
                                ...prev.settings,
                                branding: {
                                  ...prev.settings.branding,
                                  primaryColor: e.target.value
                                }
                              }
                            }))}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Layout Settings */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Layout</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="pageSize">Page Size</Label>
                        <select 
                          id="pageSize"
                          className="w-full p-2 border rounded"
                          value={reportTemplate.settings.layout.pageSize || "A4"}
                          onChange={(e) => setReportTemplate(prev => ({
                            ...prev,
                            settings: {
                              ...prev.settings,
                              layout: {
                                ...prev.settings.layout,
                                pageSize: e.target.value as 'A4' | 'Letter' | 'Legal'
                              }
                            }
                          }))}
                        >
                          <option value="A4">A4</option>
                          <option value="Letter">Letter</option>
                          <option value="Legal">Legal</option>
                        </select>
                      </div>
                      
                      <div>
                        <Label htmlFor="orientation">Orientation</Label>
                        <select 
                          id="orientation"
                          className="w-full p-2 border rounded"
                          value={reportTemplate.settings.layout.orientation || "portrait"}
                          onChange={(e) => setReportTemplate(prev => ({
                            ...prev,
                            settings: {
                              ...prev.settings,
                              layout: {
                                ...prev.settings.layout,
                                orientation: e.target.value as 'portrait' | 'landscape'
                              }
                            }
                          }))}
                        >
                          <option value="portrait">Portrait</option>
                          <option value="landscape">Landscape</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  {/* Content Settings */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Content</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="fontFamily">Font Family</Label>
                        <select 
                          id="fontFamily"
                          className="w-full p-2 border rounded"
                          value={reportTemplate.settings.content.fontFamily || "default"}
                          onChange={(e) => setReportTemplate(prev => ({
                            ...prev,
                            settings: {
                              ...prev.settings,
                              content: {
                                ...prev.settings.content,
                                fontFamily: e.target.value
                              }
                            }
                          }))}
                        >
                          <option value="default">Default (System)</option>
                          <option value="arial">Arial</option>
                          <option value="times">Times New Roman</option>
                          <option value="calibri">Calibri</option>
                        </select>
                      </div>
                      
                      <div>
                        <Label htmlFor="fontSize">Base Font Size</Label>
                        <Input 
                          id="fontSize" 
                          type="number"
                          min="8"
                          max="24"
                          value={reportTemplate.settings.content.fontSize || 11} 
                          onChange={(e) => setReportTemplate(prev => ({
                            ...prev,
                            settings: {
                              ...prev.settings,
                              content: {
                                ...prev.settings.content,
                                fontSize: parseInt(e.target.value) || 11
                              }
                            }
                          }))}
                        />
                      </div>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <input 
                          type="checkbox" 
                          id="groupByLocation"
                          checked={reportTemplate.settings.content.groupByLocation === true}
                          onChange={(e) => setReportTemplate(prev => ({
                            ...prev,
                            settings: {
                              ...prev.settings,
                              content: {
                                ...prev.settings.content,
                                groupByLocation: e.target.checked
                              }
                            }
                          }))}
                        />
                        <Label htmlFor="groupByLocation">Group By Location</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <input 
                          type="checkbox" 
                          id="showSeverityIndicators"
                          checked={reportTemplate.settings.content.showSeverityIndicators !== false}
                          onChange={(e) => setReportTemplate(prev => ({
                            ...prev,
                            settings: {
                              ...prev.settings,
                              content: {
                                ...prev.settings.content,
                                showSeverityIndicators: e.target.checked
                              }
                            }
                          }))}
                        />
                        <Label htmlFor="showSeverityIndicators">Show Severity Indicators</Label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </div>
    </div>
  );
}