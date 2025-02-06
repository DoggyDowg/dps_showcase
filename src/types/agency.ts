export interface OfficeAddress {
  id: string;
  name: string;
  street_address: string;
  suburb: string;
  state_postcode: string;
  phone: string;
}

export interface Agency {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  email: string;
  phone: string;
  website: string;
  status: 'active' | 'inactive';
  propertyCount?: number;
  agentCount?: number;
  copyright: string;
  branding?: {
    colors?: {
      primary?: string;
      secondary?: string;
      dark?: string;
      light?: string;
      accent?: string;
    };
    logo?: {
      dark?: string;
      light?: string;
    };
    favicon?: string;
    typography?: {
      headingFont?: {
        url: string;
        format: string;
      };
      bodyFont?: {
        url: string;
        format: string;
      };
    };
  };
  footer_links?: FooterLink[];
  menu_items?: MenuItems;
  office_addresses?: OfficeAddress[];
}

export interface FooterLink {
  id: string;
  title: string;
  url: string | null;
}

export interface MenuItems {
  contact: string;
  features: string;
  viewings: string;
  lifestyle: string;
  neighbourhood: string;
}