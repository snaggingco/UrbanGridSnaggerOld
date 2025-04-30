import { Button } from "@/components/ui/button";
import { useDraggable } from "@dnd-kit/core";
import { Copy, Type, Image, BarChart2, Scissors, Table2, FileText, Signature, Map, Layout, Layers, Grid } from "lucide-react";
import { ReportElementType } from "./types";

interface ElementSelectorProps {
  onSelectElement: (type: ReportElementType) => void;
}

interface DraggableButtonProps {
  children: React.ReactNode;
  title: string;
  icon: React.ReactNode;
  type: ReportElementType;
  onClick: () => void;
}

function DraggableButton({ children, icon, title, type, onClick }: DraggableButtonProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `new-${type}`,
    data: {
      type,
      isNew: true,
    },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 999,
      }
    : undefined;

  return (
    <Button
      ref={setNodeRef}
      size="sm"
      variant="outline"
      className="flex flex-col items-center justify-center h-24 w-full p-2 gap-1"
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      title={title}
    >
      <div className="text-lg">{icon}</div>
      <div className="text-xs font-medium">{children}</div>
    </Button>
  );
}

export function ReportElementSelector({ onSelectElement }: ElementSelectorProps) {
  const elementTypes: { type: ReportElementType; title: string; icon: React.ReactNode }[] = [
    { type: "header", title: "Section Header", icon: <Type /> },
    { type: "text", title: "Text Block", icon: <FileText /> },
    { type: "image", title: "Image", icon: <Image /> },
    { type: "defect-list", title: "Defect List", icon: <Copy /> },
    { type: "table", title: "Table", icon: <Table2 /> },
    { type: "chart", title: "Chart", icon: <BarChart2 /> },
    { type: "divider", title: "Divider", icon: <Scissors /> },
    { type: "signature", title: "Signature", icon: <Signature /> },
    { type: "client-info", title: "Client Information", icon: <Layout /> },
    { type: "project-info", title: "Project Information", icon: <Grid /> },
    { type: "location-section", title: "Location Section", icon: <Map /> },
    { type: "image-gallery", title: "Image Gallery", icon: <Layers /> },
    { type: "page-break", title: "Page Break", icon: <Scissors /> },
  ];

  return (
    <div className="p-4 bg-white rounded-md border">
      <h3 className="text-md font-medium mb-3">Report Elements</h3>
      <p className="text-sm text-gray-500 mb-4">Drag and drop elements to add them to your report</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {elementTypes.map((element) => (
          <DraggableButton
            key={element.type}
            type={element.type}
            title={element.title}
            icon={element.icon}
            onClick={() => onSelectElement(element.type)}
          >
            {element.title}
          </DraggableButton>
        ))}
      </div>
    </div>
  );
}