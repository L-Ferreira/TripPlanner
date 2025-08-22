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
    title: 'Essenciais Básicos',
    items: [
      { key: 'wifi' as const, label: 'WiFi Grátis' },
      { key: 'airConditioning' as const, label: 'Ar Condicionado' },
      { key: 'heating' as const, label: 'Aquecimento' },
    ],
  },
  {
    title: 'Cozinha e Refeições',
    items: [
      { key: 'kitchen' as const, label: 'Cozinha Completa' },
      { key: 'kitchenette' as const, label: 'Kitchenette' },
      { key: 'microwave' as const, label: 'Micro-ondas' },
      { key: 'refrigerator' as const, label: 'Frigorífico' },
      { key: 'dishwasher' as const, label: 'Máquina de Lavar Louça' },
      { key: 'coffeemaker' as const, label: 'Máquina de Café' },
      { key: 'toaster' as const, label: 'Torradeira' },
      { key: 'oven' as const, label: 'Forno' },
      { key: 'stove' as const, label: 'Fogão' },
      { key: 'dining' as const, label: 'Área de Refeições' },
      { key: 'restaurant' as const, label: 'Restaurante' },
      { key: 'breakfast' as const, label: 'Pequeno-almoço Incluído' },
    ],
  },
  {
    title: 'Casa de Banho e Lavandaria',
    items: [
      { key: 'hairDryer' as const, label: 'Secador de Cabelo' },
      { key: 'bathtub' as const, label: 'Banheira' },
      { key: 'shower' as const, label: 'Duche' },
      { key: 'washer' as const, label: 'Máquina de Lavar' },
      { key: 'dryer' as const, label: 'Secador de Roupa' },
      { key: 'iron' as const, label: 'Ferro e Tábua de Engomar' },
      { key: 'bathrobes' as const, label: 'Roupões' },
    ],
  },
  {
    title: 'Quarto e Sala',
    items: [
      { key: 'tv' as const, label: 'TV' },
      { key: 'cableTV' as const, label: 'TV por Cabo' },
      { key: 'netflix' as const, label: 'Netflix/Streaming' },
      { key: 'desk' as const, label: 'Secretária/Espaço de Trabalho' },
      { key: 'safe' as const, label: 'Cofre' },
      { key: 'fireplace' as const, label: 'Lareira' },
    ],
  },
  {
    title: 'Exterior e Vistas',
    items: [
      { key: 'balcony' as const, label: 'Varanda' },
      { key: 'terrace' as const, label: 'Terraço' },
      { key: 'garden' as const, label: 'Jardim' },
      { key: 'bbq' as const, label: 'Churrasqueira' },
      { key: 'oceanView' as const, label: 'Vista de Mar' },
      { key: 'mountainView' as const, label: 'Vista de Montanha' },
      { key: 'cityView' as const, label: 'Vista de Cidade' },
      { key: 'lakeView' as const, label: 'Vista de Lago' },
      { key: 'gardenView' as const, label: 'Vista de Jardim' },
    ],
  },
  {
    title: 'Recreação e Bem-estar',
    items: [
      { key: 'pool' as const, label: 'Piscina' },
      { key: 'hotTub' as const, label: 'Jacuzzi' },
      { key: 'sauna' as const, label: 'Sauna' },
      { key: 'gym' as const, label: 'Ginásio' },
      { key: 'spa' as const, label: 'Serviços de Spa' },
      { key: 'gameRoom' as const, label: 'Sala de Jogos' },
    ],
  },
  {
    title: 'Transporte e Estacionamento',
    items: [
      { key: 'parking' as const, label: 'Estacionamento' },
      { key: 'garage' as const, label: 'Garagem' },
      { key: 'electricCarCharging' as const, label: 'Carregamento de Carros Eléctricos' },
      { key: 'bicycles' as const, label: 'Bicicletas' },
    ],
  },
  {
    title: 'Família e Acessibilidade',
    items: [
      { key: 'familyFriendly' as const, label: 'Adequado para Famílias' },
      { key: 'crib' as const, label: 'Berço de Bebé' },
      { key: 'highChair' as const, label: 'Cadeira Alta' },
      { key: 'wheelchair' as const, label: 'Acessível a Cadeiras de Rodas' },
    ],
  },
  {
    title: 'Políticas e Serviços',
    items: [
      { key: 'petFriendly' as const, label: 'Aceita Animais' },
      { key: 'smokingAllowed' as const, label: 'Permitido Fumar' },
      { key: 'longTermStays' as const, label: 'Estadias de Longa Duração' },
      { key: 'selfCheckIn' as const, label: 'Check-in Autónomo' },
      { key: 'concierge' as const, label: 'Serviço de Concierge' },
    ],
  },
  {
    title: 'Segurança',
    items: [
      { key: 'securitySystem' as const, label: 'Sistema de Segurança' },
      { key: 'smokeDetector' as const, label: 'Detector de Fumo' },
      {
        key: 'carbonMonoxideDetector' as const,
        label: 'Detector de Monóxido de Carbono',
      },
      { key: 'firstAidKit' as const, label: 'Kit de Primeiros Socorros' },
    ],
  },
];

