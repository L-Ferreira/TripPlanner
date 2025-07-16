import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// URL extraction utility for Google Maps embed URLs
export const extractEmbedUrl = (input: string): string => {
  if (!input.trim()) return '';
  
  // Check if input contains iframe with src attribute
  const srcMatch = input.match(/src\s*=\s*["']([^"']+)["']/i);
  if (srcMatch) {
    return srcMatch[1];
  }
  
  // Check if it's already a clean URL (starts with http)
  if (input.startsWith('http')) {
    return input.trim();
  }
  
  // If it doesn't look like a URL or iframe, return empty string
  return '';
};

// Default amenities structure
export const getDefaultAmenities = () => ({
  breakfast: false,
  kitchen: false,
  wifi: false,
  airConditioning: false,
  heating: false,
  washer: false,
  dryer: false,
  parking: false,
  pool: false,
  gym: false,
  spa: false,
  petFriendly: false,
  smokingAllowed: false,
  balcony: false,
  oceanView: false,
  mountainView: false,
  cityView: false,
  other: [] as string[]
});

// Default form data for accommodation
export const getDefaultAccommodationFormData = () => ({
  region: '',
  driveTimeHours: 0,
  driveDistanceKm: 0,
  googleMapsEmbedUrl: '',
  accommodationName: '',
  accommodationWebsite: '',
  accommodationMapsUrl: '',
  accommodationEmbedUrl: '',
  accommodationDescription: '',
  accommodationNights: 1,
  accommodationRoomType: '',
  accommodationImages: [] as string[],
  accommodationAmenities: getDefaultAmenities()
});

// Generate Google Maps URL for a location
export const generateGoogleMapsUrl = (locationName: string): string => {
  return `https://maps.google.com/maps?q=${encodeURIComponent(locationName)}`;
};
