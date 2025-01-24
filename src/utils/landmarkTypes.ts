import { ShoppingBasket, Drama, GraduationCap, Utensils, TrainFront } from 'lucide-react';

export type LandmarkType = 'shopping' | 'dining' | 'schools' | 'leisure' | 'transport';

export interface LandmarkTypeConfig {
  type: LandmarkType;
  color: string;
  markerColor: string;
  icon: typeof ShoppingBasket | typeof Drama | typeof GraduationCap | typeof Utensils | typeof TrainFront;
  label: string;
}

export const LANDMARK_TYPES: LandmarkTypeConfig[] = [
  {
    type: 'shopping',
    color: 'blue',
    markerColor: '#3B82F6',
    icon: ShoppingBasket,
    label: 'Shopping'
  },
  {
    type: 'dining',
    color: 'orange',
    markerColor: '#F97316',
    icon: Utensils,
    label: 'Dining'
  },
  {
    type: 'schools',
    color: 'green',
    markerColor: '#22C55E',
    icon: GraduationCap,
    label: 'Schools'
  },
  {
    type: 'leisure',
    color: 'purple',
    markerColor: '#A855F7',
    icon: Drama,
    label: 'Leisure'
  },
  {
    type: 'transport',
    color: 'red',
    markerColor: '#EF4444',
    icon: TrainFront,
    label: 'Transport'
  }
];

// Helper function to get LANDMARK_TYPES as a record
export const LANDMARK_TYPES_RECORD: Record<LandmarkType, LandmarkTypeConfig> = LANDMARK_TYPES.reduce(
  (acc, config) => ({
    ...acc,
    [config.type]: config
  }),
  {} as Record<LandmarkType, LandmarkTypeConfig>
);

export function getLandmarkTypeConfig(type: LandmarkType): LandmarkTypeConfig {
  return LANDMARK_TYPES.find(config => config.type === type) || LANDMARK_TYPES[0];
}

export const PROPERTY_MARKER_COLOR = '#000000'; 