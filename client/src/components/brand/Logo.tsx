import React from "react";
import { useLocation } from "wouter";

interface LogoProps {
  variant?: "full" | "icon";
  size?: "sm" | "md" | "lg";
  mono?: boolean;
}

export default function Logo({ 
  variant = "full", 
  size = "md",
  mono = false
}: LogoProps) {
  const [, setLocation] = useLocation();
  
  // Size classes based on the size prop
  const sizeClasses = {
    icon: {
      sm: "h-8 w-8",
      md: "h-10 w-10",
      lg: "h-12 w-12",
    },
    text: {
      sm: "text-lg",
      md: "text-xl",
      lg: "text-2xl",
    },
  };
  
  // Color classes based on the mono prop
  const colorClasses = mono
    ? "text-white bg-transparent"
    : "text-green-600 bg-white";
  
  return (
    <div
      className="flex items-center cursor-pointer"
      onClick={() => setLocation("/")}
    >
      {/* Logo Icon - Using the new image */}
      <div className={`${sizeClasses.icon[size]} relative flex items-center justify-center rounded-md overflow-hidden`}>
        <img 
          src="/company/assets/snagging-logo.png" 
          alt="Snagging By UrbanGrid Logo" 
          className="h-full w-full object-contain"
        />
      </div>
      
      {/* Full Logo with Text */}
      {variant === "full" && (
        <div className="ml-2 flex flex-col">
          <span className={`font-bold leading-none ${sizeClasses.text[size]}`}>
            Snagging By
          </span>
          <span className={`font-bold leading-none ${sizeClasses.text[size]}`}>
            UrbanGrid
          </span>
        </div>
      )}
    </div>
  );
}