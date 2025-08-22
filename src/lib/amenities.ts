import { useTranslation } from 'react-i18next';

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

// Hook to get translated amenity categories
export const useAmenityCategories = () => {
  const { t } = useTranslation();

  return [
    {
      title: t('amenities.categories.basicEssentials'),
      items: [
        { key: 'wifi' as const, label: t('amenities.labels.freeWiFi') },
        { key: 'airConditioning' as const, label: t('amenities.labels.airConditioning') },
        { key: 'heating' as const, label: t('amenities.labels.heating') },
      ],
    },
    {
      title: t('amenities.categories.kitchenDining'),
      items: [
        { key: 'kitchen' as const, label: t('amenities.labels.fullKitchen') },
        { key: 'kitchenette' as const, label: t('amenities.labels.kitchenette') },
        { key: 'microwave' as const, label: t('amenities.labels.microwave') },
        { key: 'refrigerator' as const, label: t('amenities.labels.refrigerator') },
        { key: 'dishwasher' as const, label: t('amenities.labels.dishwasher') },
        { key: 'coffeemaker' as const, label: t('amenities.labels.coffeeMaker') },
        { key: 'toaster' as const, label: t('amenities.labels.toaster') },
        { key: 'oven' as const, label: t('amenities.labels.oven') },
        { key: 'stove' as const, label: t('amenities.labels.stove') },
        { key: 'dining' as const, label: t('amenities.labels.diningArea') },
        { key: 'restaurant' as const, label: t('amenities.labels.restaurant') },
        { key: 'breakfast' as const, label: t('amenities.labels.breakfast') },
      ],
    },
    {
      title: t('amenities.categories.bathroom'),
      items: [
        { key: 'hairDryer' as const, label: t('amenities.labels.hairdryer') },
        { key: 'bathtub' as const, label: t('amenities.labels.bathtub') },
        { key: 'shower' as const, label: t('amenities.labels.shower') },
        { key: 'washer' as const, label: t('amenities.labels.washer') },
        { key: 'dryer' as const, label: t('amenities.labels.dryer') },
        { key: 'iron' as const, label: t('amenities.labels.iron') },
        { key: 'bathrobes' as const, label: t('amenities.labels.bathrobes') },
      ],
    },
    {
      title: t('amenities.categories.bedroom'),
      items: [
        { key: 'tv' as const, label: t('amenities.labels.tv') },
        { key: 'cableTV' as const, label: t('amenities.labels.cableTV') },
        { key: 'netflix' as const, label: t('amenities.labels.netflix') },
        { key: 'desk' as const, label: t('amenities.labels.desk') },
        { key: 'safe' as const, label: t('amenities.labels.safe') },
        { key: 'fireplace' as const, label: t('amenities.labels.fireplace') },
      ],
    },
    {
      title: t('amenities.categories.outdoor'),
      items: [
        { key: 'balcony' as const, label: t('amenities.labels.balcony') },
        { key: 'terrace' as const, label: t('amenities.labels.terrace') },
        { key: 'garden' as const, label: t('amenities.labels.garden') },
        { key: 'bbq' as const, label: t('amenities.labels.bbq') },
        { key: 'oceanView' as const, label: t('amenities.labels.oceanView') },
        { key: 'mountainView' as const, label: t('amenities.labels.mountainView') },
        { key: 'cityView' as const, label: t('amenities.labels.cityView') },
        { key: 'lakeView' as const, label: t('amenities.labels.lakeView') },
        { key: 'gardenView' as const, label: t('amenities.labels.gardenView') },
      ],
    },
    {
      title: t('amenities.categories.wellness'),
      items: [
        { key: 'pool' as const, label: t('amenities.labels.swimmingPool') },
        { key: 'hotTub' as const, label: t('amenities.labels.hotTub') },
        { key: 'sauna' as const, label: t('amenities.labels.sauna') },
        { key: 'gym' as const, label: t('amenities.labels.gym') },
        { key: 'spa' as const, label: t('amenities.labels.spa') },
        { key: 'gameRoom' as const, label: t('amenities.labels.gameRoom') },
      ],
    },
    {
      title: t('amenities.categories.transportation'),
      items: [
        { key: 'parking' as const, label: t('amenities.labels.parking') },
        { key: 'garage' as const, label: t('amenities.labels.garage') },
        { key: 'electricCarCharging' as const, label: t('amenities.labels.electricCarCharging') },
        { key: 'bicycles' as const, label: t('amenities.labels.bicycleRental') },
      ],
    },
    {
      title: t('amenities.categories.family'),
      items: [
        { key: 'familyFriendly' as const, label: t('amenities.labels.familyFriendly') },
        { key: 'crib' as const, label: t('amenities.labels.crib') },
        { key: 'highChair' as const, label: t('amenities.labels.highChair') },
        { key: 'wheelchair' as const, label: t('amenities.labels.wheelchairAccessible') },
      ],
    },
    {
      title: t('amenities.categories.business'),
      items: [
        { key: 'petFriendly' as const, label: t('amenities.labels.petFriendly') },
        { key: 'smokingAllowed' as const, label: t('amenities.labels.smokingAllowed') },
        { key: 'longTermStays' as const, label: t('amenities.labels.longTermStays') },
        { key: 'selfCheckIn' as const, label: t('amenities.labels.selfCheckIn') },
        { key: 'concierge' as const, label: t('amenities.labels.concierge') },
      ],
    },
    {
      title: t('amenities.categories.accessibility'),
      items: [
        { key: 'securitySystem' as const, label: t('amenities.labels.securitySystem') },
        { key: 'smokeDetector' as const, label: t('amenities.labels.smokeDetector') },
        { key: 'carbonMonoxideDetector' as const, label: t('amenities.labels.carbonMonoxideDetector') },
        { key: 'firstAidKit' as const, label: t('amenities.labels.firstAidKit') },
      ],
    },
  ];
};

