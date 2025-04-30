import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import UnifiedForm from "./UnifiedForm";

interface ExitFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ExitForm({ open, onOpenChange }: ExitFormProps) {
  const handleSuccess = () => {
    // Close the dialog after successful submission
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] p-8">
        <DialogHeader>
          <DialogTitle className="text-2xl font-normal text-gray-900">Don't miss out!</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-muted-foreground mb-8">
            Get a professional property inspection from Dubai's leading snagging company.
            Fill out the form below and we'll contact you shortly.
          </p>
          <UnifiedForm formType="exit" onSuccess={handleSuccess} />
        </div>
      </DialogContent>
    </Dialog>
  );
}