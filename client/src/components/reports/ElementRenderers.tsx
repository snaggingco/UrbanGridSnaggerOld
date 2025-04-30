import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload, Image as ImageIcon, X } from "lucide-react";
import { ReportElement, UpdateElementHandler } from "./types";

interface ElementEditorProps {
  element: ReportElement;
  sectionId: string;
  updateElement: UpdateElementHandler;
}

// Base element rendering for preview mode
export function renderPreviewElement(element: ReportElement): React.ReactNode {
  switch (element.type) {
    case "header":
      return <h2 className="text-xl font-bold mb-4">{element.content || element.title || "Header"}</h2>;
      
    case "title":
      return <h3 className="text-lg font-semibold mb-3">{element.content || element.title || "Title"}</h3>;
      
    case "text":
      return <div className="prose mb-4">{element.content || "Text content goes here"}</div>;
      
    case "divider":
      return <hr className="my-4 border-t-2" />;
      
    case "image":
      return element.imageUrl ? (
        <div className="mb-4">
          <img src={element.imageUrl} alt={element.title || "Image"} className="max-w-full rounded-md" />
          {element.title && <p className="text-sm text-gray-500 mt-1">{element.title}</p>}
        </div>
      ) : (
        <div className="bg-gray-100 p-8 flex items-center justify-center rounded-md mb-4">
          <ImageIcon className="h-8 w-8 text-gray-400" />
        </div>
      );
      
    case "defect-list":
      return (
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">{element.title || "Defects"}</h3>
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="text-gray-500">Defect list will be generated from project defects</p>
          </div>
        </div>
      );
      
    case "table":
      return (
        <div className="mb-4">
          <h3 className="text-md font-semibold mb-2">{element.title || "Table"}</h3>
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="text-gray-500">Table content will appear here</p>
          </div>
        </div>
      );
      
    case "chart":
      return (
        <div className="mb-4">
          <h3 className="text-md font-semibold mb-2">{element.title || "Chart"}</h3>
          <div className="bg-gray-50 h-40 flex items-center justify-center rounded-md">
            <p className="text-gray-500">Chart will be generated here</p>
          </div>
        </div>
      );
      
    case "signature":
      return (
        <div className="mb-4">
          <h3 className="text-sm font-semibold mb-1">{element.title || "Signature"}</h3>
          <div className="border-b-2 w-48 h-24 flex items-center justify-center border-gray-300">
            <p className="text-gray-400">Signature area</p>
          </div>
        </div>
      );
      
    case "logo":
      return (
        <div className="mb-4 flex justify-center">
          <div className="h-16 w-48 bg-gray-100 flex items-center justify-center rounded-md">
            <p className="text-gray-500">Company Logo</p>
          </div>
        </div>
      );
      
    case "client-info":
      return (
        <div className="mb-4 p-3 border rounded-md">
          <h3 className="text-md font-semibold mb-2">Client Information</h3>
          <div className="text-sm">
            <p><strong>Name:</strong> Client Name</p>
            <p><strong>Email:</strong> client@example.com</p>
            <p><strong>Phone:</strong> +971 50 123 4567</p>
          </div>
        </div>
      );
      
    case "project-info":
      return (
        <div className="mb-4 p-3 border rounded-md">
          <h3 className="text-md font-semibold mb-2">Project Information</h3>
          <div className="text-sm">
            <p><strong>Property Type:</strong> Apartment</p>
            <p><strong>Location:</strong> Dubai Marina</p>
            <p><strong>Inspection Date:</strong> April 15, 2023</p>
          </div>
        </div>
      );
      
    case "inspection-summary":
      return (
        <div className="mb-4 p-3 border rounded-md">
          <h3 className="text-md font-semibold mb-2">Inspection Summary</h3>
          <div className="text-sm">
            <p><strong>Total Defects:</strong> 24</p>
            <p><strong>Critical Issues:</strong> 3</p>
            <p><strong>Major Issues:</strong> 8</p>
            <p><strong>Minor Issues:</strong> 13</p>
          </div>
        </div>
      );
      
    case "page-break":
      return <div className="border-t-2 border-dashed my-8 pt-2 text-center text-sm text-gray-400">Page Break</div>;
      
    case "location-section":
      return (
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">{element.title || "Location"}</h3>
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="text-gray-500">Location defects will be displayed here</p>
          </div>
        </div>
      );
      
    case "image-gallery":
      return (
        <div className="mb-4">
          <h3 className="text-md font-semibold mb-2">{element.title || "Image Gallery"}</h3>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-100 p-8 flex items-center justify-center rounded-md">
                <ImageIcon className="h-6 w-6 text-gray-400" />
              </div>
            ))}
          </div>
        </div>
      );
      
    default:
      return <div>Unknown element type: {element.type}</div>;
  }
}

