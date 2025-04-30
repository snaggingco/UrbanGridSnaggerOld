import React, { useState } from "react";
import { useLocation } from "wouter";
import {
  AlertCircle,
  Building,
  ClipboardList,
  FileText,
  Settings,
  LogOut,
  ChevronRight,
  ChevronDown,
  User,
  BarChart,
  Layers,
  Calendar,
  HelpCircle,
  Menu,
  Home,
  X,
  Gauge,
  FileArchive,
  Banknote,
  Calculator,
  FolderTree,
  FolderCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/ui/Logo";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface NavItem {
  id: string;
  name: string;
  href: string;
  icon: React.ElementType;
  description?: string;
  children?: Omit<NavItem, "children">[];
}

interface ModernSidebarProps {
  userName?: string;
  userRole?: string;
  onLogout: () => void;
}

export default function ModernSidebar({
  userName = "User",
  userRole = "Surveyor",
  onLogout
}: ModernSidebarProps) {
  const [location, setLocation] = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    dashboard: true,
    projects: true
  });

  // Toggle section open/closed
  const toggleSection = (id: string) => {
    setOpenSections(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Check if route is active
  const isActive = (href: string) => {
    if (href === "/inspection" && location === "/inspection") {
      return true;
    }
    return location.startsWith(href);
  };

  // Main navigation items
  const navItems: NavItem[] = [
    {
      id: "dashboard",
      name: "Dashboard",
      href: "/inspection",
      icon: Home,
      description: "Overview dashboard"
    },
    {
      id: "projects",
      name: "Projects",
      href: "/inspection/projects",
      icon: Building,
      description: "Manage inspection projects",
      children: [
        {
          id: "all-projects",
          name: "All Projects",
          href: "/inspection/projects",
          icon: FolderTree
        },
        {
          id: "defects",
          name: "Defects",
          href: "/inspection/defects",
          icon: AlertCircle
        },
        {
          id: "reports",
          name: "Reports",
          href: "/inspection/reports",
          icon: FileText
        }
      ]
    },
    {
      id: "reserve-fund",
      name: "Reserve Fund",
      href: "/inspection/reserve-fund",
      icon: Banknote,
      description: "Reserve fund analysis",
      children: [
        {
          id: "fund-settings",
          name: "Fund Settings",
          href: "/inspection/reserve-fund/settings",
          icon: Settings
        },
        {
          id: "lifecycle-costs",
          name: "Lifecycle Costs",
          href: "/inspection/reserve-fund/costs",
          icon: Calculator
        },
        {
          id: "assets",
          name: "Assets",
          href: "/inspection/reserve-fund/assets",
          icon: FolderCheck
        }
      ]
    },
    {
      id: "condition",
      name: "Condition Survey",
      href: "/inspection/condition",
      icon: Gauge,
      description: "Building condition survey"
    },
    {
      id: "calendar",
      name: "Calendar",
      href: "/inspection/calendar",
      icon: Calendar,
      description: "Inspection schedule"
    },
    {
      id: "analytics",
      name: "Analytics",
      href: "/inspection/analytics",
      icon: BarChart,
      description: "Project analytics and reporting"
    },
    {
      id: "settings",
      name: "Settings",
      href: "/inspection/settings",
      icon: Settings,
      description: "Application settings"
    }
  ];

  return (
    <aside className={`bg-white border-r flex flex-col h-screen transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
      {/* Header */}
      <div className="px-3 py-3 border-b flex justify-between items-center h-14 flex-shrink-0">
        {!isCollapsed && (
          <div className="flex items-center">
            <Logo height={26} width={26} />
            <span className="ml-2 font-semibold">Inspection Portal</span>
          </div>
        )}
        {isCollapsed && <Logo height={26} width={26} className="mx-auto" />}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-gray-500 hover:text-gray-700"
        >
          {isCollapsed ? <Menu size={18} /> : <X size={18} />}
        </Button>
      </div>
      
      {/* User section */}
      <div className={`border-b px-3 py-3 ${isCollapsed ? 'text-center' : ''}`}>
        {isCollapsed ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <User size={16} />
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{userName}</p>
                <p className="text-xs text-muted-foreground">{userRole}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <User size={16} />
            </div>
            <div className="ml-2 flex-1 truncate">
              <p className="font-medium text-sm">{userName}</p>
              <p className="text-xs text-muted-foreground">{userRole}</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        <div className="space-y-1">
          {navItems.map(item => {
            if (item.children) {
              return (
                <Collapsible
                  key={item.id}
                  open={!!openSections[item.id]}
                  onOpenChange={() => !isCollapsed && toggleSection(item.id)}
                  className={isCollapsed ? 'w-full' : ''}
                >
                  <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size={isCollapsed ? "icon" : "sm"}
                            className={`w-full ${isCollapsed ? 'h-10 p-0' : 'justify-start'} ${
                              isActive(item.href) ? 'bg-primary/10 text-primary' : ''
                            }`}
                            onClick={() => isCollapsed && setLocation(item.href)}
                          >
                            <item.icon className={`${isCollapsed ? 'h-5 w-5' : 'h-4 w-4 mr-3'}`} />
                            {!isCollapsed && <span>{item.name}</span>}
                          </Button>
                        </TooltipTrigger>
                        {isCollapsed && (
                          <TooltipContent side="right">{item.name}</TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                    
                    {!isCollapsed && (
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          {openSections[item.id] ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                    )}
                  </div>
                  
                  {!isCollapsed && (
                    <CollapsibleContent className="ml-7 mt-1 space-y-1">
                      {item.children.map(child => (
                        <Button
                          key={child.id}
                          variant="ghost"
                          size="sm"
                          className={`w-full justify-start pl-3 ${
                            isActive(child.href) ? 'bg-primary/10 text-primary' : ''
                          }`}
                          onClick={() => setLocation(child.href)}
                        >
                          <child.icon className="h-3.5 w-3.5 mr-2" />
                          <span className="text-sm">{child.name}</span>
                        </Button>
                      ))}
                    </CollapsibleContent>
                  )}
                </Collapsible>
              );
            }
            
            return (
              <TooltipProvider key={item.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size={isCollapsed ? "icon" : "sm"}
                      className={`w-full ${isCollapsed ? 'h-10 p-0' : 'justify-start'} ${
                        isActive(item.href) ? 'bg-primary/10 text-primary' : ''
                      }`}
                      onClick={() => setLocation(item.href)}
                    >
                      <item.icon className={`${isCollapsed ? 'h-5 w-5' : 'h-4 w-4 mr-3'}`} />
                      {!isCollapsed && <span>{item.name}</span>}
                    </Button>
                  </TooltipTrigger>
                  {isCollapsed && (
                    <TooltipContent side="right">{item.name}</TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>
      </nav>
      
      {/* Footer */}
      <div className="border-t py-2 px-2 mt-auto">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size={isCollapsed ? "icon" : "sm"}
                className={`w-full ${isCollapsed ? 'h-10 p-0' : 'justify-start text-red-500 hover:text-red-600 hover:bg-red-50'}`}
                onClick={onLogout}
              >
                <LogOut className={`${isCollapsed ? 'h-5 w-5' : 'h-4 w-4 mr-3'}`} />
                {!isCollapsed && <span>Logout</span>}
              </Button>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent side="right">Logout</TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
    </aside>
  );
}