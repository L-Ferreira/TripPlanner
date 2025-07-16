// Centralized amenities configuration for easy maintenance
export interface AmenitiesData {
  // Basic essentials
  wifi: boolean;
  airConditioning: boolean;
  heating: boolean;

  // Kitchen & Dining
  kitchen: boolean;
  kitchenette: boolean;
  microwave: boolean;
  refrigerator: boolean;
  dishwasher: boolean;
  coffeemaker: boolean;
  toaster: boolean;
  oven: boolean;
  stove: boolean;
  dining: boolean;
  restaurant: boolean;
  breakfast: boolean;

  // Bathroom & Laundry
  hairDryer: boolean;
  bathtub: boolean;
  shower: boolean;
  washer: boolean;
  dryer: boolean;
  iron: boolean;
  bathrobes: boolean;

  // Bedroom & Living
  tv: boolean;
  cableTV: boolean;
  netflix: boolean;
  desk: boolean;
  safe: boolean;
  fireplace: boolean;

  // Outdoor & Views
  balcony: boolean;
  terrace: boolean;
  garden: boolean;
  bbq: boolean;
  oceanView: boolean;
  mountainView: boolean;
  cityView: boolean;
  lakeView: boolean;
  gardenView: boolean;

  // Recreation & Wellness
  pool: boolean;
  hotTub: boolean;
  sauna: boolean;
  gym: boolean;
  spa: boolean;
  gameRoom: boolean;

  // Transportation & Parking
  parking: boolean;
  garage: boolean;
  electricCarCharging: boolean;
  bicycles: boolean;

  // Family & Accessibility
  familyFriendly: boolean;
  crib: boolean;
  highChair: boolean;
  wheelchair: boolean;

  // Policies & Services
  petFriendly: boolean;
  smokingAllowed: boolean;
  longTermStays: boolean;
  selfCheckIn: boolean;
  concierge: boolean;

  // Security & Safety
  securitySystem: boolean;
  smokeDetector: boolean;
  carbonMonoxideDetector: boolean;
  firstAidKit: boolean;

  // Additional amenities
  other: string[];
}

// Default amenities structure
export const getDefaultAmenities = (): AmenitiesData => ({
  // Basic essentials
  wifi: false,
  airConditioning: false,
  heating: false,

  // Kitchen & Dining
  kitchen: false,
  kitchenette: false,
  microwave: false,
  refrigerator: false,
  dishwasher: false,
  coffeemaker: false,
  toaster: false,
  oven: false,
  stove: false,
  dining: false,
  restaurant: false,
  breakfast: false,

  // Bathroom & Laundry
  hairDryer: false,
  bathtub: false,
  shower: false,
  washer: false,
  dryer: false,
  iron: false,
  bathrobes: false,

  // Bedroom & Living
  tv: false,
  cableTV: false,
  netflix: false,
  desk: false,
  safe: false,
  fireplace: false,

  // Outdoor & Views
  balcony: false,
  terrace: false,
  garden: false,
  bbq: false,
  oceanView: false,
  mountainView: false,
  cityView: false,
  lakeView: false,
  gardenView: false,

  // Recreation & Wellness
  pool: false,
  hotTub: false,
  sauna: false,
  gym: false,
  spa: false,
  gameRoom: false,

  // Transportation & Parking
  parking: false,
  garage: false,
  electricCarCharging: false,
  bicycles: false,

  // Family & Accessibility
  familyFriendly: false,
  crib: false,
  highChair: false,
  wheelchair: false,

  // Policies & Services
  petFriendly: false,
  smokingAllowed: false,
  longTermStays: false,
  selfCheckIn: false,
  concierge: false,

  // Security & Safety
  securitySystem: false,
  smokeDetector: false,
  carbonMonoxideDetector: false,
  firstAidKit: false,

  // Additional amenities
  other: [],
});

