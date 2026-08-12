import { describe, expect, it } from 'vitest';
import {
  catalogCodeToLegacyStandard,
  legacyStandardToCatalogCode,
  slugClientPrefix,
} from './catalog';

describe('standards catalog helpers', () => {
  it('maps legacy engine ids to catalog codes', () => {
    expect(legacyStandardToCatalogCode('gds')).toBe('gds-service-standard');
    expect(legacyStandardToCatalogCode('wales')).toBe('wales-dss');
    expect(catalogCodeToLegacyStandard('gds-service-standard')).toBe('gds');
    expect(catalogCodeToLegacyStandard('tcop')).toBeNull();
  });

  it('builds a client reference prefix', () => {
    expect(slugClientPrefix('Natural Resources Wales', 'x')).toBe('NATURAL-RESO');
    expect(slugClientPrefix(null, 'Demo Service')).toBe('DEMO-SERVICE');
  });
});