// Hook to get translated amenity labels
export const useAmenityLabels = () => {
  const { t } = useTranslation();

  return {
    // Basic essentials
    wifi: t('amenities.labels.freeWiFi'),
    airConditioning: t('amenities.labels.airConditioning'),
    heating: t('amenities.labels.heating'),

    // Kitchen & Dining
    kitchen: t('amenities.labels.fullKitchen'),
    kitchenette: t('amenities.labels.kitchenette'),
    microwave: t('amenities.labels.microwave'),
    refrigerator: t('amenities.labels.refrigerator'),
    dishwasher: t('amenities.labels.dishwasher'),
    coffeemaker: t('amenities.labels.coffeeMaker'),
    toaster: t('amenities.labels.toaster'),
    oven: t('amenities.labels.oven'),
    stove: t('amenities.labels.stove'),
    dining: t('amenities.labels.diningArea'),
    restaurant: t('amenities.labels.restaurant'),
    breakfast: t('amenities.labels.breakfast'),

    // Bathroom & Laundry
    hairDryer: t('amenities.labels.hairdryer'),
    bathtub: t('amenities.labels.bathtub'),
    shower: t('amenities.labels.shower'),
    washer: t('amenities.labels.washer'),
    dryer: t('amenities.labels.dryer'),
    iron: t('amenities.labels.iron'),
    bathrobes: t('amenities.labels.bathrobes'),

    // Bedroom & Living
    tv: t('amenities.labels.tv'),
    cableTV: t('amenities.labels.cableTV'),
    netflix: t('amenities.labels.netflix'),
    desk: t('amenities.labels.desk'),
    safe: t('amenities.labels.safe'),
    fireplace: t('amenities.labels.fireplace'),

    // Outdoor & Views
    balcony: t('amenities.labels.balcony'),
    terrace: t('amenities.labels.terrace'),
    garden: t('amenities.labels.garden'),
    bbq: t('amenities.labels.bbq'),
    oceanView: t('amenities.labels.oceanView'),
    mountainView: t('amenities.labels.mountainView'),
    cityView: t('amenities.labels.cityView'),
    lakeView: t('amenities.labels.lakeView'),
    gardenView: t('amenities.labels.gardenView'),

    // Recreation & Wellness
    pool: t('amenities.labels.swimmingPool'),
    hotTub: t('amenities.labels.hotTub'),
    sauna: t('amenities.labels.sauna'),
    gym: t('amenities.labels.gym'),
    spa: t('amenities.labels.spa'),
    gameRoom: t('amenities.labels.gameRoom'),

    // Transportation & Parking
    parking: t('amenities.labels.parking'),
    garage: t('amenities.labels.garage'),
    electricCarCharging: t('amenities.labels.electricCarCharging'),
    bicycles: t('amenities.labels.bicycleRental'),

    // Family & Accessibility
    familyFriendly: t('amenities.labels.familyFriendly'),
    crib: t('amenities.labels.crib'),
    highChair: t('amenities.labels.highChair'),
    wheelchair: t('amenities.labels.wheelchairAccessible'),

    // Policies & Services
    petFriendly: t('amenities.labels.petFriendly'),
    smokingAllowed: t('amenities.labels.smokingAllowed'),
    longTermStays: t('amenities.labels.longTermStays'),
    selfCheckIn: t('amenities.labels.selfCheckIn'),
    concierge: t('amenities.labels.concierge'),

    // Security & Safety
    securitySystem: t('amenities.labels.securitySystem'),
    smokeDetector: t('amenities.labels.smokeDetector'),
    carbonMonoxideDetector: t('amenities.labels.carbonMonoxideDetector'),
    firstAidKit: t('amenities.labels.firstAidKit'),
  };
};

