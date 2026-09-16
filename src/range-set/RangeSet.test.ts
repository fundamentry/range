import { describe, expect, it } from 'vitest';

import { type Comparable, type Stringable } from '@fundamentry/trait';

import { Range } from '#project/range';

import { RangeSet } from './RangeSet.js';

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

describe('RangeSet', () => {
  describe('from', () => {
    it('must merge ranges that overlap', () => {
      const rangeSet = RangeSet.from([
        Range.closed(new TestComparable(0), new TestComparable(5)),
        Range.closed(new TestComparable(3), new TestComparable(9)),
      ]);

      expect(rangeSet.asRanges().map(range => range.toString())).toEqual([
        '[0..9]',
      ]);
    });

    it('must merge ranges that touch at a shared boundary', () => {
      const rangeSet = RangeSet.from([
        Range.closed(new TestComparable(3), new TestComparable(5)),
        Range.open(new TestComparable(5), new TestComparable(10)),
      ]);

      expect(rangeSet.asRanges().map(range => range.toString())).toEqual([
        '[3..10)',
      ]);
    });

    it('must keep ranges separate when they meet only at an excluded boundary', () => {
      const rangeSet = RangeSet.from([
        Range.open(new TestComparable(1), new TestComparable(3)),
        Range.open(new TestComparable(3), new TestComparable(6)),
      ]);

      expect(rangeSet.asRanges().map(range => range.toString())).toEqual([
        '(1..3)',
        '(3..6)',
      ]);
    });

    it('must keep disjoint ranges separate and sorted by lower bound, regardless of input order', () => {
      const rangeSet = RangeSet.from([
        Range.closed(new TestComparable(10), new TestComparable(12)),
        Range.closed(new TestComparable(1), new TestComparable(3)),
      ]);

      expect(rangeSet.asRanges().map(range => range.toString())).toEqual([
        '[1..3]',
        '[10..12]',
      ]);
    });

    it('must merge a range that is entirely enclosed by an already-coalesced range', () => {
      const rangeSet = RangeSet.from([
        Range.closed(new TestComparable(1), new TestComparable(10)),
        Range.closed(new TestComparable(3), new TestComparable(5)),
      ]);

      expect(rangeSet.asRanges().map(range => range.toString())).toEqual([
        '[1..10]',
      ]);
    });

    it('must merge duplicate ranges into one', () => {
      const rangeSet = RangeSet.from([
        Range.closed(new TestComparable(1), new TestComparable(5)),
        Range.closed(new TestComparable(1), new TestComparable(5)),
      ]);

      expect(rangeSet.asRanges().map(range => range.toString())).toEqual([
        '[1..5]',
      ]);
    });

    it('must ignore empty ranges', () => {
      const rangeSet = RangeSet.from([
        Range.closedOpen(new TestComparable(4), new TestComparable(4)),
        Range.closed(new TestComparable(1), new TestComparable(2)),
      ]);

      expect(rangeSet.asRanges().map(range => range.toString())).toEqual([
        '[1..2]',
      ]);
    });

    it('must sort a range with a closed lower bound before an open lower bound at the same endpoint', () => {
      const rangeSet = RangeSet.from([
        Range.open(new TestComparable(5), new TestComparable(9)),
        Range.atMost(new TestComparable(1)),
        Range.atLeast(new TestComparable(5)),
      ]);

      expect(rangeSet.asRanges().map(range => range.toString())).toEqual([
        '(-∞..1]',
        '[5..+∞)',
      ]);
    });

    it('must treat two unbounded-below ranges as tied on lower bound and order them by connectivity', () => {
      const rangeSet = RangeSet.from([
        Range.lessThan(new TestComparable(3)),
        Range.atMost(new TestComparable(5)),
      ]);

      expect(rangeSet.asRanges().map(range => range.toString())).toEqual([
        '(-∞..5]',
      ]);
    });

    it('must produce an empty range set from no ranges', () => {
      const rangeSet = RangeSet.from<TestComparable>([]);

      expect(rangeSet.asRanges()).toEqual([]);
    });
  });

  describe('toString', () => {
    it('must format an empty range set', () => {
      expect(RangeSet.from<TestComparable>([]).toString()).toBe('{}');
    });

    it('must format a range set with its coalesced ranges in interval notation', () => {
      const rangeSet = RangeSet.from([
        Range.closed(new TestComparable(1), new TestComparable(3)),
        Range.closed(new TestComparable(10), new TestComparable(12)),
      ]);

      expect(rangeSet.toString()).toBe('{[1..3], [10..12]}');
    });
  });

  describe('contains', () => {
    const rangeSet = RangeSet.from([
      Range.closed(new TestComparable(1), new TestComparable(3)),
      Range.closed(new TestComparable(10), new TestComparable(12)),
    ]);

    it.each([
      [1, true],
      [2, true],
      [3, true],
      [10, true],
      [12, true],
      [0, false],
      [5, false],
      [13, false],
    ])(
      'must return %s for a value contained by any range: %i',
      (n, expected) => {
        expect(rangeSet.contains(new TestComparable(n))).toBe(expected);
      }
    );

    it('must return false for every value in an empty range set', () => {
      expect(
        RangeSet.from<TestComparable>([]).contains(new TestComparable(0))
      ).toBe(false);
    });
  });

  describe('encloses', () => {
    const rangeSet = RangeSet.from([
      Range.closed(new TestComparable(1), new TestComparable(3)),
      Range.closed(new TestComparable(10), new TestComparable(12)),
    ]);

    it('must return true when a single member range encloses the given range', () => {
      expect(
        rangeSet.encloses(
          Range.closed(new TestComparable(1), new TestComparable(2))
        )
      ).toBe(true);
    });

    it('must return false when the given range spans a gap between member ranges', () => {
      expect(
        rangeSet.encloses(
          Range.closed(new TestComparable(2), new TestComparable(11))
        )
      ).toBe(false);
    });

    it('must return false when no member range encloses the given range', () => {
      expect(
        RangeSet.from<TestComparable>([]).encloses(
          Range.closed(new TestComparable(1), new TestComparable(2))
        )
      ).toBe(false);
    });
  });

  describe('asRanges', () => {
    it('must return the coalesced ranges in ascending order', () => {
      const rangeSet = RangeSet.from([
        Range.closed(new TestComparable(10), new TestComparable(12)),
        Range.closed(new TestComparable(1), new TestComparable(3)),
      ]);

      expect(rangeSet.asRanges().map(range => range.toString())).toEqual([
        '[1..3]',
        '[10..12]',
      ]);
    });
  });

  describe('isEmpty', () => {
    it('must return false for a range set with members', () => {
      expect(
        RangeSet.from([
          Range.closed(new TestComparable(1), new TestComparable(3)),
        ]).isEmpty()
      ).toBe(false);
    });

    it('must return true for a range set with no members', () => {
      expect(RangeSet.from<TestComparable>([]).isEmpty()).toBe(true);
    });
  });

  describe('span', () => {
    it('must return the minimal range enclosing every member range', () => {
      const rangeSet = RangeSet.from([
        Range.closed(new TestComparable(1), new TestComparable(3)),
        Range.closed(new TestComparable(10), new TestComparable(12)),
      ]);

      expect(rangeSet.span().toString()).toBe('[1..12]');
    });

    it('must return the sole range for a range set with a single member', () => {
      const rangeSet = RangeSet.from([
        Range.closed(new TestComparable(1), new TestComparable(3)),
      ]);

      expect(rangeSet.span().toString()).toBe('[1..3]');
    });

    it('must span from the first to the last member for more than two members', () => {
      const rangeSet = RangeSet.from([
        Range.closed(new TestComparable(20), new TestComparable(25)),
        Range.closed(new TestComparable(1), new TestComparable(3)),
        Range.closed(new TestComparable(10), new TestComparable(12)),
      ]);

      expect(rangeSet.span().toString()).toBe('[1..25]');
    });

    it('must throw for an empty range set', () => {
      expect(() => RangeSet.from<TestComparable>([]).span()).toThrow(
        new RangeError('Cannot compute span of an empty range set.')
      );
    });
  });
});
