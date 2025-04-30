import { useState } from "react";
import * as React from "react";
import { Link, useLocation } from "wouter";
import { Menu, ChevronDown, HomeIcon, BarChart2, Info, Phone, BookOpen, FileText, HardHat, ClipboardCheck, Building, CheckCircle, MapPin, Download, LogIn } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle
} from "@/components/ui/navigation-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import TextLogo from "@/components/ui/TextLogo";
import LanguageSelector from "@/components/ui/LanguageSelector";
import { scrollToSection, cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

// Define interfaces for navigation item types
interface NavChildItem {
  name: string;
  href: string | null;
  description: string;
  icon?: React.ReactNode;
  featured?: boolean;
  isGroupHeader?: boolean;
}

interface NavItem {
  name: string;
  href: string;
  icon?: React.ReactNode;
  children?: NavChildItem[];
}

// Define our navigation structure with dropdowns - will be updated with translations in the Header component
const createNavigationItems = (t: (key: string) => string) => [
  { 
    name: t('nav.home'), 
    href: "/",
    icon: <HomeIcon className="h-4 w-4 mr-2" /> 
  },
  { 
    name: t('nav.services'),
    icon: <HardHat className="h-4 w-4 mr-2" />,
    children: [
      // Inspection Services Group
      { 
        name: "Inspection Services",
        href: null,
        description: "Professional property inspection services in Dubai",
        icon: <ClipboardCheck className="h-5 w-5 text-primary" />,
        isGroupHeader: true
      },
      { 
        name: t('services.handover.title'), 
        href: "/property-handover",
        description: t('services.handover.description'),
        icon: <ClipboardCheck className="h-5 w-5 text-primary" />
      },
      { 
        name: t('services.warranty.title'), 
        href: "/snagging-services",
        description: t('services.warranty.description'),
        icon: <FileText className="h-5 w-5 text-primary" />
      },
      { 
        name: t('services.resale.title'), 
        href: "/property-inspection",
        description: t('services.resale.description'),
        icon: <Building className="h-5 w-5 text-primary" />
      },
      { 
        name: "RERA Audits", 
        href: "/rera-audits",
        description: "Condition Survey and Advanced Reserve Fund Analysis based on RICS NRM3 classification",
        icon: <BarChart2 className="h-5 w-5 text-primary" />
      },
      
      // Move-In Services Group
      { 
        name: "Move-In Services",
        href: null,
        description: "Comprehensive move-in services for your property",
        icon: <ClipboardCheck className="h-5 w-5 text-primary" />,
        isGroupHeader: true
      },
      { 
        name: "Deep Cleaning", 
        href: "/book-service",
        description: "Thorough cleaning service for your property",
        icon: <ClipboardCheck className="h-5 w-5 text-primary" />
      },
      { 
        name: "Pest Control", 
        href: "/book-service",
        description: "Effective pest prevention and control services",
        icon: <ClipboardCheck className="h-5 w-5 text-primary" />
      },
      { 
        name: "Fit-out Services", 
        href: "/book-service",
        description: "Interior fit-out and renovation services",
        icon: <ClipboardCheck className="h-5 w-5 text-primary" />
      },
      { 
        name: t('services.book_service'), 
        href: "/book-service",
        description: t('hero.cta'),
        icon: <BookOpen className="h-5 w-5 text-primary" />,
        featured: true
      }
    ]
  },
  { 
    name: t('nav.about'),
    icon: <Info className="h-4 w-4 mr-2" />,
    children: [
      { 
        name: t('about.title'), 
        href: "/#about",
        description: t('about.description').substring(0, 60) + '...', 
        icon: <BarChart2 className="h-5 w-5 text-primary" />
      },
      { 
        name: t('certifications.title'), 
        href: "/#certifications",
        description: t('certifications.subtitle'), 
        icon: <CheckCircle className="h-5 w-5 text-primary" />
      },
      { 
        name: t('testimonials.title'), 
        href: "/#testimonials",
        description: t('testimonials.subtitle'), 
        icon: <FileText className="h-5 w-5 text-primary" />
      }
    ]
  },
  { 
    name: t('nav.resources'),
    icon: <BookOpen className="h-4 w-4 mr-2" />,
    children: [
      { 
        name: "Blog", 
        href: "/blog",
        description: "Expert advice, guides and resources on property snagging in Dubai", 
        icon: <BookOpen className="h-5 w-5 text-primary" />
      },
      { 
        name: "Snagging Dubai", 
        href: "/snagging-dubai",
        description: "Expert property snagging services by certified inspectors in Dubai", 
        icon: <FileText className="h-5 w-5 text-primary" />
      },
      { 
        name: "Property Inspection Dubai", 
        href: "/property-inspection-dubai",
        description: "Professional property inspection services throughout Dubai", 
        icon: <Building className="h-5 w-5 text-primary" />
      },
      { 
        name: "Dubai Snagging Services", 
        href: "/snagging-services",
        description: "Comprehensive snagging services for Dubai properties", 
        icon: <FileText className="h-5 w-5 text-primary" />
      },
      { 
        name: "Property Handover Dubai", 
        href: "/property-handover",
        description: "Expert property handover inspection services for new Dubai properties", 
        icon: <ClipboardCheck className="h-5 w-5 text-primary" />
      },
      { 
        name: "Downloads & Resources", 
        href: "/downloads",
        description: "Download our company profile, brochures and materials", 
        icon: <Download className="h-5 w-5 text-primary" />
      },
      { 
        name: t('faq.title'), 
        href: "/#faq",
        description: t('faq.subtitle'), 
        icon: <FileText className="h-5 w-5 text-primary" />
      },
      { 
        name: t('blog.title'), 
        href: "/blog",
        description: t('blog.subtitle'), 
        icon: <BookOpen className="h-5 w-5 text-primary" />
      },
      { 
        name: t('nav.location'), 
        href: "/location",
        description: "Find our office in Dubai and see areas we serve", 
        icon: <MapPin className="h-5 w-5 text-primary" />
      }
    ]
  },
  { 
    name: t('nav.contact'), 
    href: "/#contact",
    icon: <Phone className="h-4 w-4 mr-2" />
  }
];

// Create a custom NavigationMenu component
const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a"> & { 
    icon?: React.ReactNode;
    featured?: boolean;
    isGroupHeader?: boolean;
  }
