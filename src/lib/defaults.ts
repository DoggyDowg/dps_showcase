import type { Agency } from '@/types/agency';

export const defaultAgency: Partial<Agency> = {
  name: '',
  email: '',
  phone: '',
  website: '',
  status: 'active',
  copyright: '',
  branding: {
    colors: {
      dark: '#000000',
      light: '#ffffff',
      accent: '#000000'
    },
    logo: {
      dark: '',
      light: ''
    },
    typography: {
      headingFont: {
        url: '',
        format: 'woff2'
      },
      bodyFont: {
        url: '',
        format: 'woff2'
      }
    }
  },
  footer_links: [
    { id: 'home', title: 'Visit Us', url: '' },
    { id: 'phone', title: 'Call Us', url: '' },
    { id: 'email', title: 'Email Us', url: '' },
    { id: 'facebook', title: 'Facebook', url: '' },
    { id: 'instagram', title: 'Instagram', url: '' },
    { id: 'link1', title: 'Sell Your Home', url: '' },
    { id: 'link2', title: 'Rent Your Home', url: '' },
    { id: 'link3', title: 'Buy a Home', url: '' }
  ],
  menu_items: {
    contact: 'Contact',
    features: 'Features',
    viewings: 'Viewings',
    lifestyle: 'Lifestyle',
    neighbourhood: 'Neighbourhood'
  },
  office_addresses: []
}