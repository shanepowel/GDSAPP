/** Assemble by Turner & Townsend: product identity (UI + exports). */
import { product } from '@/lib/product.config';

export const BRAND = {
  company: product.owner,
  product: product.name,
  productLine: `${product.name} by ${product.owner}`,
  tagline: product.thesis,
  legalLine: product.owner,
  site: 'https://www.turnerandtownsend.com',
  /** Hex mirrors styles/tokens.css. Do not invent a third palette here. */
  colors: {
    blue: '#1A5CFF',
    blueDark: '#123FB8',
    blueTint: '#E9F0FF',
    blueHero: '#4D7CFF',
    navy: '#0A2647',
    ink: '#14202B',
    slate: '#5B6B7A',
    white: '#ffffff',
    surface: '#F5F7FA',
  },
} as const;
