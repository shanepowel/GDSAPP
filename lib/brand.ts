/** Datum by Turner & Townsend: product identity (UI + exports). */
import { product } from '@/lib/product.config';

export const BRAND = {
  company: product.owner,
  product: product.name,
  productLine: `${product.name} by ${product.owner}`,
  tagline: product.thesis,
  legalLine: product.owner,
  site: 'https://www.turnerandtownsend.com',
  colors: {
    blue: '#003cb4',
    blueDark: '#002e8a',
    blueTint: '#e8eefb',
    blueHero: '#7fa3f5',
    navy: '#0a1633',
    ink: '#14181f',
    slate: '#64748b',
    white: '#ffffff',
    surface: '#f8fafc',
  },
} as const;
