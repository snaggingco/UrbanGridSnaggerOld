import React, { useState, useEffect } from "react";
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
  FolderCheck,
  BookOpen,
  Shapes,
  Sparkles,
  CircleUser,
  Bell,
  Pin,
  ChevronLast,
  Search
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

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

interface NavItem {
  id: string;
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: string | number;
  description?: string;
  pinned?: boolean;
  children?: Omit<NavItem, "children">[];
}

interface EnhancedSidebarProps {
  userName?: string;
  userRole?: string;
  userAvatar?: string;
  onLogout: () => void;
}

export default function EnhancedSidebar({
  userName = "User",
  userRole = "Surveyor",
  userAvatar,
  onLogout
}: EnhancedSidebarProps) {
  const [location, setLocation] = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    dashboard: true,
    projects: true
  });
  const [pinnedItems, setPinnedItems] = useState<string[]>([
    "dashboard", "projects"
  ]);

  // Toggle section open/closed
  const toggleSection = (id: string) => {
    setOpenSections(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Pin/unpin item
  const togglePinned = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPinnedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id) 
        : [...prev, id]
    );
  };

  // Check if route is active
  const isActive = (href: string) => {
    if (href === "/inspection" && location === "/inspection") {
      return true;
    }
    return location.startsWith(href);
  };

  // Filter navigation items based on search
  const filterItems = (items: NavItem[], query: string): NavItem[] => {
    if (!query) return items;
    
    return items.reduce<NavItem[]>((filtered, item) => {
      // Check if this item matches the query
      const matches = item.name.toLowerCase().includes(query.toLowerCase()) ||
                      item.description?.toLowerCase().includes(query.toLowerCase());
      
      // Check if any children match
      const matchingChildren = item.children
        ? item.children.filter(child => 
            child.name.toLowerCase().includes(query.toLowerCase()) ||
            child.description?.toLowerCase().includes(query.toLowerCase())
          )
        : [];
      
      // Add this item if it matches or has matching children
      if (matches || matchingChildren.length > 0) {
        const newItem = {...item};
        if (item.children && matchingChildren.length > 0) {
          newItem.children = matchingChildren;
        }
        filtered.push(newItem);
      }
      
      return filtered;
    }, []);
  };

  // Main navigation items
  const navItems: NavItem[] = [
    {
      id: "dashboard",
      name: "Dashboard",
      href: "/inspection",
      icon: Home,
      pinned: true,
      description: "Overview dashboard"
    },
    {
      id: "projects",
      name: "Projects",
      href: "/inspection/projects",
      icon: Building,
      badge: 3,
      pinned: true,
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
          badge: 7,
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

  // Filter items based on search
  const filteredItems = filterItems(navItems, searchQuery);
  
  // Split navigation items into pinned and regular sections
  const pinnedNavItems = filteredItems.filter(item => pinnedItems.includes(item.id));
  const regularNavItems = filteredItems.filter(item => !pinnedItems.includes(item.id));

  return (
    <aside className={`flex flex-col h-screen border-r transition-all duration-300 overflow-hidden
      ${isCollapsed ? 'w-16' : 'w-64'} 
      bg-gradient-to-b from-background to-background
      dark:from-slate-900 dark:to-slate-950`}>
      {/* Header */}
      <div className="p-4 flex items-center justify-between h-16 flex-shrink-0 border-b">
        <div className="flex items-center">
          {!isCollapsed && (
            <>
              <Logo size="sm" iconOnly={true} />
              <span className="ml-2 font-semibold text-lg">Inspection</span>
            </>
          )}
          {isCollapsed && <Logo size="sm" iconOnly={true} className="mx-auto" />}
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-muted-foreground hover:text-foreground"
        >
          {isCollapsed ? <ChevronLast size={18} /> : <ChevronRight size={18} />}
        </Button>
      </div>
      
      {/* User section */}
      {!isCollapsed && (
        <div className="px-4 py-3 flex items-center">
          <Avatar className="h-9 w-9 border-2 border-primary/10">
            {userAvatar ? (
              <AvatarImage src={userAvatar} alt={userName} />
            ) : (
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {userName.charAt(0).toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="ml-3 flex-1 truncate">
            <p className="font-medium text-sm">{userName}</p>
            <p className="text-xs text-muted-foreground">{userRole}</p>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <Bell size={16} />
          </Button>
        </div>
      )}
      
      {/* Search */}
      {!isCollapsed && (
        <div className="px-4 py-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="pl-8 h-9 bg-muted/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      )}
      
      {/* Pinned section */}
      {pinnedNavItems.length > 0 && (
        <div className="mt-2">
          {!isCollapsed && (
            <div className="px-4 py-1">
              <p className="text-xs uppercase font-medium text-muted-foreground">Pinned</p>
            </div>
          )}
          <nav className="px-2">
            <div className="space-y-1">
              {pinnedNavItems.map(item => renderNavItem(item, true))}
            </div>
          </nav>
        </div>
      )}
      
      {/* Main navigation */}
      <div className="mt-2 flex-1 overflow-y-auto">
        {!isCollapsed && regularNavItems.length > 0 && (
          <div className="px-4 py-1">
            <p className="text-xs uppercase font-medium text-muted-foreground">Navigation</p>
          </div>
        )}
        <nav className="px-2 pb-4">
          <div className="space-y-1">
            {regularNavItems.map(item => renderNavItem(item))}
          </div>
        </nav>
      </div>
      
      {/* Footer */}
      <div className="border-t p-2 mt-auto">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size={isCollapsed ? "icon" : "sm"}
                className={`w-full ${isCollapsed ? 'h-10 p-0' : 'justify-start'} hover:bg-destructive/10 hover:text-destructive`}
                onClick={onLogout}
              >
                <LogOut className={`${isCollapsed ? 'h-5 w-5' : 'h-4 w-4 mr-2'}`} />
                {!isCollapsed && <span>Log out</span>}
              </Button>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent side="right">Log out</TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
    </aside>
  );
  
  // Helper function to render navigation items
  function renderNavItem(item: NavItem, isPinned: boolean = false) {
    if (item.children) {
      return (
        <Collapsible
          key={item.id}
          open={!!openSections[item.id]}
          onOpenChange={() => !isCollapsed && toggleSection(item.id)}
          className="w-full"
        >
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size={isCollapsed ? "icon" : "sm"}
                    className={`w-full ${isCollapsed ? 'h-10 p-0' : 'justify-start'} ${
                      isActive(item.href) ? 'bg-muted text-foreground' : ''
                    }`}
                    onClick={() => isCollapsed && setLocation(item.href)}
                  >
                    <item.icon className={`${isCollapsed ? 'h-5 w-5' : 'h-4 w-4 mr-3'}`} />
                    {!isCollapsed && (
                      <span className="flex-1 text-left">{item.name}</span>
                    )}
                    {!isCollapsed && item.badge && (
                      <Badge className="ml-2 px-1.5 py-0 h-5 rounded-md">{item.badge}</Badge>
                    )}
                  </Button>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent side="right" className="flex items-center">
                    {item.name}
                    {item.badge && (
                      <Badge className="ml-2 px-1.5 py-0 h-5 rounded-md">{item.badge}</Badge>
                    )}
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
            
            {!isCollapsed && (
              <div className="flex items-center">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  onClick={(e) => togglePinned(item.id, e)}
                >
                  <Pin className={`h-3.5 w-3.5 ${isPinned ? 'fill-current' : ''}`} />
                </Button>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                    {openSections[item.id] ? (
                      <ChevronDown className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </CollapsibleTrigger>
              </div>
            )}
          </div>
          
          {!isCollapsed && (
            <CollapsibleContent className="pl-9 pt-1 space-y-1">
              {item.children.map(child => (
                <Button
                  key={child.id}
                  variant="ghost"
                  size="sm"
                  className={`w-full justify-start h-8 ${
                    isActive(child.href) ? 'bg-muted text-foreground' : ''
                  }`}
                  onClick={() => setLocation(child.href)}
                >
                  <child.icon className="h-3.5 w-3.5 mr-2" />
                  <span className="text-sm">{child.name}</span>
                  {child.badge && (
                    <Badge className="ml-auto px-1 py-0 h-4 text-xs rounded-md">{child.badge}</Badge>
                  )}
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
            <div className="flex items-center">
              <Button
                variant="ghost"
                size={isCollapsed ? "icon" : "sm"}
                className={`w-full ${isCollapsed ? 'h-10 p-0' : 'justify-start'} ${
                  isActive(item.href) ? 'bg-muted text-foreground' : ''
                }`}
                onClick={() => setLocation(item.href)}
              >
                <item.icon className={`${isCollapsed ? 'h-5 w-5' : 'h-4 w-4 mr-3'}`} />
                {!isCollapsed && (
                  <span className="flex-1 text-left">{item.name}</span>
                )}
                {!isCollapsed && item.badge && (
                  <Badge className="ml-auto px-1.5 py-0 h-5 rounded-md">{item.badge}</Badge>
                )}
              </Button>
              {!isCollapsed && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 ml-1 text-muted-foreground hover:text-foreground"
                  onClick={(e) => togglePinned(item.id, e)}
                >
                  <Pin className={`h-3.5 w-3.5 ${isPinned ? 'fill-current' : ''}`} />
                </Button>
              )}
            </div>
          </TooltipTrigger>
          {isCollapsed && (
            <TooltipContent side="right" className="flex items-center">
              {item.name}
              {item.badge && (
                <Badge className="ml-2 px-1.5 py-0 h-5 rounded-md">{item.badge}</Badge>
              )}
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    );
  }
}