// Header Element Editor
export function HeaderElementEditor({ element, sectionId, updateElement }: ElementEditorProps) {
  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor="header-title">Header Text</Label>
        <Input
          id="header-title"
          value={element.content || ""}
          onChange={(e) => updateElement(sectionId, element.id, { content: e.target.value })}
          placeholder="Enter header text"
        />
      </div>
      <div>
        <Label htmlFor="header-size">Size</Label>
        <select
          id="header-size"
          className="w-full p-2 border rounded-md"
          value={element.options?.size || "large"}
          onChange={(e) => updateElement(sectionId, element.id, { 
            options: { ...element.options, size: e.target.value } 
          })}
        >
          <option value="large">Large</option>
          <option value="medium">Medium</option>
          <option value="small">Small</option>
        </select>
      </div>
    </div>
  );
}

// Text Element Editor
export function TextElementEditor({ element, sectionId, updateElement }: ElementEditorProps) {
  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor="text-content">Text Content</Label>
        <Textarea
          id="text-content"
          value={element.content || ""}
          onChange={(e) => updateElement(sectionId, element.id, { content: e.target.value })}
          placeholder="Enter text content"
          rows={4}
        />
      </div>
    </div>
  );
}

// Image Element Editor
export function ImageElementEditor({ element, sectionId, updateElement }: ElementEditorProps) {
  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor="image-title">Image Caption</Label>
        <Input
          id="image-title"
          value={element.title || ""}
          onChange={(e) => updateElement(sectionId, element.id, { title: e.target.value })}
          placeholder="Enter image caption"
        />
      </div>
      
      <div>
        <Label>Image</Label>
        {element.imageUrl ? (
          <div className="relative mt-2">
            <img src={element.imageUrl} alt={element.title || "Image"} className="max-w-full h-auto rounded-md" />
            <button
              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
              onClick={() => updateElement(sectionId, element.id, { imageUrl: undefined })}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="mt-2">
            <Button variant="outline" className="w-full h-32 flex flex-col items-center justify-center border-dashed">
              <Upload className="h-8 w-8 mb-2 text-gray-400" />
              <span className="text-sm text-gray-500">Upload Image</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// Defect List Element Editor
export function DefectListElementEditor({ element, sectionId, updateElement }: ElementEditorProps) {
  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor="defect-title">Title</Label>
        <Input
          id="defect-title"
          value={element.title || ""}
          onChange={(e) => updateElement(sectionId, element.id, { title: e.target.value })}
          placeholder="Defect List Title"
        />
      </div>
      <div>
        <Label htmlFor="defect-filter">Filter by</Label>
        <select
          id="defect-filter"
          className="w-full p-2 border rounded-md"
          value={element.options?.filter || "all"}
          onChange={(e) => updateElement(sectionId, element.id, { 
            options: { ...element.options, filter: e.target.value } 
          })}
        >
          <option value="all">All Defects</option>
          <option value="critical">Critical Only</option>
          <option value="major">Major Only</option>
          <option value="minor">Minor Only</option>
        </select>
      </div>
      <div className="flex items-center space-x-2">
        <input
          id="show-images"
          type="checkbox"
          checked={element.options?.showImages !== false}
          onChange={(e) => updateElement(sectionId, element.id, { 
            options: { ...element.options, showImages: e.target.checked } 
          })}
        />
        <Label htmlFor="show-images">Include Images</Label>
      </div>
    </div>
  );
}

// Map default renderers to element types
export function getElementEditor(element: ReportElement, sectionId: string, updateElement: UpdateElementHandler) {
  switch (element.type) {
    case "header":
    case "title":
      return <HeaderElementEditor element={element} sectionId={sectionId} updateElement={updateElement} />;
    
    case "text":
      return <TextElementEditor element={element} sectionId={sectionId} updateElement={updateElement} />;
    
    case "image":
      return <ImageElementEditor element={element} sectionId={sectionId} updateElement={updateElement} />;
    
    case "defect-list":
      return <DefectListElementEditor element={element} sectionId={sectionId} updateElement={updateElement} />;
    
    default:
      return (
        <div className="p-4 bg-gray-50 rounded-md">
          <p className="text-gray-500">Configure {element.type} properties</p>
        </div>
      );
  }
}