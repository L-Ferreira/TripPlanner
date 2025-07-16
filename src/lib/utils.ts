import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { getDefaultAmenities } from './amenities';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// URL extraction utility for Google Maps embed URLs
export const extractEmbedUrl = (input: string): string => {
  if (!input.trim()) return '';
  
  // If it's an iframe HTML, extract the src attribute
  if (input.includes('<iframe') && input.includes('src=')) {
    const srcMatch = input.match(/src="([^"]+)"/);
    if (srcMatch && srcMatch[1]) {
      return srcMatch[1];
    }
  }
  
  // If it's already a clean embed URL, return as is
  if (input.includes('maps/embed')) {
    return input;
  }
  
  // If it's a regular Google Maps URL, try to extract the embed URL
  // This is a basic implementation - in a real app, you might want more sophisticated parsing
  return input;
};

// Generate Google Maps search URL from location name
export const generateGoogleMapsUrl = (locationName: string): string => {
  const encodedName = encodeURIComponent(locationName);
  return `https://www.google.com/maps/search/${encodedName}`;
};

// Default form data for accommodation
export const getDefaultAccommodationFormData = () => ({
  region: '',
  driveTimeHours: 0,
  driveDistanceKm: 0,
  googleMapsEmbedUrl: '',
  accommodationName: '',
  accommodationWebsite: '',
  accommodationMapsUrl: '',
  accommodationMapsEmbedUrl: '',
  accommodationDescription: '',
  accommodationNights: 1,
  accommodationRoomType: '',
  accommodationImages: [] as string[],
  accommodationAmenities: getDefaultAmenities(),
  images: [] as string[]
});

// Default form data for places
export const getDefaultPlaceFormData = () => ({
  name: '',
  description: '',
  websiteUrl: '',
  googleMapsUrl: '',
  googleMapsEmbedUrl: '',
  images: [] as string[]
});
