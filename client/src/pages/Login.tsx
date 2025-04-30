import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginCredentials } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import SEO from "@/components/SEO";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, ClipboardList, Lock, LogIn, Settings, User } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Logo from "@/components/ui/Logo";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [portalType, setPortalType] = useState<"inspection" | "admin">("inspection");
  const { toast } = useToast();

  const form = useForm<LoginCredentials>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginCredentials) {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiRequest<{ user: any; token: string }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
      });

      // Store token and user data
      localStorage.setItem("auth_token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));

      // Check if user has admin role for admin portal access
      const user = response.user;
      const isAdmin = user.role === "admin";
      
      // If user tries to access admin portal but doesn't have admin rights
      if (portalType === "admin" && !isAdmin) {
        setError("You don't have permission to access the admin portal. Please use the inspection portal instead.");
        setIsLoading(false);
        return;
      }

      toast({
        title: "Login successful",
        description: `Welcome to the ${portalType} portal`,
      });

      // Redirect based on portal selection
      if (portalType === "admin") {
        setLocation("/admin/leads");
      } else {
        setLocation("/inspection");
      }
    } catch (error: any) {
      setError(
        error.message || "Login failed. Please check your credentials and try again."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <SEO
        title={`Login - UrbanGrid ${portalType === "admin" ? "Admin" : "Inspection"} Portal`}
        description={`Login to the UrbanGrid ${portalType === "admin" ? "admin portal for lead management" : "inspection portal for surveyors and property inspectors"}.`}
        noIndex={true}
        canonicalUrl="https://www.snagging.me/login"
      />

      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-gray-100">
        <header className="container mx-auto py-6">
          <div className="flex justify-center">
            <Logo size="lg" />
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center py-12 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            <Card className="border-0 shadow-lg">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-center">
                  UrbanGrid Portal Login
                </CardTitle>
                <CardDescription className="text-center">
                  Enter your credentials to access the system
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Authentication Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Tabs
                  defaultValue="inspection"
                  value={portalType}
                  onValueChange={(value) => setPortalType(value as "inspection" | "admin")}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="inspection" className="flex items-center gap-2">
                      <ClipboardList className="h-4 w-4" />
                      Inspection Portal
                    </TabsTrigger>
                    <TabsTrigger value="admin" className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Admin Portal
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="inspection">
                    <div className="text-sm text-gray-500 mb-4 text-center">
                      Access the property inspection system
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="admin">
                    <div className="text-sm text-gray-500 mb-4 text-center">
                      Access lead management and business tools
                    </div>
                  </TabsContent>
                </Tabs>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <div className="relative">
                      <User className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                      <Input
                        id="username"
                        type="text"
                        autoComplete="username"
                        className="pl-10"
                        {...form.register("username")}
                      />
                    </div>
                    {form.formState.errors.username && (
                      <p className="text-sm text-red-500">
                        {form.formState.errors.username.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                      <Input
                        id="password"
                        type="password"
                        autoComplete="current-password"
                        className="pl-10"
                        {...form.register("password")}
                      />
                    </div>
                    {form.formState.errors.password && (
                      <p className="text-sm text-red-500">
                        {form.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Logging in...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <LogIn className="h-4 w-4" />
                        Login to {portalType === "admin" ? "Admin Portal" : "Inspection Portal"}
                      </span>
                    )}
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="flex justify-center text-sm text-gray-600">
                <p>For access, please contact your administrator</p>
              </CardFooter>
            </Card>
          </motion.div>
        </main>

        <footer className="py-6 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} UrbanGrid. All rights reserved.</p>
        </footer>
      </div>
    </>
  );
}