// Amenity labels for display - flattened from categories for easy lookup
export const amenityLabels: { [key: string]: string } = {
  // Basic essentials
  wifi: 'WiFi',
  airConditioning: 'A/C',
  heating: 'Aquecimento',

  // Kitchen & Dining
  kitchen: 'Cozinha',
  kitchenette: 'Kitchenette',
  microwave: 'Micro-ondas',
  refrigerator: 'Frigorífico',
  dishwasher: 'Máq. Louça',
  coffeemaker: 'Máq. Café',
  toaster: 'Torradeira',
  oven: 'Forno',
  stove: 'Fogão',
  dining: 'Área Refeições',
  restaurant: 'Restaurante',
  breakfast: 'Pequeno-almoço',

  // Bathroom & Laundry
  hairDryer: 'Secador',
  bathtub: 'Banheira',
  shower: 'Duche',
  washer: 'Máq. Lavar',
  dryer: 'Secador Roupa',
  iron: 'Ferro',
  bathrobes: 'Roupões',

  // Bedroom & Living
  tv: 'TV',
  cableTV: 'TV Cabo',
  netflix: 'Netflix',
  desk: 'Secretária',
  safe: 'Cofre',
  fireplace: 'Lareira',

  // Outdoor & Views
  balcony: 'Varanda',
  terrace: 'Terraço',
  garden: 'Jardim',
  bbq: 'Churrasqueira',
  oceanView: 'Vista Mar',
  mountainView: 'Vista Montanha',
  cityView: 'Vista Cidade',
  lakeView: 'Vista Lago',
  gardenView: 'Vista Jardim',

  // Recreation & Wellness
  pool: 'Piscina',
  hotTub: 'Jacuzzi',
  sauna: 'Sauna',
  gym: 'Ginásio',
  spa: 'Spa',
  gameRoom: 'Sala Jogos',

  // Transportation & Parking
  parking: 'Estacionamento',
  garage: 'Garagem',
  electricCarCharging: 'Carregamento EV',
  bicycles: 'Bicicletas',

  // Family & Accessibility
  familyFriendly: 'Adequado Famílias',
  crib: 'Berço Bebé',
  highChair: 'Cadeira Alta',
  wheelchair: 'Acessível Cadeiras',

  // Policies & Services
  petFriendly: 'Aceita Animais',
  smokingAllowed: 'Permite Fumar',
  longTermStays: 'Estadias Longas',
  selfCheckIn: 'Check-in Auto',
  concierge: 'Concierge',

  // Security & Safety
  securitySystem: 'Sistema Segurança',
  smokeDetector: 'Detector Fumo',
  carbonMonoxideDetector: 'Detector CO',
  firstAidKit: 'Kit Primeiros Socorros',
};

// Extended amenity labels for confirmation modal (more descriptive)
export const extendedAmenityLabels: { [key: string]: string } = {
  // Basic essentials
  wifi: 'WiFi',
  airConditioning: 'Ar Condicionado',
  heating: 'Aquecimento',

  // Kitchen & Dining
  kitchen: 'Cozinha',
  kitchenette: 'Kitchenette',
  microwave: 'Micro-ondas',
  refrigerator: 'Frigorífico',
  dishwasher: 'Máquina de Lavar Louça',
  coffeemaker: 'Máquina de Café',
  toaster: 'Torradeira',
  oven: 'Forno',
  stove: 'Fogão',
  dining: 'Área de Refeições',
  restaurant: 'Restaurante',
  breakfast: 'Pequeno-almoço',

  // Bathroom & Laundry
  hairDryer: 'Secador de Cabelo',
  bathtub: 'Banheira',
  shower: 'Duche',
  washer: 'Máquina de Lavar',
  dryer: 'Secador de Roupa',
  iron: 'Ferro',
  bathrobes: 'Roupões',

  // Bedroom & Living
  tv: 'TV',
  cableTV: 'TV por Cabo',
  netflix: 'Netflix',
  desk: 'Secretária',
  safe: 'Cofre',
  fireplace: 'Lareira',

  // Outdoor & Views
  balcony: 'Varanda',
  terrace: 'Terraço',
  garden: 'Jardim',
  bbq: 'Churrasqueira',
  oceanView: 'Vista de Mar',
  mountainView: 'Vista de Montanha',
  cityView: 'Vista de Cidade',
  lakeView: 'Vista de Lago',
  gardenView: 'Vista de Jardim',

  // Recreation & Wellness
  pool: 'Piscina',
  hotTub: 'Jacuzzi',
  sauna: 'Sauna',
  gym: 'Ginásio',
  spa: 'Spa',
  gameRoom: 'Sala de Jogos',

  // Transportation & Parking
  parking: 'Estacionamento',
  garage: 'Garagem',
  electricCarCharging: 'Carregamento de Carros Eléctricos',
  bicycles: 'Bicicletas',

  // Family & Accessibility
  familyFriendly: 'Adequado para Famílias',
  crib: 'Berço de Bebé',
  highChair: 'Cadeira Alta',
  wheelchair: 'Acessível a Cadeiras de Rodas',

  // Policies & Services
  petFriendly: 'Aceita Animais',
  smokingAllowed: 'Permitido Fumar',
  longTermStays: 'Estadias de Longa Duração',
  selfCheckIn: 'Check-in Autónomo',
  concierge: 'Concierge',

  // Security & Safety
  securitySystem: 'Sistema de Segurança',
  smokeDetector: 'Detector de Fumo',
  carbonMonoxideDetector: 'Detector de Monóxido de Carbono',
  firstAidKit: 'Kit de Primeiros Socorros',
};
