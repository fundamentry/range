import { describe, expect, it } from 'vitest';

import { type Comparable, type Stringable } from '@fundamentry/trait';

import { Range } from './Range.js';

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

describe('Range', () => {
  describe('open', () => {
    it('must create a range excluding both endpoints', () => {
      const range = Range.open(new TestComparable(3), new TestComparable(5));

      expect(range.toString()).toBe('(3..5)');
    });

    it('must throw for an open range with equal endpoints', () => {
      expect(() =>
        Range.open(new TestComparable(4), new TestComparable(4))
      ).toThrow(new RangeError('Invalid range: (4..4)'));
    });
  });

  describe('closed', () => {
    it('must create a range including both endpoints', () => {
      const range = Range.closed(new TestComparable(3), new TestComparable(5));

      expect(range.toString()).toBe('[3..5]');
    });

    it('must allow equal endpoints as a singleton range', () => {
      expect(() =>
        Range.closed(new TestComparable(4), new TestComparable(4))
      ).not.toThrow();
    });
  });

  describe('closedOpen', () => {
    it('must create a range including the lower endpoint and excluding the upper endpoint', () => {
      const range = Range.closedOpen(
        new TestComparable(3),
        new TestComparable(5)
      );

      expect(range.toString()).toBe('[3..5)');
    });
  });

  describe('openClosed', () => {
    it('must create a range excluding the lower endpoint and including the upper endpoint', () => {
      const range = Range.openClosed(
        new TestComparable(3),
        new TestComparable(5)
      );

      expect(range.toString()).toBe('(3..5]');
    });
  });

  describe('greaterThan', () => {
    it('must create a range unbounded above, excluding the lower endpoint', () => {
      const range = Range.greaterThan(new TestComparable(3));

      expect(range.toString()).toBe('(3..+∞)');
    });
  });

  describe('atLeast', () => {
    it('must create a range unbounded above, including the lower endpoint', () => {
      const range = Range.atLeast(new TestComparable(3));

      expect(range.toString()).toBe('[3..+∞)');
    });
  });

  describe('lessThan', () => {
    it('must create a range unbounded below, excluding the upper endpoint', () => {
      const range = Range.lessThan(new TestComparable(5));

      expect(range.toString()).toBe('(-∞..5)');
    });
  });

  describe('atMost', () => {
    it('must create a range unbounded below, including the upper endpoint', () => {
      const range = Range.atMost(new TestComparable(5));

      expect(range.toString()).toBe('(-∞..5]');
    });
  });

  describe('all', () => {
    it('must create a range unbounded on both sides', () => {
      const range = Range.all<TestComparable>();

      expect(range.toString()).toBe('(-∞..+∞)');
    });
  });

  describe('singleton', () => {
    it('must create a closed range with equal endpoints', () => {
      const range = Range.singleton(new TestComparable(3));

      expect(range.toString()).toBe('[3..3]');
    });
  });

  describe('constructor validation', () => {
    it('must throw when the lower bound is greater than the upper bound', () => {
      expect(() =>
        Range.closed(new TestComparable(5), new TestComparable(3))
      ).toThrow(new RangeError('Invalid range: [5..3]'));
    });

    it('must not throw when equal endpoints have at least one closed side', () => {
      expect(() =>
        Range.closedOpen(new TestComparable(4), new TestComparable(4))
      ).not.toThrow();
      expect(() =>
        Range.openClosed(new TestComparable(4), new TestComparable(4))
      ).not.toThrow();
    });
  });

  describe('toString', () => {
    it('must format a range using interval notation', () => {
      const range = Range.closed(new TestComparable(3), new TestComparable(5));

      expect(range.toString()).toBe('[3..5]');
    });
  });

  describe('compareTo', () => {
    it('must order by lower bound when lower bounds differ', () => {
      const a = Range.closed(new TestComparable(1), new TestComparable(9));
      const b = Range.closed(new TestComparable(3), new TestComparable(4));

      expect(a.compareTo(b)).toBeLessThan(0);
      expect(b.compareTo(a)).toBeGreaterThan(0);
    });

    it('must order a closed lower bound before an open lower bound at the same endpoint', () => {
      const a = Range.closed(new TestComparable(3), new TestComparable(5));
      const b = Range.open(new TestComparable(3), new TestComparable(9));

      expect(a.compareTo(b)).toBeLessThan(0);
    });

    it('must fall back to the upper bound when lower bounds are equal', () => {
      const a = Range.closed(new TestComparable(3), new TestComparable(5));
      const b = Range.closed(new TestComparable(3), new TestComparable(9));

      expect(a.compareTo(b)).toBeLessThan(0);
      expect(b.compareTo(a)).toBeGreaterThan(0);
    });

    it('must return 0 for ranges with identical bounds', () => {
      const a = Range.closed(new TestComparable(3), new TestComparable(5));
      const b = Range.closed(new TestComparable(3), new TestComparable(5));

      expect(a.compareTo(b)).toBe(0);
    });
  });

  describe('hasLowerBound', () => {
    it('must return true when the range has a lower bound', () => {
      expect(Range.atLeast(new TestComparable(3)).hasLowerBound()).toBe(true);
    });

    it('must return false when the range has no lower bound', () => {
      expect(Range.atMost(new TestComparable(3)).hasLowerBound()).toBe(false);
    });
  });

  describe('hasUpperBound', () => {
    it('must return true when the range has an upper bound', () => {
      expect(Range.atMost(new TestComparable(3)).hasUpperBound()).toBe(true);
    });

    it('must return false when the range has no upper bound', () => {
      expect(Range.atLeast(new TestComparable(3)).hasUpperBound()).toBe(false);
    });
  });

  describe('lowerEndpoint', () => {
    it('must return the lower endpoint when the range is bounded below', () => {
      const value = new TestComparable(3);

      expect(Range.atLeast(value).lowerEndpoint()).toBe(value);
    });

    it('must return undefined when the range is unbounded below', () => {
      expect(
        Range.atMost(new TestComparable(3)).lowerEndpoint()
      ).toBeUndefined();
    });
  });

  describe('upperEndpoint', () => {
    it('must return the upper endpoint when the range is bounded above', () => {
      const value = new TestComparable(5);

      expect(Range.atMost(value).upperEndpoint()).toBe(value);
    });

    it('must return undefined when the range is unbounded above', () => {
      expect(
        Range.atLeast(new TestComparable(3)).upperEndpoint()
      ).toBeUndefined();
    });
  });

  describe('lowerBoundType', () => {
    it('must return CLOSED for a closed lower bound', () => {
      const range = Range.closed(new TestComparable(3), new TestComparable(5));

      expect(range.lowerBoundType()).toBe('CLOSED');
    });

    it('must return OPEN for an open lower bound', () => {
      const range = Range.open(new TestComparable(3), new TestComparable(5));

      expect(range.lowerBoundType()).toBe('OPEN');
    });

    it('must return UNBOUNDED when there is no lower bound', () => {
      expect(Range.atMost(new TestComparable(5)).lowerBoundType()).toBe(
        'UNBOUNDED'
      );
    });
  });

  describe('upperBoundType', () => {
    it('must return CLOSED for a closed upper bound', () => {
      const range = Range.closed(new TestComparable(3), new TestComparable(5));

      expect(range.upperBoundType()).toBe('CLOSED');
    });

    it('must return OPEN for an open upper bound', () => {
      const range = Range.open(new TestComparable(3), new TestComparable(5));

      expect(range.upperBoundType()).toBe('OPEN');
    });

    it('must return UNBOUNDED when there is no upper bound', () => {
      expect(Range.atLeast(new TestComparable(3)).upperBoundType()).toBe(
        'UNBOUNDED'
      );
    });
  });

  describe('isEmpty', () => {
    it('must return true for a closed-open range with equal endpoints', () => {
      const range = Range.closedOpen(
        new TestComparable(4),
        new TestComparable(4)
      );

      expect(range.isEmpty()).toBe(true);
    });

    it('must return true for an open-closed range with equal endpoints', () => {
      const range = Range.openClosed(
        new TestComparable(4),
        new TestComparable(4)
      );

      expect(range.isEmpty()).toBe(true);
    });

    it('must return false for a closed range with equal endpoints', () => {
      const range = Range.closed(new TestComparable(4), new TestComparable(4));

      expect(range.isEmpty()).toBe(false);
    });

    it('must return false for a non-degenerate range', () => {
      const range = Range.open(new TestComparable(3), new TestComparable(5));

      expect(range.isEmpty()).toBe(false);
    });
  });

  describe('contains', () => {
    it('must include the lower endpoint of a closed range', () => {
      const range = Range.closed(new TestComparable(3), new TestComparable(5));

      expect(range.contains(new TestComparable(3))).toBe(true);
    });

    it('must exclude the lower endpoint of an open range', () => {
      const range = Range.open(new TestComparable(3), new TestComparable(5));

      expect(range.contains(new TestComparable(3))).toBe(false);
    });

    it('must include the upper endpoint of a closed range', () => {
      const range = Range.closed(new TestComparable(3), new TestComparable(5));

      expect(range.contains(new TestComparable(5))).toBe(true);
    });

    it('must exclude the upper endpoint of an open range', () => {
      const range = Range.open(new TestComparable(3), new TestComparable(5));

      expect(range.contains(new TestComparable(5))).toBe(false);
    });

    it('must include values strictly between the bounds', () => {
      const range = Range.open(new TestComparable(3), new TestComparable(5));

      expect(range.contains(new TestComparable(4))).toBe(true);
    });

    it('must exclude values outside the bounds', () => {
      const range = Range.closed(new TestComparable(3), new TestComparable(5));

      expect(range.contains(new TestComparable(2))).toBe(false);
      expect(range.contains(new TestComparable(6))).toBe(false);
    });

    it('must contain any value for a range unbounded on both sides', () => {
      const range = Range.all<TestComparable>();

      expect(range.contains(new TestComparable(-1000))).toBe(true);
    });
  });

  describe('containsAll', () => {
    it('must return true when every value is contained', () => {
      const range = Range.closed(new TestComparable(1), new TestComparable(5));
      const values = [1, 2, 3, 4, 5].map(value => new TestComparable(value));

      expect(range.containsAll(values)).toBe(true);
    });

    it('must return false when any value is not contained', () => {
      const range = Range.closed(new TestComparable(1), new TestComparable(5));
      const values = [1, 2, 6].map(value => new TestComparable(value));

      expect(range.containsAll(values)).toBe(false);
    });

    it('must stop pulling from an unbounded iterable once a value fails containment', () => {
      const range = Range.closed(new TestComparable(1), new TestComparable(5));

      let pulled = 0;

      function* excludedValues(): Generator<TestComparable> {
        for (;;) {
          pulled += 1;

          yield new TestComparable(10);
        }
      }

      expect(range.containsAll(excludedValues())).toBe(false);
      expect(pulled).toBe(1);
    });
  });

  describe('encloses', () => {
    it('must return true when the other range fits entirely within this one', () => {
      const outer = Range.closed(new TestComparable(3), new TestComparable(6));
      const inner = Range.closed(new TestComparable(4), new TestComparable(5));

      expect(outer.encloses(inner)).toBe(true);
    });

    it('must return true for an enclosed empty range', () => {
      const outer = Range.closed(new TestComparable(3), new TestComparable(6));
      const empty = Range.closedOpen(
        new TestComparable(4),
        new TestComparable(4)
      );

      expect(outer.encloses(empty)).toBe(true);
    });

    it('must return false when the other range extends past this one', () => {
      const outer = Range.openClosed(
        new TestComparable(3),
        new TestComparable(6)
      );
      const other = Range.closed(new TestComparable(3), new TestComparable(6));

      expect(outer.encloses(other)).toBe(false);
    });

    it('must return false when this range does not enclose all of the other', () => {
      const a = Range.closed(new TestComparable(4), new TestComparable(5));
      const b = Range.open(new TestComparable(3), new TestComparable(6));

      expect(a.encloses(b)).toBe(false);
    });

    it('must return true when this range is unbounded and the other is bounded', () => {
      const outer = Range.all<TestComparable>();
      const inner = Range.closed(new TestComparable(1), new TestComparable(2));

      expect(outer.encloses(inner)).toBe(true);
    });

    it('must return false when this range is bounded and the other is unbounded', () => {
      const outer = Range.atLeast(new TestComparable(3));
      const inner = Range.all<TestComparable>();

      expect(outer.encloses(inner)).toBe(false);
    });

    it('must return true when both ranges share the same unbounded side', () => {
      const outer = Range.atLeast(new TestComparable(3));
      const inner = Range.closed(new TestComparable(4), new TestComparable(5));

      expect(outer.encloses(inner)).toBe(true);
    });
  });

  describe('isConnected', () => {
    it('must return true when the ranges overlap', () => {
      const a = Range.closed(new TestComparable(0), new TestComparable(9));
      const b = Range.closed(new TestComparable(3), new TestComparable(4));

      expect(a.isConnected(b)).toBe(true);
    });

    it('must return true when the ranges touch at a shared boundary', () => {
      const a = Range.closed(new TestComparable(3), new TestComparable(5));
      const b = Range.open(new TestComparable(5), new TestComparable(10));

      expect(a.isConnected(b)).toBe(true);
    });

    it('must return false when there is a gap between the ranges', () => {
      const a = Range.closed(new TestComparable(1), new TestComparable(5));
      const b = Range.closed(new TestComparable(6), new TestComparable(10));

      expect(a.isConnected(b)).toBe(false);
    });

    it('must return false when the ranges meet only at an excluded boundary', () => {
      const a = Range.open(new TestComparable(3), new TestComparable(5));
      const b = Range.open(new TestComparable(5), new TestComparable(10));

      expect(a.isConnected(b)).toBe(false);
    });

    it('must return true when an unbounded-above range overlaps an unbounded-below range', () => {
      const a = Range.atLeast(new TestComparable(3));
      const b = Range.atMost(new TestComparable(5));

      expect(a.isConnected(b)).toBe(true);
    });

    it('must return false when two ranges facing away from each other leave a gap', () => {
      const a = Range.lessThan(new TestComparable(3));
      const b = Range.atLeast(new TestComparable(5));

      expect(a.isConnected(b)).toBe(false);
    });

    it('must return true for a range unbounded on both sides', () => {
      const a = Range.all<TestComparable>();
      const b = Range.closed(new TestComparable(1), new TestComparable(2));

      expect(a.isConnected(b)).toBe(true);
    });
  });

  describe('intersection', () => {
    it('must return the overlapping range when the ranges touch at a shared boundary', () => {
      const a = Range.closed(new TestComparable(3), new TestComparable(5));
      const b = Range.open(new TestComparable(5), new TestComparable(10));

      expect(a.intersection(b)?.toString()).toBe('(5..5]');
    });

    it('must return the narrower range when one range encloses the other', () => {
      const a = Range.closed(new TestComparable(0), new TestComparable(9));
      const b = Range.closed(new TestComparable(3), new TestComparable(4));

      expect(a.intersection(b)?.toString()).toBe('[3..4]');
    });

    it('must return the overlapping portion for partially overlapping ranges', () => {
      const a = Range.closed(new TestComparable(0), new TestComparable(5));
      const b = Range.closed(new TestComparable(3), new TestComparable(9));

      expect(a.intersection(b)?.toString()).toBe('[3..5]');
    });

    it('must return undefined when the ranges meet only at an excluded boundary', () => {
      const a = Range.open(new TestComparable(3), new TestComparable(5));
      const b = Range.open(new TestComparable(5), new TestComparable(10));

      expect(a.intersection(b)).toBeUndefined();
    });

    it('must return undefined when there is a gap between the ranges', () => {
      const a = Range.closed(new TestComparable(1), new TestComparable(5));
      const b = Range.closed(new TestComparable(6), new TestComparable(10));

      expect(a.intersection(b)).toBeUndefined();
    });

    it('must pick the narrower bounds regardless of which range they come from', () => {
      const a = Range.closed(new TestComparable(3), new TestComparable(9));
      const b = Range.closed(new TestComparable(0), new TestComparable(5));

      expect(a.intersection(b)?.toString()).toBe('[3..5]');
    });

    it('must return the overlapping range between two opposite-facing unbounded ranges', () => {
      const a = Range.atLeast(new TestComparable(3));
      const b = Range.atMost(new TestComparable(5));

      expect(a.intersection(b)?.toString()).toBe('[3..5]');
    });

    it('must return the bounded range when intersected with a range unbounded on both sides', () => {
      const a = Range.all<TestComparable>();
      const b = Range.closed(new TestComparable(1), new TestComparable(2));

      expect(a.intersection(b)?.toString()).toBe('[1..2]');
    });
  });

  describe('span', () => {
    it('must return the enclosing range when the ranges touch at a shared boundary', () => {
      const a = Range.closed(new TestComparable(3), new TestComparable(5));
      const b = Range.open(new TestComparable(5), new TestComparable(10));

      expect(a.span(b).toString()).toBe('[3..10)');
    });

    it('must return the wider range when one range encloses the other', () => {
      const a = Range.closed(new TestComparable(0), new TestComparable(9));
      const b = Range.closed(new TestComparable(3), new TestComparable(4));

      expect(a.span(b).toString()).toBe('[0..9]');
    });

    it('must return the enclosing range for partially overlapping ranges', () => {
      const a = Range.closed(new TestComparable(0), new TestComparable(5));
      const b = Range.closed(new TestComparable(3), new TestComparable(9));

      expect(a.span(b).toString()).toBe('[0..9]');
    });

    it('must return the enclosing range even when the ranges do not connect', () => {
      const a = Range.open(new TestComparable(3), new TestComparable(5));
      const b = Range.open(new TestComparable(5), new TestComparable(10));

      expect(a.span(b).toString()).toBe('(3..10)');
    });

    it('must pick the wider bounds regardless of which range they come from', () => {
      const a = Range.closed(new TestComparable(3), new TestComparable(9));
      const b = Range.closed(new TestComparable(0), new TestComparable(5));

      expect(a.span(b).toString()).toBe('[0..9]');
    });

    it('must return a range unbounded on both sides when spanning a range unbounded on both sides', () => {
      const a = Range.all<TestComparable>();
      const b = Range.closed(new TestComparable(1), new TestComparable(2));

      expect(a.span(b).toString()).toBe('(-∞..+∞)');
    });

    it('must return a range unbounded on both sides when spanning two opposite-facing unbounded ranges', () => {
      const a = Range.atLeast(new TestComparable(3));
      const b = Range.atMost(new TestComparable(1));

      expect(a.span(b).toString()).toBe('(-∞..+∞)');
    });
  });
});
