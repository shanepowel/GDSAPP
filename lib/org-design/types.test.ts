import { describe, expect, it } from 'vitest';
import { designPersonInputSchema } from '@/lib/org-design/types';

describe('designPersonInputSchema', () => {
  it('accepts a person with no email', () => {
    const parsed = designPersonInputSchema.parse({ name: 'Ada' });
    expect(parsed.name).toBe('Ada');
    expect(parsed.email ?? null).toBeNull();
  });

  it('treats an empty email as absent so add-person is not blocked', () => {
    const parsed = designPersonInputSchema.parse({ name: 'Ada', email: '' });
    expect(parsed.email).toBeNull();
  });

  it('rejects an invalid email', () => {
    expect(() => designPersonInputSchema.parse({ name: 'Ada', email: 'not-an-email' })).toThrow();
  });
});
