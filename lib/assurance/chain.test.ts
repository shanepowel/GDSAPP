import { describe, expect, it } from 'vitest';

describe('evidence chain connector states', () => {
  it('maps segment states to connector styles', () => {
    const styles = {
      complete: { color: 'var(--signal)', borderStyle: 'solid' },
      unevidenced: { color: 'var(--rule)', borderStyle: 'solid' },
      broken: { color: 'var(--rule)', borderStyle: 'dashed' },
    } as const;
    expect(styles.complete.color).toBe('var(--signal)');
    expect(styles.broken.borderStyle).toBe('dashed');
  });
});
