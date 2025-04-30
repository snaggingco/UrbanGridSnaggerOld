import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { useRef } from "react";

// @ts-ignore
import ReactToPrint from "react-to-print";

interface PrintButtonProps {
  contentRef: React.RefObject<HTMLDivElement>;
}

export function PrintButton({ contentRef }: PrintButtonProps) {
  return (
    // @ts-ignore
    <ReactToPrint
      trigger={() => (
        <Button variant="outline">
          <Printer className="h-4 w-4 mr-1" /> Print
        </Button>
      )}
      content={() => contentRef.current}
    />
  );
}