// Amenity categories for organized display
export const amenityCategories = [
  {
    title: 'Basic Essentials',
    items: [
      { key: 'wifi' as const, label: 'Free WiFi' },
      { key: 'airConditioning' as const, label: 'Air Conditioning' },
      { key: 'heating' as const, label: 'Heating' },
    ],
  },
  {
    title: 'Kitchen & Dining',
    items: [
      { key: 'kitchen' as const, label: 'Full Kitchen' },
      { key: 'kitchenette' as const, label: 'Kitchenette' },
      { key: 'microwave' as const, label: 'Microwave' },
      { key: 'refrigerator' as const, label: 'Refrigerator' },
      { key: 'dishwasher' as const, label: 'Dishwasher' },
      { key: 'coffeemaker' as const, label: 'Coffee Maker' },
      { key: 'toaster' as const, label: 'Toaster' },
      { key: 'oven' as const, label: 'Oven' },
      { key: 'stove' as const, label: 'Stove' },
      { key: 'dining' as const, label: 'Dining Area' },
      { key: 'restaurant' as const, label: 'Restaurant' },
      { key: 'breakfast' as const, label: 'Breakfast Included' },
    ],
  },
  {
    title: 'Bathroom & Laundry',
    items: [
      { key: 'hairDryer' as const, label: 'Hair Dryer' },
      { key: 'bathtub' as const, label: 'Bathtub' },
      { key: 'shower' as const, label: 'Shower' },
      { key: 'washer' as const, label: 'Washing Machine' },
      { key: 'dryer' as const, label: 'Dryer' },
      { key: 'iron' as const, label: 'Iron & Ironing Board' },
      { key: 'bathrobes' as const, label: 'Bathrobes' },
    ],
  },
  {
    title: 'Bedroom & Living',
    items: [
      { key: 'tv' as const, label: 'TV' },
      { key: 'cableTV' as const, label: 'Cable TV' },
      { key: 'netflix' as const, label: 'Netflix/Streaming' },
      { key: 'desk' as const, label: 'Desk/Workspace' },
      { key: 'safe' as const, label: 'Safe' },
      { key: 'fireplace' as const, label: 'Fireplace' },
    ],
  },
  {
    title: 'Outdoor & Views',
    items: [
      { key: 'balcony' as const, label: 'Balcony' },
      { key: 'terrace' as const, label: 'Terrace' },
      { key: 'garden' as const, label: 'Garden' },
      { key: 'bbq' as const, label: 'BBQ/Grill' },
      { key: 'oceanView' as const, label: 'Ocean View' },
      { key: 'mountainView' as const, label: 'Mountain View' },
      { key: 'cityView' as const, label: 'City View' },
      { key: 'lakeView' as const, label: 'Lake View' },
      { key: 'gardenView' as const, label: 'Garden View' },
    ],
  },
  {
    title: 'Recreation & Wellness',
    items: [
      { key: 'pool' as const, label: 'Swimming Pool' },
      { key: 'hotTub' as const, label: 'Hot Tub/Jacuzzi' },
      { key: 'sauna' as const, label: 'Sauna' },
      { key: 'gym' as const, label: 'Gym/Fitness Center' },
      { key: 'spa' as const, label: 'Spa Services' },
      { key: 'gameRoom' as const, label: 'Game Room' },
    ],
  },
  {
    title: 'Transportation & Parking',
    items: [
      { key: 'parking' as const, label: 'Parking' },
      { key: 'garage' as const, label: 'Garage' },
      { key: 'electricCarCharging' as const, label: 'Electric Car Charging' },
      { key: 'bicycles' as const, label: 'Bicycles' },
    ],
  },
  {
    title: 'Family & Accessibility',
    items: [
      { key: 'familyFriendly' as const, label: 'Family Friendly' },
      { key: 'crib' as const, label: 'Baby Crib' },
      { key: 'highChair' as const, label: 'High Chair' },
      { key: 'wheelchair' as const, label: 'Wheelchair Accessible' },
    ],
  },
  {
    title: 'Policies & Services',
    items: [
      { key: 'petFriendly' as const, label: 'Pet Friendly' },
      { key: 'smokingAllowed' as const, label: 'Smoking Allowed' },
      { key: 'longTermStays' as const, label: 'Long Term Stays' },
      { key: 'selfCheckIn' as const, label: 'Self Check-in' },
      { key: 'concierge' as const, label: 'Concierge Service' },
    ],
  },
  {
    title: 'Security & Safety',
    items: [
      { key: 'securitySystem' as const, label: 'Security System' },
      { key: 'smokeDetector' as const, label: 'Smoke Detector' },
      {
        key: 'carbonMonoxideDetector' as const,
        label: 'Carbon Monoxide Detector',
      },
      { key: 'firstAidKit' as const, label: 'First Aid Kit' },
    ],
  },
];

