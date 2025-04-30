import React, { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar, FileText, Search, Filter, ArrowUpDown } from "lucide-react";

interface Asset {
  id: number;
  code: string;
  name: string;
  location: string;
  category: string;
  lastMaintenanceDate?: string;
  estimatedReplacement: string;
  replacementYear: number;
  replacementCost: number;
  remainingLife: number;
  condition: string;
}

interface AssetReplacementScheduleProps {
  assets: Asset[];
  currentYear: number;
}

export default function AssetReplacementSchedule({ 
  assets, 
  currentYear 
}: AssetReplacementScheduleProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterReplacementYear, setFilterReplacementYear] = useState("all");
  const [sortField, setSortField] = useState<keyof Asset>("replacementYear");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [viewMode, setViewMode] = useState<"table" | "timeline">("table");

  // Get unique categories
  const categories = useMemo(() => {
    const uniqueCategories = new Set<string>();
    assets.forEach(asset => uniqueCategories.add(asset.category));
    return Array.from(uniqueCategories);
  }, [assets]);

  // Get unique replacement years
  const replacementYears = useMemo(() => {
    const uniqueYears = new Set<number>();
    assets.forEach(asset => uniqueYears.add(asset.replacementYear));
    return Array.from(uniqueYears).sort((a, b) => a - b);
  }, [assets]);

  // Filter and sort assets
  const filteredAssets = useMemo(() => {
    return assets
      .filter(asset => {
        // Apply search term filter
        if (searchTerm && !asset.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !asset.code.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !asset.location.toLowerCase().includes(searchTerm.toLowerCase())) {
          return false;
        }
        
        // Apply category filter
        if (filterCategory !== "all" && asset.category !== filterCategory) {
          return false;
        }
        
        // Apply replacement year filter
        if (filterReplacementYear !== "all" && 
            asset.replacementYear !== parseInt(filterReplacementYear)) {
          return false;
        }
        
        return true;
      })
      .sort((a, b) => {
        // Apply sorting
        const aValue = a[sortField];
        const bValue = b[sortField];
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
        }
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortDirection === 'asc' 
            ? aValue.localeCompare(bValue) 
            : bValue.localeCompare(aValue);
        }
        
        return 0;
      });
  }, [assets, searchTerm, filterCategory, filterReplacementYear, sortField, sortDirection]);

  // Handle sort click
  const handleSortClick = (field: keyof Asset) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Generate timeline years range (next 10 years)
  const timelineYears = Array.from(
    { length: 10 }, 
    (_, i) => currentYear + i
  );

  const getSeverityColorForCondition = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'poor':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'fair':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'good':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'excellent':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Asset Replacement & Repair Schedule</CardTitle>
        <CardDescription>
          Timeline view of scheduled asset replacements and repairs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search" className="text-xs font-medium">
                Search Assets
              </Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name, code or location"
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="category" className="text-xs font-medium">
                Asset Category
              </Label>
              <Select 
                value={filterCategory} 
                onValueChange={setFilterCategory}
              >
                <SelectTrigger id="category" className="w-full">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="year" className="text-xs font-medium">
                Replacement Year
              </Label>
              <Select 
                value={filterReplacementYear} 
                onValueChange={setFilterReplacementYear}
              >
                <SelectTrigger id="year" className="w-full">
                  <SelectValue placeholder="All Years" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {replacementYears.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="view" className="text-xs font-medium">
                View Mode
              </Label>
              <Tabs 
                value={viewMode} 
                onValueChange={(v) => setViewMode(v as "table" | "timeline")}
                className="w-full"
              >
                <TabsList className="w-full">
                  <TabsTrigger value="table" className="flex-1">
                    <FileText className="h-4 w-4 mr-2" />
                    Table View
                  </TabsTrigger>
                  <TabsTrigger value="timeline" className="flex-1">
                    <Calendar className="h-4 w-4 mr-2" />
                    Timeline
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
          
          {/* Table View */}
          {viewMode === "table" && (
            <ScrollArea className="h-[400px] rounded-md border">
              <Table>
                <TableHeader className="sticky top-0 bg-white">
                  <TableRow>
                    <TableHead onClick={() => handleSortClick("code")} className="w-[100px] cursor-pointer hover:bg-gray-50">
                      <div className="flex items-center">
                        Code
                        <ArrowUpDown className="ml-1 h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead onClick={() => handleSortClick("name")} className="cursor-pointer hover:bg-gray-50">
                      <div className="flex items-center">
                        Asset Name
                        <ArrowUpDown className="ml-1 h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead onClick={() => handleSortClick("location")} className="cursor-pointer hover:bg-gray-50">
                      <div className="flex items-center">
                        Location
                        <ArrowUpDown className="ml-1 h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead onClick={() => handleSortClick("replacementYear")} className="cursor-pointer hover:bg-gray-50">
                      <div className="flex items-center">
                        Replace Year
                        <ArrowUpDown className="ml-1 h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead onClick={() => handleSortClick("remainingLife")} className="cursor-pointer hover:bg-gray-50">
                      <div className="flex items-center">
                        Remaining Life
                        <ArrowUpDown className="ml-1 h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead onClick={() => handleSortClick("replacementCost")} className="text-right cursor-pointer hover:bg-gray-50">
                      <div className="flex items-center justify-end">
                        Cost
                        <ArrowUpDown className="ml-1 h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead onClick={() => handleSortClick("condition")} className="cursor-pointer hover:bg-gray-50">
                      <div className="flex items-center">
                        Condition
                        <ArrowUpDown className="ml-1 h-3 w-3" />
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        No assets match your filters
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAssets.map((asset) => (
                      <TableRow key={asset.id}>
                        <TableCell className="font-mono">{asset.code}</TableCell>
                        <TableCell>{asset.name}</TableCell>
                        <TableCell>{asset.location}</TableCell>
                        <TableCell>{asset.replacementYear}</TableCell>
                        <TableCell>{asset.remainingLife} years</TableCell>
                        <TableCell className="text-right">
                          ${asset.replacementCost.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge className={getSeverityColorForCondition(asset.condition)}>
                            {asset.condition}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
          
          {/* Timeline View */}
          {viewMode === "timeline" && (
            <div className="space-y-6">
              <div className="grid grid-cols-11 gap-1">
                <div className="font-medium text-xs text-gray-500">Asset</div>
                {timelineYears.map(year => (
                  <div 
                    key={year} 
                    className="font-medium text-xs text-center text-gray-500"
                  >
                    {year}
                  </div>
                ))}
              </div>
              
              <ScrollArea className="h-[400px] rounded-md border p-4">
                <div className="space-y-4">
                  {filteredAssets.length === 0 ? (
                    <div className="h-24 flex items-center justify-center text-gray-500">
                      No assets match your filters
                    </div>
                  ) : (
                    filteredAssets.map((asset) => (
                      <div key={asset.id} className="grid grid-cols-11 gap-1">
                        <div className="text-xs truncate" title={asset.name}>
                          {asset.name}
                        </div>
                        
                        {timelineYears.map(year => {
                          const isReplacementYear = asset.replacementYear === year;
                          return (
                            <div 
                              key={year} 
                              className={`h-6 rounded ${
                                isReplacementYear 
                                  ? 'bg-primary text-white text-[10px] flex items-center justify-center' 
                                  : 'border border-gray-200'
                              }`}
                            >
                              {isReplacementYear && (
                                <span className="px-1 truncate">
                                  ${(asset.replacementCost/1000).toFixed(1)}k
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          )}
          
          <div className="text-xs text-muted-foreground mt-2">
            Showing {filteredAssets.length} of {assets.length} assets
          </div>
        </div>
      </CardContent>
    </Card>
  );
}