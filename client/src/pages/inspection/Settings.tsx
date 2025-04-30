import { Helmet } from "react-helmet";
import { useLocation } from "wouter";
import { 
  FileText, 
  Settings as SettingsIcon, 
  BarChart3, 
  BellRing, 
  User, 
  Building,
  Users,
  Globe,
  Shield
} from "lucide-react";
import InspectionLayout from "@/components/layouts/InspectionLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Settings() {
  const [, setLocation] = useLocation();

  const settingsCategories = [
    {
      id: "report-templates",
      title: "Report Templates",
      description: "Configure report layouts and content for different inspection types",
      icon: FileText,
      path: "/inspection/report-settings",
      color: "bg-blue-100 text-blue-600"
    },
    {
      id: "profile",
      title: "User Profile",
      description: "Manage your account information and preferences",
      icon: User,
      path: "/inspection/profile",
      color: "bg-green-100 text-green-600"
    },
    {
      id: "company",
      title: "Company Profile",
      description: "Manage company information and branding",
      icon: Building,
      path: "/inspection/company-settings",
      color: "bg-purple-100 text-purple-600"
    },
    {
      id: "team",
      title: "Team Management",
      description: "Manage team members and their access permissions",
      icon: Users,
      path: "/inspection/team-settings",
      color: "bg-indigo-100 text-indigo-600"
    },
    {
      id: "notifications",
      title: "Notifications",
      description: "Configure email and in-app notification preferences",
      icon: BellRing,
      path: "/inspection/notification-settings",
      color: "bg-orange-100 text-orange-600"
    },
    {
      id: "analytics",
      title: "Analytics & Reporting",
      description: "Configure analytics and reporting preferences",
      icon: BarChart3,
      path: "/inspection/analytics-settings",
      color: "bg-amber-100 text-amber-600"
    },
    {
      id: "localization",
      title: "Localization",
      description: "Configure language and regional settings",
      icon: Globe,
      path: "/inspection/localization-settings",
      color: "bg-teal-100 text-teal-600"
    },
    {
      id: "security",
      title: "Security",
      description: "Manage security settings and authentication options",
      icon: Shield,
      path: "/inspection/security-settings",
      color: "bg-red-100 text-red-600"
    },
    {
      id: "general",
      title: "General Settings",
      description: "Configure default application behavior and preferences",
      icon: SettingsIcon,
      path: "/inspection/general-settings",
      color: "bg-gray-100 text-gray-600"
    }
  ];

  return (
    <InspectionLayout title="Settings" description="Configure application settings and preferences">
      <Helmet>
        <title>Settings - Inspection System</title>
      </Helmet>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {settingsCategories.map((category) => (
          <Card 
            key={category.id}
            className="cursor-pointer hover:shadow-md transition-shadow border-0 shadow-sm bg-white"
            onClick={() => setLocation(category.path)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="mr-2">
                  <CardTitle className="text-lg">{category.title}</CardTitle>
                </div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${category.color}`}>
                  <category.icon className="h-5 w-5" />
                </div>
              </div>
              <CardDescription className="mt-2">{category.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="w-full justify-start mt-2"
                onClick={(e) => {
                  e.stopPropagation();
                  setLocation(category.path);
                }}
              >
                Configure Settings
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </InspectionLayout>
  );
}