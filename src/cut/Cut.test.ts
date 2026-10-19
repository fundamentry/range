import { describe, expect, expectTypeOf, it } from 'vitest';

import { Integer } from '@fundamentry/scalar';
import { Comparable, Equatable, type Stringable } from '@fundamentry/trait';

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

describe('Cut', () => {
  it('must count only cuts at a value as Cut.Bounded', () => {
    expectTypeOf<BelowValue<TestComparable>>().toExtend<
      Cut.Bounded<TestComparable>
    >();
    expectTypeOf<AboveValue<TestComparable>>().toExtend<
      Cut.Bounded<TestComparable>
    >();
    expectTypeOf<BelowAll<TestComparable>>().not.toExtend<
      Cut.Bounded<TestComparable>
    >();
    expectTypeOf<AboveAll<TestComparable>>().not.toExtend<
      Cut.Bounded<TestComparable>
    >();
  });

  describe('compareTo', () => {
    const line = (): Cut<TestComparable>[] => [
      new BelowAll<TestComparable>(),
      new BelowValue(new TestComparable(2)),
      new AboveValue(new TestComparable(2)),
      new BelowValue(new TestComparable(3)),
      new AboveValue(new TestComparable(3)),
      new AboveAll<TestComparable>(),
    ];

    it.each(
      line().flatMap((cut, i) =>
        line().map(
          (
            other,
            j
          ): [number, number, Cut<TestComparable>, Cut<TestComparable>] => [
            i,
            j,
            cut,
            other,
          ]
        )
      )
    )(
      'must order the cut at position %d of the line against the one at position %d by their positions',
      (i, j, cut, other) => {
        expect(Math.sign(cut.compareTo(other))).toBe(Math.sign(i - j));
      }
    );
  });

  describe('[Comparable.symbol]', () => {
    it('must delegate to compareTo', () => {
      const below = new BelowValue(new TestComparable(3));
      const above = new AboveValue(new TestComparable(3));

      expect(below[Comparable.symbol](above)).toBe(-1);
      expect(above[Comparable.symbol](below)).toBe(1);
    });
  });

  describe('[Equatable.symbol]', () => {
    it.each([
      [new BelowAll<Integer>(), new BelowAll<Integer>(), true],
      [new AboveAll<Integer>(), new BelowAll<Integer>(), false],
      [new BelowValue(Integer.of(3)), new BelowValue(Integer.of(3)), true],
      [new AboveValue(Integer.of(3)), new BelowValue(Integer.of(3)), false],
    ])('must delegate to equals for %s and %s', (cut, other, expected) => {
      expect(cut[Equatable.symbol](other)).toBe(expected);
    });

    it('must make a cut equatable', () => {
      expect(Equatable.is(new BelowValue(Integer.of(3)))).toBe(true);
      expect(
        Equatable.equals(
          new AboveValue(Integer.of(3)),
          new AboveValue(Integer.of(3))
        )
      ).toBe(true);
    });
  });

  describe('[Symbol.toPrimitive]', () => {
    it.each([
      [new BelowAll<TestComparable>(), '-∞'],
      [new AboveAll<TestComparable>(), '+∞'],
      [new BelowValue(new TestComparable(3)), '3'],
      [new AboveValue(new TestComparable(3)), '3'],
    ])('must describe %s when coerced to a string as %s', (cut, expected) => {
      expect(String(cut)).toBe(expected);
    });
  });
});
