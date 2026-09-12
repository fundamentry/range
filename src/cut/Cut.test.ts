import { describe, expect, it } from 'vitest';

import { type Comparable, type Stringable } from '@fundamentry/trait';

import { Cut } from './Cut.js';

class TestComparable implements Comparable<TestComparable>, Stringable {
  #value: number;

  constructor(value: number) {
    this.#value = value;
  }

  value() {
    return this.#value;
  }

  compareTo(other: TestComparable): number {
    return this.value() - other.value();
  }

  toString(): string {
    return String(this.#value);
  }
}

describe('Cut', () => {
  describe('describeAsLowerBound', () => {
    it('must describe a cut with no lower bound as unbounded below', () => {
      const cut = Cut.belowAll<TestComparable>();

      expect(cut.describeAsLowerBound()).toBe('(-∞');
    });

    it('must describe an unbounded-above cut used as a lower bound', () => {
      const cut = Cut.aboveAll<TestComparable>();

      expect(cut.describeAsLowerBound()).toBe('(+∞');
    });

    it('must describe a below-value cut as a closed lower bound', () => {
      const cut = Cut.belowValue(new TestComparable(3));

      expect(cut.describeAsLowerBound()).toBe('[3');
    });

    it('must describe an above-value cut as an open lower bound', () => {
      const cut = Cut.aboveValue(new TestComparable(3));

      expect(cut.describeAsLowerBound()).toBe('(3');
    });
  });

  describe('describeAsUpperBound', () => {
    it('must describe a cut with no upper bound as unbounded above', () => {
      const cut = Cut.aboveAll<TestComparable>();

      expect(cut.describeAsUpperBound()).toBe('+∞)');
    });

    it('must describe an unbounded-below cut used as an upper bound', () => {
      const cut = Cut.belowAll<TestComparable>();

      expect(cut.describeAsUpperBound()).toBe('-∞)');
    });

    it('must describe an above-value cut as a closed upper bound', () => {
      const cut = Cut.aboveValue(new TestComparable(3));

      expect(cut.describeAsUpperBound()).toBe('3]');
    });

    it('must describe a below-value cut as an open upper bound', () => {
      const cut = Cut.belowValue(new TestComparable(3));

      expect(cut.describeAsUpperBound()).toBe('3)');
    });
  });

  describe('isBelowValue', () => {
    it('must return true for a below-value cut', () => {
      const cut = Cut.belowValue(new TestComparable(3));

      expect(cut.isBelowValue()).toBe(true);
    });

    it('must return false for an above-value cut', () => {
      const cut = Cut.aboveValue(new TestComparable(3));

      expect(cut.isBelowValue()).toBe(false);
    });

    it('must return false for a cut with no lower bound', () => {
      const cut = Cut.belowAll<TestComparable>();

      expect(cut.isBelowValue()).toBe(false);
    });

    it('must return false for a cut with no upper bound', () => {
      const cut = Cut.aboveAll<TestComparable>();

      expect(cut.isBelowValue()).toBe(false);
    });
  });

  describe('isAboveValue', () => {
    it('must return true for an above-value cut', () => {
      const cut = Cut.aboveValue(new TestComparable(3));

      expect(cut.isAboveValue()).toBe(true);
    });

    it('must return false for a below-value cut', () => {
      const cut = Cut.belowValue(new TestComparable(3));

      expect(cut.isAboveValue()).toBe(false);
    });

    it('must return false for a cut with no lower bound', () => {
      const cut = Cut.belowAll<TestComparable>();

      expect(cut.isAboveValue()).toBe(false);
    });

    it('must return false for a cut with no upper bound', () => {
      const cut = Cut.aboveAll<TestComparable>();

      expect(cut.isAboveValue()).toBe(false);
    });
  });

  describe('endpoint', () => {
    it('must return undefined for a cut with no lower bound', () => {
      const cut = Cut.belowAll<TestComparable>();

      expect(cut.endpoint()).toBeUndefined();
    });

    it('must return undefined for a cut with no upper bound', () => {
      const cut = Cut.aboveAll<TestComparable>();

      expect(cut.endpoint()).toBeUndefined();
    });

    it('must return the given value for a below-value cut', () => {
      const value = new TestComparable(3);

      const cut = Cut.belowValue(value);

      expect(cut.endpoint()).toBe(value);
    });

    it('must return the given value for an above-value cut', () => {
      const value = new TestComparable(3);

      const cut = Cut.aboveValue(value);

      expect(cut.endpoint()).toBe(value);
    });
  });

  describe('isLessThan', () => {
    it('must always be less than any value for a cut with no lower bound', () => {
      const cut = Cut.belowAll<TestComparable>();

      expect(cut.isLessThan(new TestComparable(-1000))).toBe(true);
    });

    it('must never be less than any value for a cut with no upper bound', () => {
      const cut = Cut.aboveAll<TestComparable>();

      expect(cut.isLessThan(new TestComparable(1000))).toBe(false);
    });

    it('must be less than a value equal to a below-value cut endpoint', () => {
      const cut = Cut.belowValue(new TestComparable(3));

      expect(cut.isLessThan(new TestComparable(3))).toBe(true);
    });

    it('must be less than a value greater than a below-value cut endpoint', () => {
      const cut = Cut.belowValue(new TestComparable(3));

      expect(cut.isLessThan(new TestComparable(4))).toBe(true);
    });

    it('must not be less than a value less than a below-value cut endpoint', () => {
      const cut = Cut.belowValue(new TestComparable(3));

      expect(cut.isLessThan(new TestComparable(2))).toBe(false);
    });

    it('must not be less than a value equal to an above-value cut endpoint', () => {
      const cut = Cut.aboveValue(new TestComparable(3));

      expect(cut.isLessThan(new TestComparable(3))).toBe(false);
    });

    it('must be less than a value greater than an above-value cut endpoint', () => {
      const cut = Cut.aboveValue(new TestComparable(3));

      expect(cut.isLessThan(new TestComparable(4))).toBe(true);
    });

    it('must not be less than a value less than an above-value cut endpoint', () => {
      const cut = Cut.aboveValue(new TestComparable(3));

      expect(cut.isLessThan(new TestComparable(2))).toBe(false);
    });
  });

  describe('compareTo', () => {
    it('must consider two cuts unbounded below equal, without relying on reference equality', () => {
      const a = Cut.belowAll<TestComparable>();
      const b = Cut.belowAll<TestComparable>();

      expect(a).not.toBe(b);
      expect(a.compareTo(b)).toBe(0);
    });

    it('must consider two cuts unbounded above equal, without relying on reference equality', () => {
      const a = Cut.aboveAll<TestComparable>();
      const b = Cut.aboveAll<TestComparable>();

      expect(a).not.toBe(b);
      expect(a.compareTo(b)).toBe(0);
    });

    it('must consider a cut unbounded below less than a cut unbounded above', () => {
      const belowAll = Cut.belowAll<TestComparable>();
      const aboveAll = Cut.aboveAll<TestComparable>();

      expect(belowAll.compareTo(aboveAll)).toBe(-1);
      expect(aboveAll.compareTo(belowAll)).toBe(1);
    });

    it('must consider a cut unbounded below less than any finite cut', () => {
      const value = new TestComparable(3);

      const belowAll = Cut.belowAll<TestComparable>();
      const belowValue = Cut.belowValue(value);
      const aboveValue = Cut.aboveValue(value);

      expect(belowAll.compareTo(belowValue)).toBe(-1);
      expect(belowAll.compareTo(aboveValue)).toBe(-1);
      expect(belowValue.compareTo(belowAll)).toBe(1);
      expect(aboveValue.compareTo(belowAll)).toBe(1);
    });

    it('must consider a cut unbounded above greater than any finite cut', () => {
      const value = new TestComparable(3);

      const aboveAll = Cut.aboveAll<TestComparable>();
      const belowValue = Cut.belowValue(value);
      const aboveValue = Cut.aboveValue(value);

      expect(aboveAll.compareTo(belowValue)).toBe(1);
      expect(aboveAll.compareTo(aboveValue)).toBe(1);
      expect(belowValue.compareTo(aboveAll)).toBe(-1);
      expect(aboveValue.compareTo(aboveAll)).toBe(-1);
    });

    it('must order finite cuts by their endpoint value', () => {
      const three = new TestComparable(3);
      const five = new TestComparable(5);

      expect(Cut.belowValue(three).compareTo(Cut.belowValue(five))).toBe(-2);
      expect(Cut.belowValue(five).compareTo(Cut.belowValue(three))).toBe(2);
    });

    it('must consider two below-value cuts at the same endpoint equal', () => {
      const value = new TestComparable(3);

      const a = Cut.belowValue(value);
      const b = Cut.belowValue(value);

      expect(a.compareTo(b)).toBe(0);
    });

    it('must consider two above-value cuts at the same endpoint equal', () => {
      const value = new TestComparable(3);

      const a = Cut.aboveValue(value);
      const b = Cut.aboveValue(value);

      expect(a.compareTo(b)).toBe(0);
    });

    it('must order a below-value cut before an above-value cut at the same endpoint', () => {
      const value = new TestComparable(3);

      const below = Cut.belowValue(value);
      const above = Cut.aboveValue(value);

      expect(below.compareTo(above)).toBe(-1);
      expect(above.compareTo(below)).toBe(1);
    });
  });
});
