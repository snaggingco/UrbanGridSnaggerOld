import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import CompetitorAnalysis from "@/components/seo/CompetitorAnalysis";
import RecommendationsList from "@/components/seo/RecommendationsList";
import AdSimulationTab from "@/components/seo/AdSimulationTab";
import SearchIntentAnalysis from "@/components/seo/SearchIntentAnalysis";
import GoogleSearchConsole from "@/components/seo/GoogleSearchConsole";
import { MousePointer, BarChart2, Lightbulb, Search, BrainCircuit, LineChart, Activity } from "lucide-react";
import AdminLayout from "@/components/layouts/AdminLayout";

export default function SeoIntelligence() {
  const [activeTab, setActiveTab] = useState("analytics");
  
  return (
    <AdminLayout title="SEO Intelligence" description="Analyze your website's performance and optimize your SEO strategy">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="analytics" className="flex items-center">
            <BarChart2 className="mr-2 h-4 w-4" />
            <span>Competitor Analysis</span>
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center">
            <Lightbulb className="mr-2 h-4 w-4" />
            <span>Recommendations</span>
          </TabsTrigger>
          <TabsTrigger value="search_intent" className="flex items-center">
            <Search className="mr-2 h-4 w-4" />
            <span>Search Intent</span>
          </TabsTrigger>
          <TabsTrigger value="search_console" className="flex items-center">
            <LineChart className="mr-2 h-4 w-4" />
            <span>Search Console</span>
          </TabsTrigger>
          <TabsTrigger value="simulations" className="flex items-center">
            <MousePointer className="mr-2 h-4 w-4" />
            <span>Ad Simulations</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="analytics" className="space-y-4">
          <CompetitorAnalysis />
        </TabsContent>
        
        <TabsContent value="recommendations" className="space-y-4">
          <RecommendationsList />
        </TabsContent>
        
        <TabsContent value="search_intent" className="space-y-4">
          <SearchIntentAnalysis />
        </TabsContent>
        
        <TabsContent value="search_console" className="space-y-4">
          <GoogleSearchConsole />
        </TabsContent>
        
        <TabsContent value="simulations" className="space-y-4">
          <AdSimulationTab />
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}