import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ArrowRightIcon,
  SearchIcon,
  FilterIcon,
  ClipboardListIcon,
  ArrowUpDownIcon,
  DollarSignIcon,
  InfoIcon,
  CheckCircle2Icon,
  XCircleIcon,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

// Import standardized types
import { SelectedBudgetItem, SharedAllocation, AllocationInput } from '@shared/ratio-types';

// Types
type ReraBudgetItem = {
  id: number;
  code: string;
  description: string;
  category: string;
  subCategory: string;
  isExcludable: boolean;
  notes: string | null;
};

type BudgetItemSelectionProps = {
  projectId: string | number | null;
  selectedBudgetItems: Record<number, SelectedBudgetItem>;
  onBudgetItemsChange: (items: Record<number, SelectedBudgetItem>) => void;
  onContinue: () => void;
  onBack: () => void;
};

const BudgetItemSelection: React.FC<BudgetItemSelectionProps> = ({
  projectId,
  selectedBudgetItems,
  onBudgetItemsChange,
  onContinue,
  onBack,
}) => {
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('');
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [currentBudgetItem, setCurrentBudgetItem] = useState<ReraBudgetItem | null>(null);
  const [budgetValueInput, setBudgetValueInput] = useState<string>('');
  const [sortBy, setSortBy] = useState<'code' | 'category'>('category');
  
  const { toast } = useToast();
  
  // Queries
  const { data: budgetItems = [], isLoading: isLoadingBudgetItems } = useQuery<ReraBudgetItem[]>({
    queryKey: ['/api/amc/budget-items'],
    enabled: !!projectId,
  });
  
  // Fetch categories for dropdown
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery<string[]>({
    queryKey: ['/api/amc/budget-items/categories'],
    enabled: !!projectId,
  });
  
  // Derive subcategories based on selected category
  const subcategories = selectedCategory 
    ? Array.from(new Set(budgetItems
        .filter(item => item.category === selectedCategory)
        .map(item => item.subCategory)))
    : [];
  
  // Filter budget items based on search and category/subcategory filters
  const filteredBudgetItems = budgetItems.filter(item => {
    const matchesSearch = searchQuery
      ? (item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
         item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
         item.category.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;
    
    const matchesCategory = selectedCategory
      ? item.category === selectedCategory
      : true;
    
    const matchesSubCategory = selectedSubCategory
      ? item.subCategory === selectedSubCategory
      : true;
    
    return matchesSearch && matchesCategory && matchesSubCategory;
  });
  
  // Group budget items by category and subcategory for accordion view
  const groupedBudgetItems = filteredBudgetItems.reduce((acc, item) => {
    // Handle null or undefined category
    const category = item.category || 'Uncategorized';
    // Handle null or undefined subCategory
    const subCategory = item.subCategory || 'General';
    
    if (!acc[category]) {
      acc[category] = {};
    }
    
    if (!acc[category][subCategory]) {
      acc[category][subCategory] = [];
    }
    
    acc[category][subCategory].push(item);
    return acc;
  }, {} as Record<string, Record<string, ReraBudgetItem[]>>);
  
  // Sorting for table view
  const sortedBudgetItems = [...filteredBudgetItems].sort((a, b) => {
    if (sortBy === 'code') {
      return a.code.localeCompare(b.code);
    }
    if (a.category === b.category) {
      // Handle null or undefined subCategory values
      const subCategoryA = a.subCategory || '';
      const subCategoryB = b.subCategory || '';
      return subCategoryA.localeCompare(subCategoryB);
    }
    // Handle null or undefined category values
    const categoryA = a.category || '';
    const categoryB = b.category || '';
    return categoryA.localeCompare(categoryB);
  });
  
  // Check if any budget items are selected
  const hasBudgetItemsSelected = Object.values(selectedBudgetItems).some(item => item.isSelected);
  const selectedCount = Object.values(selectedBudgetItems).filter(item => item.isSelected).length;
  
  // Event Handlers
  
  // Toggle budget item selection
  const toggleBudgetItem = (item: ReraBudgetItem) => {
    onBudgetItemsChange({
      ...selectedBudgetItems,
      [item.id]: {
        ...(selectedBudgetItems[item.id] || {
          budgetItemId: item.id,
          allocationMethod: 'ratio_based',
          allocations: [],
          allocationInputs: [], // Add required allocationInputs array
          isSelected: false,
          customRatios: {},
        }),
        isSelected: !(selectedBudgetItems[item.id]?.isSelected || false),
      },
    });
  };
  
  // Set budget value for a budget item
  const setBudgetValue = (itemId: number, value: string) => {
    onBudgetItemsChange({
      ...selectedBudgetItems,
      [itemId]: {
        ...(selectedBudgetItems[itemId] || {
          budgetItemId: itemId,
          allocationMethod: 'ratio_based',
          allocations: [],
          allocationInputs: [], // Add required allocationInputs array
          isSelected: true,
          customRatios: {},
        }),
        isSelected: true,
        budgetValue: value,
      },
    });
  };
  
  // Bulk select all items in a subcategory
  const selectAllInSubcategory = (category: string, subcategory: string) => {
    const newSelectedItems = { ...selectedBudgetItems };
    
    budgetItems
      .filter(item => {
        // Handle null or undefined values safely
        const itemCategory = item.category || 'Uncategorized';
        const itemSubCategory = item.subCategory || 'General';
        return itemCategory === category && itemSubCategory === subcategory;
      })
      .forEach(item => {
        newSelectedItems[item.id] = {
          ...(newSelectedItems[item.id] || {
            budgetItemId: item.id,
            allocationMethod: 'ratio_based',
            allocations: [],
            allocationInputs: [], // Add required allocationInputs array
            isSelected: false,
            customRatios: {},
          }),
          isSelected: true,
        };
      });
    
    onBudgetItemsChange(newSelectedItems);
    toast({
      title: "Items Selected",
      description: `All items in ${subcategory} subcategory have been selected.`,
    });
  };
  
  // Deselect all items in a subcategory
  const deselectAllInSubcategory = (category: string, subcategory: string) => {
    const newSelectedItems = { ...selectedBudgetItems };
    
    budgetItems
      .filter(item => {
        // Handle null or undefined values safely
        const itemCategory = item.category || 'Uncategorized';
        const itemSubCategory = item.subCategory || 'General';
        return itemCategory === category && itemSubCategory === subcategory;
      })
      .forEach(item => {
        if (newSelectedItems[item.id]) {
          newSelectedItems[item.id] = {
            ...newSelectedItems[item.id],
            isSelected: false,
          };
        }
      });
    
    onBudgetItemsChange(newSelectedItems);
    toast({
      title: "Items Deselected",
      description: `All items in ${subcategory} subcategory have been deselected.`,
    });
  };
  
  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedSubCategory('');
  };
  
  // Open details dialog
  const openDetailsDialog = (item: ReraBudgetItem) => {
    setCurrentBudgetItem(item);
    setBudgetValueInput(selectedBudgetItems[item.id]?.budgetValue || '');
    setDetailsDialogOpen(true);
  };
  
  // Save budget value from dialog
  const saveBudgetValue = () => {
    if (currentBudgetItem) {
      setBudgetValue(currentBudgetItem.id, budgetValueInput);
      setDetailsDialogOpen(false);
      toast({
        title: "Budget Value Updated",
        description: `Budget value for ${currentBudgetItem.code} has been updated.`,
      });
    }
  };
  
  // Toggle sort order
  const toggleSort = () => {
    setSortBy(sortBy === 'code' ? 'category' : 'code');
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-medium">3</div>
          <CardTitle>RERA Budget Line Items</CardTitle>
        </div>
        <CardDescription>
          Step 3: Select the budget line items that are relevant to your project
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoadingBudgetItems ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <>
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <Input
                  placeholder="Search by code, description or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <div className="flex gap-2">
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_categories">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select
                  value={selectedSubCategory}
                  onValueChange={setSelectedSubCategory}
                  disabled={!selectedCategory || subcategories.length === 0}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Subcategories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_subcategories">All Subcategories</SelectItem>
                    {subcategories.map(subCategory => (
                      <SelectItem key={subCategory} value={subCategory}>{subCategory}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Button variant="outline" onClick={clearFilters} disabled={!searchQuery && !selectedCategory && !selectedSubCategory}>
                  Clear
                </Button>
                
                <Button variant="outline" onClick={toggleSort}>
                  <ArrowUpDownIcon className="h-4 w-4 mr-2" />
                  Sort by {sortBy === 'code' ? 'Code' : 'Category'}
                </Button>
              </div>
            </div>
            
            {/* Selected items summary */}
            <div className="mb-4 p-4 bg-slate-50 rounded-md border">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium">Selected Items: {selectedCount}</h3>
                <Badge variant="secondary">{selectedCount} of {budgetItems.length} selected</Badge>
              </div>
              
              <div className="flex flex-wrap gap-2 max-h-[100px] overflow-y-auto">
                {Object.values(selectedBudgetItems)
                  .filter(item => item.isSelected)
                  .map(item => {
                    const budgetItem = budgetItems.find(bi => bi.id === item.budgetItemId);
                    return budgetItem ? (
                      <Badge key={budgetItem.id} variant="secondary" className="px-2 py-1 flex items-center gap-1">
                        <span className="font-medium">{budgetItem.code}</span>
                        <span className="max-w-[150px] truncate">{budgetItem.description}</span>
                        {item.budgetValue && (
                          <span className="text-emerald-600 ml-1">
                            ${parseFloat(item.budgetValue).toLocaleString()}
                          </span>
                        )}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-4 w-4 ml-1 text-slate-400 hover:text-slate-700"
                          onClick={() => toggleBudgetItem(budgetItem)}
                        >
                          <span className="sr-only">Remove</span>
                          ×
                        </Button>
                      </Badge>
                    ) : null;
                  })
                }
                
                {selectedCount === 0 && (
                  <p className="text-sm text-slate-500 italic">No items selected yet</p>
                )}
              </div>
            </div>
            
            {/* Budget items list */}
            <div className="border rounded-md overflow-hidden">
              <Accordion type="multiple" className="w-full">
                {Object.entries(groupedBudgetItems).map(([category, subcategories]) => (
                  <AccordionItem key={category} value={category}>
                    <AccordionTrigger className="px-4 hover:bg-slate-50">
                      <div className="flex justify-between items-center w-full">
                        <span>{category}</span>
                        <Badge variant="outline" className="mr-4">
                          {Object.values(subcategories).reduce((count, items) => count + items.length, 0)} items
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      {Object.entries(subcategories).map(([subcategory, items]) => (
                        <div key={subcategory} className="mb-4 last:mb-0">
                          <div className="flex justify-between items-center px-4 py-2 bg-slate-50">
                            <h4 className="text-sm font-medium">{subcategory}</h4>
                            <div className="flex gap-2">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => selectAllInSubcategory(category, subcategory)}
                                    >
                                      <CheckCircle2Icon className="h-4 w-4 text-emerald-500" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Select all in {subcategory}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => deselectAllInSubcategory(category, subcategory)}
                                    >
                                      <XCircleIcon className="h-4 w-4 text-red-500" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Deselect all in {subcategory}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </div>
                          
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-[80px]">Select</TableHead>
                                <TableHead className="w-[100px]">Code</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead className="w-[120px]">Budget Value</TableHead>
                                <TableHead className="w-[100px]">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {items.map((item) => (
                                <TableRow 
                                  key={item.id} 
                                  className={selectedBudgetItems[item.id]?.isSelected ? "bg-slate-50" : ""}
                                >
                                  <TableCell>
                                    <Checkbox
                                      checked={selectedBudgetItems[item.id]?.isSelected || false}
                                      onCheckedChange={() => toggleBudgetItem(item)}
                                    />
                                  </TableCell>
                                  <TableCell className="font-medium">{item.code}</TableCell>
                                  <TableCell>{item.description}</TableCell>
                                  <TableCell>
                                    {selectedBudgetItems[item.id]?.budgetValue ? (
                                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                                        ${parseFloat(selectedBudgetItems[item.id].budgetValue!).toLocaleString()}
                                      </Badge>
                                    ) : (
                                      <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">
                                        Not set
                                      </Badge>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex space-x-2">
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Button 
                                              variant="ghost" 
                                              size="icon"
                                              onClick={() => openDetailsDialog(item)}
                                            >
                                              <DollarSignIcon className="h-4 w-4 text-slate-700" />
                                            </Button>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>Set budget value</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                      
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Button 
                                              variant="ghost" 
                                              size="icon"
                                              onClick={() => {
                                                setCurrentBudgetItem(item);
                                                setDetailsDialogOpen(true);
                                              }}
                                            >
                                              <InfoIcon className="h-4 w-4 text-blue-500" />
                                            </Button>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>View details</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              
              {Object.keys(groupedBudgetItems).length === 0 && (
                <div className="text-center py-8">
                  <p className="text-slate-500">
                    {searchQuery || selectedCategory || selectedSubCategory 
                      ? 'No matching budget items found' 
                      : 'No budget items available'}
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back to Project Setup
        </Button>
        <Button onClick={onContinue} disabled={!hasBudgetItemsSelected}>
          Continue to Allocation
          <ArrowRightIcon className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
      
      {/* Budget value dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Budget Item Details</DialogTitle>
            <DialogDescription>
              View details and set budget value for this item
            </DialogDescription>
          </DialogHeader>
          
          {currentBudgetItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="font-medium">Code:</div>
                <div className="col-span-2">{currentBudgetItem.code}</div>
                
                <div className="font-medium">Description:</div>
                <div className="col-span-2">{currentBudgetItem.description}</div>
                
                <div className="font-medium">Category:</div>
                <div className="col-span-2">{currentBudgetItem.category}</div>
                
                <div className="font-medium">Sub-Category:</div>
                <div className="col-span-2">{currentBudgetItem.subCategory}</div>
                
                <div className="font-medium">Excludable:</div>
                <div className="col-span-2">
                  {currentBudgetItem.isExcludable ? 'Yes' : 'No'}
                </div>
                
                {currentBudgetItem.notes && (
                  <>
                    <div className="font-medium">Notes:</div>
                    <div className="col-span-2">{currentBudgetItem.notes}</div>
                  </>
                )}
              </div>
              
              <div className="space-y-2">
                <label htmlFor="budgetValue" className="text-sm font-medium">
                  Budget Value
                </label>
                <div className="relative">
                  <DollarSignIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <Input
                    id="budgetValue"
                    value={budgetValueInput}
                    onChange={(e) => {
                      // Only allow numbers and decimal point
                      const value = e.target.value.replace(/[^\d.]/g, '');
                      setBudgetValueInput(value);
                    }}
                    placeholder="Enter budget value"
                    className="pl-9"
                  />
                </div>
                <p className="text-xs text-slate-500">
                  This amount will be used for allocations in the next step
                </p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveBudgetValue}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default BudgetItemSelection;