// Amenity labels for display - flattened from categories for easy lookup
export const amenityLabels: { [key: string]: string } = {
  // Basic essentials
  wifi: 'WiFi',
  airConditioning: 'A/C',
  heating: 'Heating',

  // Kitchen & Dining
  kitchen: 'Kitchen',
  kitchenette: 'Kitchenette',
  microwave: 'Microwave',
  refrigerator: 'Refrigerator',
  dishwasher: 'Dishwasher',
  coffeemaker: 'Coffee Maker',
  toaster: 'Toaster',
  oven: 'Oven',
  stove: 'Stove',
  dining: 'Dining Area',
  restaurant: 'Restaurant',
  breakfast: 'Breakfast',

  // Bathroom & Laundry
  hairDryer: 'Hair Dryer',
  bathtub: 'Bathtub',
  shower: 'Shower',
  washer: 'Washer',
  dryer: 'Dryer',
  iron: 'Iron',
  bathrobes: 'Bathrobes',

  // Bedroom & Living
  tv: 'TV',
  cableTV: 'Cable TV',
  netflix: 'Netflix',
  desk: 'Desk',
  safe: 'Safe',
  fireplace: 'Fireplace',

  // Outdoor & Views
  balcony: 'Balcony',
  terrace: 'Terrace',
  garden: 'Garden',
  bbq: 'BBQ/Grill',
  oceanView: 'Ocean View',
  mountainView: 'Mountain View',
  cityView: 'City View',
  lakeView: 'Lake View',
  gardenView: 'Garden View',

  // Recreation & Wellness
  pool: 'Pool',
  hotTub: 'Hot Tub',
  sauna: 'Sauna',
  gym: 'Gym',
  spa: 'Spa',
  gameRoom: 'Game Room',

  // Transportation & Parking
  parking: 'Parking',
  garage: 'Garage',
  electricCarCharging: 'EV Charging',
  bicycles: 'Bicycles',

  // Family & Accessibility
  familyFriendly: 'Family Friendly',
  crib: 'Baby Crib',
  highChair: 'High Chair',
  wheelchair: 'Wheelchair Accessible',

  // Policies & Services
  petFriendly: 'Pet Friendly',
  smokingAllowed: 'Smoking',
  longTermStays: 'Long Term Stays',
  selfCheckIn: 'Self Check-in',
  concierge: 'Concierge',

  // Security & Safety
  securitySystem: 'Security System',
  smokeDetector: 'Smoke Detector',
  carbonMonoxideDetector: 'CO Detector',
  firstAidKit: 'First Aid Kit',
};

// Extended amenity labels for confirmation modal (more descriptive)
export const extendedAmenityLabels: { [key: string]: string } = {
  // Basic essentials
  wifi: 'WiFi',
  airConditioning: 'Air Conditioning',
  heating: 'Heating',

  // Kitchen & Dining
  kitchen: 'Kitchen',
  kitchenette: 'Kitchenette',
  microwave: 'Microwave',
  refrigerator: 'Refrigerator',
  dishwasher: 'Dishwasher',
  coffeemaker: 'Coffee Maker',
  toaster: 'Toaster',
  oven: 'Oven',
  stove: 'Stove',
  dining: 'Dining Area',
  restaurant: 'Restaurant',
  breakfast: 'Breakfast',

  // Bathroom & Laundry
  hairDryer: 'Hair Dryer',
  bathtub: 'Bathtub',
  shower: 'Shower',
  washer: 'Washer',
  dryer: 'Dryer',
  iron: 'Iron',
  bathrobes: 'Bathrobes',

  // Bedroom & Living
  tv: 'TV',
  cableTV: 'Cable TV',
  netflix: 'Netflix',
  desk: 'Desk',
  safe: 'Safe',
  fireplace: 'Fireplace',

  // Outdoor & Views
  balcony: 'Balcony',
  terrace: 'Terrace',
  garden: 'Garden',
  bbq: 'BBQ/Grill',
  oceanView: 'Ocean View',
  mountainView: 'Mountain View',
  cityView: 'City View',
  lakeView: 'Lake View',
  gardenView: 'Garden View',

  // Recreation & Wellness
  pool: 'Pool',
  hotTub: 'Hot Tub',
  sauna: 'Sauna',
  gym: 'Gym',
  spa: 'Spa',
  gameRoom: 'Game Room',

  // Transportation & Parking
  parking: 'Parking',
  garage: 'Garage',
  electricCarCharging: 'EV Charging',
  bicycles: 'Bicycles',

  // Family & Accessibility
  familyFriendly: 'Family Friendly',
  crib: 'Baby Crib',
  highChair: 'High Chair',
  wheelchair: 'Wheelchair Accessible',

  // Policies & Services
  petFriendly: 'Pet Friendly',
  smokingAllowed: 'Smoking Allowed',
  longTermStays: 'Long Term Stays',
  selfCheckIn: 'Self Check-in',
  concierge: 'Concierge',

  // Security & Safety
  securitySystem: 'Security System',
  smokeDetector: 'Smoke Detector',
  carbonMonoxideDetector: 'CO Detector',
  firstAidKit: 'First Aid Kit',
};
