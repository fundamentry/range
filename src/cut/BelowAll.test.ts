import { describe, expect, it } from 'vitest';

import { Comparable, type Stringable } from '@fundamentry/trait';

import { AboveAll } from './AboveAll.js';
import { AboveValue } from './AboveValue.js';
import { BelowAll } from './BelowAll.js';
import { BelowValue } from './BelowValue.js';

class TestComparable implements Comparable<TestComparable>, Stringable {
  #value: number;

  constructor(value: number) {
    this.#value = value;
  }

  value() {
    return this.#value;
  }

  [Comparable.symbol](other: TestComparable): number {
    return this.value() - other.value();
  }

  [Symbol.toPrimitive](): string {
    return String(this.#value);
  }
}

describe('BelowAll', () => {
  describe('isBelow', () => {
    it.each([-1000, 0, 1000])('must be below %d', value => {
      const cut = new BelowAll<TestComparable>();

      expect(cut.isBelow(new TestComparable(value))).toBe(true);
    });
  });

  describe('compareTo', () => {
    it.each([
      ['another below-all cut', new BelowAll<TestComparable>(), 0],
      ['an above-all cut', new AboveAll<TestComparable>(), -1],
      ['a below-value cut', new BelowValue(new TestComparable(3)), -1],
      ['an above-value cut', new AboveValue(new TestComparable(3)), -1],
    ])('must compare to %s as %d', (_, other, expected) => {
      const cut = new BelowAll<TestComparable>();

      expect(cut.compareTo(other)).toBe(expected);
    });
  });

  describe('toString', () => {
    it('must describe itself as negative infinity', () => {
      const cut = new BelowAll<TestComparable>();

      expect(cut.toString()).toBe('-∞');
    });
  });
});
