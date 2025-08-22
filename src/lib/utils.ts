import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { getDefaultAmenities } from './amenities';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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

// Convert decimal hours to time format (HH:MM)
export const decimalHoursToTimeString = (decimalHours: number): string => {
  if (decimalHours === 0) return '';
  const hours = Math.floor(decimalHours);
  const minutes = Math.round((decimalHours - hours) * 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

// Convert time format (HH:MM) to decimal hours
export const timeStringToDecimalHours = (timeString: string): number => {
  if (!timeString.trim()) return 0;
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours + minutes / 60;
};

// Convert decimal hours to hours and minutes (for display)
export const decimalHoursToHoursMinutes = (decimalHours: number): { hours: number; minutes: number } => {
  const hours = Math.floor(decimalHours);
  const minutes = Math.round((decimalHours - hours) * 60);
  return { hours, minutes };
};

// Convert hours and minutes to decimal hours
export const hoursMinutesToDecimalHours = (hours: number, minutes: number): number => {
  return hours + minutes / 60;
};

// Default form data for accommodation
export const getDefaultAccommodationFormData = () => ({
  region: '',
  driveTimeHours: 0,
  driveTimeMinutes: 0,
  driveDistanceKm: '',
  googleMapsUrl: '',
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
  images: [] as string[],
});

// Default form data for places
export const getDefaultPlaceFormData = () => ({
  name: '',
  description: '',
  websiteUrl: '',
  googleMapsUrl: '',
  googleMapsEmbedUrl: '',
  images: [] as string[],
});
