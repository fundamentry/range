import { describe, expect, expectTypeOf, it } from 'vitest';

import { Comparable, type Stringable } from '@fundamentry/trait';

import { AboveAll } from './AboveAll.js';
import { AboveValue } from './AboveValue.js';
import { BelowAll } from './BelowAll.js';
import { BelowValue } from './BelowValue.js';
import { type Cut } from './Cut.js';

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

describe('BelowValue', () => {
  it('must not be interchangeable with a cut on the other side of a value', () => {
    expectTypeOf<BelowValue<TestComparable>>().not.toExtend<
      AboveValue<TestComparable>
    >();
  });

  describe('[Symbol.hasInstance]', () => {
    it.each([
      ['a below-value cut', new BelowValue(new TestComparable(3)), true],
      ['an above-value cut', new AboveValue(new TestComparable(3)), false],
      ['a below-all cut', new BelowAll<TestComparable>(), false],
      ['an above-all cut', new AboveAll<TestComparable>(), false],
    ])(
      'must tell whether %s is a cut just below a value: %s',
      (_, cut, expected) => {
        expect(cut instanceof BelowValue).toBe(expected);
      }
    );

    it('must narrow a cut to a cut just below a value', () => {
      const cuts: Cut<TestComparable>[] = [
        new BelowValue(new TestComparable(3)),
        new AboveValue(new TestComparable(3)),
      ];

      const narrowed = cuts.filter(cut => cut instanceof BelowValue);

      expectTypeOf(narrowed).toEqualTypeOf<BelowValue<TestComparable>[]>();
      expect(narrowed).toHaveLength(1);
    });
  });

  describe('value', () => {
    it('must return the value the cut is just below', () => {
      const value = new TestComparable(3);

      expect(new BelowValue(value).value()).toBe(value);
    });
  });

  describe('isBelow', () => {
    it.each([
      [2, false],
      [3, true],
      [4, true],
    ])(
      'must tell whether a cut just below 3 is below %d: %s',
      (value, expected) => {
        const cut = new BelowValue(new TestComparable(3));

        expect(cut.isBelow(new TestComparable(value))).toBe(expected);
      }
    );
  });
});
