import React from 'react';
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AllocationMethod,
  findBestTemplate,
  generateInputsFromTemplate,
  generateWeightageFromTemplate
} from './AllocationTemplates';

interface SmartRecommendButtonProps {
  budgetItem: {
    id: number;
    code: string;
    description: string;
    category: string;
    subCategory: string;
  };
  coreRatios: any[];
  derivedRatios: any[];
  entities: any[];
  onRatioSelect: (ratioId: string) => void;
  onMethodChange: (method: 'ratio_based' | 'input_based' | 'weightage_based') => void;
  onInputsGenerated: (inputs: any[]) => void;
  onWeightageGenerated: (weightage: any) => void;
  size?: 'default' | 'sm' | 'lg';
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
}

const SmartRecommendButton: React.FC<SmartRecommendButtonProps> = ({
  budgetItem,
  coreRatios,
  derivedRatios,
  entities,
  onRatioSelect,
  onMethodChange,
  onInputsGenerated,
  onWeightageGenerated,
  size = 'sm',
  variant = 'outline'
}) => {
  const { toast } = useToast();
  const allRatios = [...coreRatios, ...derivedRatios];

  const applyBestTemplate = () => {
    // Find the best template based on budget item metadata
    const template = findBestTemplate(
      budgetItem.category,
      budgetItem.subCategory,
      budgetItem.description
    );
    
    if (!template) {
      toast({
        title: "No suitable template found",
        description: "We couldn't find a specific template for this budget item type.",
        variant: "destructive"
      });
      return;
    }
    
    // Display a preview of the template
    toast({
      title: `Applying "${template.name}"`,
      description: template.description,
    });
    
    // Set the proper allocation method based on template recommendation
    const method = template.primaryMethod;
    onMethodChange(method as 'ratio_based' | 'input_based' | 'weightage_based');
    
    // Find most appropriate ratio
    let bestRatio: any = null;
    
    // Find a ratio that matches one of the recommended types in the template
    if (template.recommendedRatios && template.recommendedRatios.length > 0 && method === 'ratio_based') {
      for (const ratioType of template.recommendedRatios) {
        // Search core ratios first
        const matchingCoreRatio = coreRatios.find(r => 
          r.ratioType?.toLowerCase() === ratioType.toLowerCase() || 
          r.name.toLowerCase().includes(ratioType.toLowerCase().replace('_', ' '))
        );
        
        if (matchingCoreRatio) {
          bestRatio = matchingCoreRatio;
          break;
        }
        
        // Then check derived ratios
        const matchingDerivedRatio = derivedRatios.find(r => 
          r.ratioType?.toLowerCase() === ratioType.toLowerCase() || 
          r.name.toLowerCase().includes(ratioType.toLowerCase().replace('_', ' '))
        );
        
        if (matchingDerivedRatio) {
          bestRatio = matchingDerivedRatio;
          break;
        }
      }
    }
    
    // Update with the found ratio if any
    if (bestRatio && method === 'ratio_based') {
      onRatioSelect(bestRatio.id.toString());
    }
    
    // For input-based method, generate recommended inputs
    if (method === 'input_based' && template.recommendedInputs && template.recommendedInputs.length > 0) {
      // Generate input templates
      const generatedInputs = generateInputsFromTemplate(template);
      
      if (generatedInputs.length > 0) {
        // Prepare default values for each entity in each input
        const inputsWithDefaults = generatedInputs.map(input => {
          const defaultValues: Record<number, string> = {};
          entities.forEach(entity => {
            defaultValues[entity.id] = '0';
          });
          return {
            ...input, 
            values: defaultValues
          };
        });
        
        // Update allocation with generated inputs
        onInputsGenerated(inputsWithDefaults);
        
        toast({
          title: "Inputs Generated",
          description: `Added ${inputsWithDefaults.length} input types based on the template. Please fill in the values.`,
        });
      }
    }
    
    // For weightage-based method, generate initial weightage
    if (method === 'weightage_based') {
      const weightage = generateWeightageFromTemplate(template);
      
      // Initialize default weightage values (1 for each entity)
      const defaultValues: Record<number, string> = {};
      entities.forEach(entity => {
        defaultValues[entity.id] = '1';
      });
      weightage.weightageValues = defaultValues;
      
      // Update allocation with generated weightage
      onWeightageGenerated(weightage);
      
      toast({
        title: "Weightage Generated",
        description: `Created weightage based on the template. Adjust values as needed.`,
      });
    }
  };
  
  return (
    <Button
      variant={variant}
      size={size}
      onClick={applyBestTemplate}
      className="gap-1 text-xs"
    >
      <Sparkles className="h-3.5 w-3.5" />
      Smart Recommend
    </Button>
  );
};

export default SmartRecommendButton;