import { describe, expect, it } from 'vitest';

import { type CodePoint, Integer } from '@fundamentry/scalar';
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

describe('AboveAll', () => {
  describe('isBelow', () => {
    it.each([-1000, 0, 1000])('must not be below %d', value => {
      const cut = new AboveAll<TestComparable>();

      expect(cut.isBelow(new TestComparable(value))).toBe(false);
    });
  });

  describe('compareTo', () => {
    it.each([
      ['a below-all cut', new BelowAll<TestComparable>(), 1],
      ['another above-all cut', new AboveAll<TestComparable>(), 0],
      ['a below-value cut', new BelowValue(new TestComparable(3)), 1],
      ['an above-value cut', new AboveValue(new TestComparable(3)), 1],
    ])('must compare to %s as %d', (_, other, expected) => {
      const cut = new AboveAll<TestComparable>();

      expect(cut.compareTo(other)).toBe(expected);
    });
  });

  describe('equals', () => {
    it.each([
      ['another above-all cut', new AboveAll<Integer>(), true],
      ['an below-all cut', new BelowAll<Integer>(), false],
      ['a below-value cut', new BelowValue(Integer.of(3)), false],
      ['an above-value cut', new AboveValue(Integer.of(3)), false],
      ['an above-all cut over another type', new AboveAll<CodePoint>(), true],
      ['undefined', undefined, false],
      ['a string', '+∞', false],
      ['a plain object', {}, false],
    ])('must tell whether it equals %s: %s', (_, other, expected) => {
      expect(new AboveAll<Integer>().equals(other)).toBe(expected);
    });
  });

  describe('toString', () => {
    it('must describe itself as positive infinity', () => {
      const cut = new AboveAll<TestComparable>();

      expect(cut.toString()).toBe('+∞');
    });
  });
});
