export interface BrandAsset {
  type: 'logo' | 'font' | 'color';
  url?: string;
  value?: string;
  name?: string;
  category?: 'dark' | 'light' | 'accent' | 'background' | 'text' | 'heading' | 'body';
  format?: 'google' | 'woff2' | 'woff' | 'ttf' | 'otf' | 'eot' | 'unknown';
  confidence: number;
}

export interface BrandAssets {
  logos: BrandAsset[];
  fonts: BrandAsset[];
  colors: BrandAsset[];
  agencyDetails?: {
    name?: string;
    email?: string;
    phone?: string;
    website?: string;
    copyrightText?: string;
  };
} 