import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Function to handle smooth scrolling to section IDs
export function scrollToSection(id: string) {
  // Remove the # if it exists
  const elementId = id.startsWith('#') ? id.substring(1) : id;
  const element = document.getElementById(elementId);
  
  if (element) {
    // Calculate header height - adjust the value if needed
    const headerOffset = 80;
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
    
    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth"
    });
  }
}