>(({ className, title, children, icon, featured, isGroupHeader, ...props }, ref) => {
  // For group headers, render a non-clickable heading
  if (isGroupHeader) {
    return (
      <li className="col-span-2">
        <div className="border-b pb-1 mb-2 mt-2 first:mt-0">
          <div className="flex items-center">
            {icon}
            <div className="ml-2">
              <div className="text-sm font-bold leading-none text-gray-900">
                {title}
              </div>
              <p className="line-clamp-2 text-xs leading-snug mt-1 text-muted-foreground">
                {children}
              </p>
            </div>
          </div>
        </div>
      </li>
    );
  }
  
  // For regular links
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors",
            featured 
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="flex items-center">
            {icon}
            <div className="ml-2">
              <div className={cn("text-sm font-medium leading-none", featured && "text-white")}>
                {title}
              </div>
              <p className={cn("line-clamp-2 text-xs leading-snug mt-1", 
                featured ? "text-white/70" : "text-muted-foreground"
              )}>
                {children}
              </p>
            </div>
          </div>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [openCollapsibles, setOpenCollapsibles] = useState<string[]>([]);
  const [location] = useLocation();
  const { t } = useTranslation();
  
  // Generate the navigation items with translations
  const navigationItems = createNavigationItems(t);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    // Check if this is a hash link and we're on the homepage
    if (href.includes('#') && (location === '/' || location === '')) {
      e.preventDefault();
      const sectionId = href.split('#')[1];
      scrollToSection(sectionId);
    } else if (href.includes('#') && location !== '/') {
      // If we're not on homepage but clicking a hash link, navigate to homepage first
      // then scroll after a small delay to allow page to load
      setTimeout(() => {
        const sectionId = href.split('#')[1];
        scrollToSection(sectionId);
      }, 100);
    }
    // If it's a regular link, let it navigate normally
  };

  const toggleCollapsible = (name: string) => {
    if (openCollapsibles.includes(name)) {
      setOpenCollapsibles(openCollapsibles.filter(item => item !== name));
    } else {
      setOpenCollapsibles([...openCollapsibles, name]);
    }
  };

  return (
    <header className="fixed w-full bg-white/90 backdrop-blur-sm z-50 shadow-sm h-16 min-h-[64px]">
      <nav className="mx-auto max-w-7xl px-6 lg:px-8" aria-label="Top">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center justify-center h-full">
            <TextLogo size="md" />
          </div>

          {/* Desktop Navigation with Dropdowns */}
          <div className="hidden lg:block">
            <NavigationMenu>
              <NavigationMenuList>
                {navigationItems.map((item) => (
                  <NavigationMenuItem key={item.name}>
                    {item.children ? (
                      <>
                        <NavigationMenuTrigger className="text-sm font-medium text-gray-700 hover:text-primary transition-colors">
                          <span className="flex items-center">
                            {item.icon}
                            {item.name}
                          </span>
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                          <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
                            {item.children.map((child) => (
                              <ListItem
                                key={child.name}
                                title={child.name}
                                href={child.href || undefined}
                                icon={child.icon}
                                featured={child.featured}
                                isGroupHeader={child.isGroupHeader}
                                onClick={(e) => {
                                  if (child.href) {
                                    handleNavClick(e, child.href);
                                  }
                                }}
                              >
                                {child.description}
                              </ListItem>
                            ))}
                          </ul>
                        </NavigationMenuContent>
                      </>
                    ) : (
                      <a
                        href={item.href}
                        className="text-sm font-medium flex items-center px-4 py-2 text-gray-700 hover:text-primary transition-colors"
                        onClick={(e) => handleNavClick(e, item.href)}
                      >
                        {item.icon}
                        {item.name}
                      </a>
                    )}
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <LanguageSelector compact={true} />
            
            <Button 
              variant="outline"
              size="sm"
              className="hidden lg:inline-flex items-center gap-1"
              asChild
            >
              <Link href="/login">
                <LogIn className="h-4 w-4" />
                Login
              </Link>
            </Button>
            
            <Button 
              className="hidden lg:inline-flex rounded-full px-5" 
              asChild
            >
              <Link href="/book-service">{t('nav.book_now')}</Link>
            </Button>
          </div>

          {/* Mobile Navigation */}
          <div className="lg:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open navigation menu">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent>
                <div className="mt-6 flow-root">
                  <div className="space-y-2">
                    {navigationItems.map((item) => (
                      <div key={item.name}>
                        {item.children ? (
                          <Collapsible
                            open={openCollapsibles.includes(item.name)}
                            onOpenChange={() => toggleCollapsible(item.name)}
                            className="w-full"
                          >
                            <CollapsibleTrigger asChild>
                              <Button 
                                variant="ghost" 
                                className="w-full justify-between font-medium"
                              >
                                <span className="flex items-center">
                                  {item.icon}
                                  {item.name}
                                </span>
                                <ChevronDown 
                                  className={`h-4 w-4 transition-transform ${
                                    openCollapsibles.includes(item.name) ? 'rotate-180' : ''
                                  }`} 
                                />
                              </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="pl-8 space-y-2 py-2">
                              {item.children.map((child) => 
                                child.isGroupHeader ? (
                                  <div 
                                    key={child.name}
                                    className="font-bold text-sm text-gray-900 border-b pb-1 mb-2 mt-4 first:mt-0"
                                  >
                                    <div className="flex items-center py-1 px-3">
                                      {child.icon && 
                                        <span className="mr-2">
                                          {child.icon}
                                        </span>
                                      }
                                      {child.name}
                                    </div>
                                  </div>
                                ) : (
                                  <a
                                    key={child.name}
                                    href={child.href || undefined}
                                    className={cn(
                                      "flex items-center py-2 px-3 text-sm rounded-md",
                                      child.featured 
                                        ? "bg-primary text-white" 
                                        : "text-gray-700 hover:bg-gray-100"
                                    )}
                                    onClick={(e) => {
                                      if (child.href) {
                                        handleNavClick(e, child.href);
                                        setIsOpen(false);
                                      }
                                    }}
                                  >
                                    {child.icon && 
                                      <span className={cn("mr-2", child.featured && "text-white")}>
                                        {child.icon}
                                      </span>
                                    }
                                    {child.name}
                                  </a>
                                )
                              )}
                            </CollapsibleContent>
                          </Collapsible>
                        ) : (
                          <a
                            href={item.href}
                            className="flex items-center py-2 px-3 text-base font-medium text-gray-700 hover:bg-gray-100 rounded-md"
                            onClick={(e) => {
                              handleNavClick(e, item.href);
                              setIsOpen(false);
                            }}
                          >
                            {item.icon}
                            {item.name}
                          </a>
                        )}
                        <Separator className="my-2" />
                      </div>
                    ))}
                    <Link href="/login" onClick={() => setIsOpen(false)}>
                      <Button 
                        variant="outline" 
                        className="mt-4 w-full flex items-center justify-center gap-2"
                      >
                        <LogIn className="h-4 w-4" />
                        Login
                      </Button>
                    </Link>
                    
                    <Link href="/book-service" onClick={() => setIsOpen(false)}>
                      <Button className="mt-2 w-full rounded-full">
                        {t('nav.book_now')}
                      </Button>
                    </Link>
                    
                    <div className="mt-4 flex justify-center">
                      <LanguageSelector />
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </header>
  );
}