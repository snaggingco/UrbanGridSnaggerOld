import React from 'react';
import { useLocation, Link } from 'wouter';
import { 
  Layout, 
  LogOut, 
  Users, 
  BarChart2, 
  Calendar, 
  Settings,
  ChevronRight,
  Activity,
  Building2,
  LineChart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import Logo from '@/components/ui/Logo';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ 
  children, 
  title,
  description
}) => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Get the current location to highlight active nav item
  const [location] = useLocation();

  // Function to check if a nav item is active
  const isActive = (path: string) => {
    return location === path;
  };

  const handleLogout = async () => {
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' });
      localStorage.removeItem('user');
      localStorage.removeItem('auth_token');
      setLocation('/login');
      toast({
        title: 'Logged out successfully',
      });
    } catch (error) {
      toast({
        title: 'Logout failed',
        description: 'There was an error logging out.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header with logo, welcome message, and logout button */}
      <header className="bg-white border-b sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Logo size="md" />
              <Separator orientation="vertical" className="h-6" />
              <h1 className="text-lg font-semibold text-blue-800">Admin Portal</h1>
            </div>
            <div className="flex items-center space-x-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="border-gray-200 hover:bg-gray-100">
                    <Settings className="h-4 w-4 mr-2" />
                    <span>Menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Admin Options</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/admin/leads">
                      <Users className="h-4 w-4 mr-2" />
                      <span>Lead Management</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/analytics">
                      <BarChart2 className="h-4 w-4 mr-2" />
                      <span>Analytics</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/calendar">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>Calendar</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/settings">
                      <Settings className="h-4 w-4 mr-2" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/visitors">
                      <Activity className="h-4 w-4 mr-2" />
                      <span>Visitor Tracking</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/rera-projects">
                      <Building2 className="h-4 w-4 mr-2" />
                      <span>RERA Projects</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/seo-intelligence">
                      <LineChart className="h-4 w-4 mr-2" />
                      <span>SEO Intelligence</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/inspection">
                      <Layout className="h-4 w-4 mr-2" />
                      <span>Switch to Inspection Portal</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 hover:text-red-700 focus:text-red-700">
                    <LogOut className="h-4 w-4 mr-2" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Breadcrumb navigation under header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center text-sm text-gray-500">
            <Link href="/admin/leads">
              <a className="hover:text-primary transition-colors">Admin Portal</a>
            </Link>
            <ChevronRight className="h-4 w-4 mx-1" />
            <span className="font-medium text-gray-700">{title}</span>
          </div>
        </div>
      </div>

      {/* Main navigation bar */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4">
          <nav className="flex overflow-x-auto">
            <Link href="/admin/leads">
              <a className={`px-4 py-3 border-b-2 font-medium whitespace-nowrap ${
                isActive('/admin/leads') 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}>
                Lead Management
              </a>
            </Link>
            <Link href="/admin/analytics">
              <a className={`px-4 py-3 border-b-2 font-medium whitespace-nowrap ${
                isActive('/admin/analytics') 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}>
                Analytics
              </a>
            </Link>
            <Link href="/admin/calendar">
              <a className={`px-4 py-3 border-b-2 font-medium whitespace-nowrap ${
                isActive('/admin/calendar') 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}>
                Calendar
              </a>
            </Link>
            <Link href="/admin/settings">
              <a className={`px-4 py-3 border-b-2 font-medium whitespace-nowrap ${
                isActive('/admin/settings') 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}>
                Settings
              </a>
            </Link>
            <Link href="/admin/rera-projects">
              <a className={`px-4 py-3 border-b-2 font-medium whitespace-nowrap ${
                isActive('/admin/rera-projects') 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}>
                RERA Projects
              </a>
            </Link>
            <Link href="/admin/visitors">
              <a className={`px-4 py-3 border-b-2 font-medium whitespace-nowrap ${
                isActive('/admin/visitors') 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}>
                Visitor Tracking
              </a>
            </Link>
            <Link href="/admin/seo-intelligence">
              <a className={`px-4 py-3 border-b-2 font-medium whitespace-nowrap ${
                isActive('/admin/seo-intelligence') 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}>
                SEO Intelligence
              </a>
            </Link>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1">
        <div className="container mx-auto px-4 py-6">
          {/* Page title */}
          {(title || description) && (
            <div className="mb-6">
              {title && <h1 className="text-2xl font-bold">{title}</h1>}
              {description && <p className="text-muted-foreground mt-1">{description}</p>}
            </div>
          )}
          
          {/* Page content */}
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
            <p>© {new Date().getFullYear()} Snagging By UrbanGrid. All rights reserved.</p>
            <div className="flex space-x-4 mt-2 md:mt-0">
              <a href="/" target="_blank" className="hover:text-primary transition-colors">Website</a>
              <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AdminLayout;