// Hook to get extended amenity labels (more descriptive)
export const useExtendedAmenityLabels = () => {
  const { t } = useTranslation();

  return {
    // Basic essentials
    wifi: t('amenities.labels.freeWiFi'),
    airConditioning: t('amenities.labels.airConditioning'),
    heating: t('amenities.labels.heating'),

    // Kitchen & Dining
    kitchen: t('amenities.labels.fullKitchen'),
    kitchenette: t('amenities.labels.kitchenette'),
    microwave: t('amenities.labels.microwave'),
    refrigerator: t('amenities.labels.refrigerator'),
    dishwasher: t('amenities.labels.dishwasher'),
    coffeemaker: t('amenities.labels.coffeeMaker'),
    toaster: t('amenities.labels.toaster'),
    oven: t('amenities.labels.oven'),
    stove: t('amenities.labels.stove'),
    dining: t('amenities.labels.diningArea'),
    restaurant: t('amenities.labels.restaurant'),
    breakfast: t('amenities.labels.breakfast'),

    // Bathroom & Laundry
    hairDryer: t('amenities.labels.hairdryer'),
    bathtub: t('amenities.labels.bathtub'),
    shower: t('amenities.labels.shower'),
    washer: t('amenities.labels.washer'),
    dryer: t('amenities.labels.dryer'),
    iron: t('amenities.labels.iron'),
    bathrobes: t('amenities.labels.bathrobes'),

    // Bedroom & Living
    tv: t('amenities.labels.tv'),
    cableTV: t('amenities.labels.cableTV'),
    netflix: t('amenities.labels.netflix'),
    desk: t('amenities.labels.desk'),
    safe: t('amenities.labels.safe'),
    fireplace: t('amenities.labels.fireplace'),

    // Outdoor & Views
    balcony: t('amenities.labels.balcony'),
    terrace: t('amenities.labels.terrace'),
    garden: t('amenities.labels.garden'),
    bbq: t('amenities.labels.bbq'),
    oceanView: t('amenities.labels.oceanView'),
    mountainView: t('amenities.labels.mountainView'),
    cityView: t('amenities.labels.cityView'),
    lakeView: t('amenities.labels.lakeView'),
    gardenView: t('amenities.labels.gardenView'),

    // Recreation & Wellness
    pool: t('amenities.labels.swimmingPool'),
    hotTub: t('amenities.labels.hotTub'),
    sauna: t('amenities.labels.sauna'),
    gym: t('amenities.labels.gym'),
    spa: t('amenities.labels.spa'),
    gameRoom: t('amenities.labels.gameRoom'),

    // Transportation & Parking
    parking: t('amenities.labels.parking'),
    garage: t('amenities.labels.garage'),
    electricCarCharging: t('amenities.labels.electricCarCharging'),
    bicycles: t('amenities.labels.bicycleRental'),

    // Family & Accessibility
    familyFriendly: t('amenities.labels.familyFriendly'),
    crib: t('amenities.labels.crib'),
    highChair: t('amenities.labels.highChair'),
    wheelchair: t('amenities.labels.wheelchairAccessible'),

    // Policies & Services
    petFriendly: t('amenities.labels.petFriendly'),
    smokingAllowed: t('amenities.labels.smokingAllowed'),
    longTermStays: t('amenities.labels.longTermStays'),
    selfCheckIn: t('amenities.labels.selfCheckIn'),
    concierge: t('amenities.labels.concierge'),

    // Security & Safety
    securitySystem: t('amenities.labels.securitySystem'),
    smokeDetector: t('amenities.labels.smokeDetector'),
    carbonMonoxideDetector: t('amenities.labels.carbonMonoxideDetector'),
    firstAidKit: t('amenities.labels.firstAidKit'),
  };
};
