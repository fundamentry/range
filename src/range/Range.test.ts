import { describe, expect, expectTypeOf, it } from 'vitest';

import { CodePoint, Integer } from '@fundamentry/scalar';
import { Comparable, Equatable, type Stringable } from '@fundamentry/trait';

import {
  AboveAll,
  AboveValue,
  BelowAll,
  BelowValue,
  type Cut,
} from '#project/cut';

import { Range } from './Range.js';

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

describe('Range', () => {
  it('must accept a range at a value on both sides as Range.Bounded', () => {
    expectTypeOf(
      Range.closedOpen(new TestComparable(3), new TestComparable(5))
    ).toExtend<Range.Bounded<TestComparable>>();
    expectTypeOf(Range.atLeast(new TestComparable(3))).not.toExtend<
      Range.Bounded<TestComparable>
    >();
  });

  describe('open', () => {
    it('must type the range as Range.Open', () => {
      expectTypeOf(
        Range.open(new TestComparable(3), new TestComparable(5))
      ).toEqualTypeOf<Range.Open<TestComparable>>();
    });

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
    it('must type the range as Range.Closed', () => {
      expectTypeOf(
        Range.closed(new TestComparable(3), new TestComparable(5))
      ).toEqualTypeOf<Range.Closed<TestComparable>>();
    });

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
    it('must type the range as Range.ClosedOpen', () => {
      expectTypeOf(
        Range.closedOpen(new TestComparable(3), new TestComparable(5))
      ).toEqualTypeOf<Range.ClosedOpen<TestComparable>>();
    });

    it('must create a range including the lower endpoint and excluding the upper endpoint', () => {
      const range = Range.closedOpen(
        new TestComparable(3),
        new TestComparable(5)
      );

      expect(range.toString()).toBe('[3..5)');
    });
  });

  describe('openClosed', () => {
    it('must type the range as Range.OpenClosed', () => {
      expectTypeOf(
        Range.openClosed(new TestComparable(3), new TestComparable(5))
      ).toEqualTypeOf<Range.OpenClosed<TestComparable>>();
    });

    it('must create a range excluding the lower endpoint and including the upper endpoint', () => {
      const range = Range.openClosed(
        new TestComparable(3),
        new TestComparable(5)
      );

      expect(range.toString()).toBe('(3..5]');
    });
  });

  describe('greaterThan', () => {
    it('must type the range as Range.GreaterThan', () => {
      expectTypeOf(Range.greaterThan(new TestComparable(3))).toEqualTypeOf<
        Range.GreaterThan<TestComparable>
      >();
    });

    it('must create a range unbounded above, excluding the lower endpoint', () => {
      const range = Range.greaterThan(new TestComparable(3));

      expect(range.toString()).toBe('(3..+∞)');
    });
  });

  describe('atLeast', () => {
    it('must type the range as Range.AtLeast', () => {
      expectTypeOf(Range.atLeast(new TestComparable(3))).toEqualTypeOf<
        Range.AtLeast<TestComparable>
      >();
    });

    it('must create a range unbounded above, including the lower endpoint', () => {
      const range = Range.atLeast(new TestComparable(3));

      expect(range.toString()).toBe('[3..+∞)');
    });
  });

  describe('lessThan', () => {
    it('must type the range as Range.LessThan', () => {
      expectTypeOf(Range.lessThan(new TestComparable(5))).toEqualTypeOf<
        Range.LessThan<TestComparable>
      >();
    });

    it('must create a range unbounded below, excluding the upper endpoint', () => {
      const range = Range.lessThan(new TestComparable(5));

      expect(range.toString()).toBe('(-∞..5)');
    });
  });

  describe('atMost', () => {
    it('must type the range as Range.AtMost', () => {
      expectTypeOf(Range.atMost(new TestComparable(5))).toEqualTypeOf<
        Range.AtMost<TestComparable>
      >();
    });

    it('must create a range unbounded below, including the upper endpoint', () => {
      const range = Range.atMost(new TestComparable(5));

      expect(range.toString()).toBe('(-∞..5]');
    });
  });

  describe('all', () => {
    it('must type the range as Range.All', () => {
      expectTypeOf(Range.all<TestComparable>()).toEqualTypeOf<
        Range.All<TestComparable>
      >();
    });

    it('must create a range unbounded on both sides', () => {
      const range = Range.all<TestComparable>();

      expect(range.toString()).toBe('(-∞..+∞)');
    });
  });

  describe('singleton', () => {
    it('must type the range as Range.Closed', () => {
      expectTypeOf(Range.singleton(new TestComparable(3))).toEqualTypeOf<
        Range.Closed<TestComparable>
      >();
    });

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

  describe('[Symbol.toPrimitive]', () => {
    it('must format a range using interval notation when coerced to a string', () => {
      const range = Range.closedOpen(
        new TestComparable(3),
        new TestComparable(5)
      );

      expect(String(range)).toBe('[3..5)');
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

  describe('equals', () => {
    it.each([
      ['open', () => Range.open(Integer.of(1), Integer.of(2))],
      ['closed', () => Range.closed(Integer.of(1), Integer.of(2))],
      ['closedOpen', () => Range.closedOpen(Integer.of(1), Integer.of(2))],
      ['openClosed', () => Range.openClosed(Integer.of(1), Integer.of(2))],
      ['greaterThan', () => Range.greaterThan(Integer.of(1))],
      ['atLeast', () => Range.atLeast(Integer.of(1))],
      ['lessThan', () => Range.lessThan(Integer.of(2))],
      ['atMost', () => Range.atMost(Integer.of(2))],
      ['all', () => Range.all<Integer>()],
      ['singleton', () => Range.singleton(Integer.of(1))],
    ])('must equal a range with the same bounds from %s', (_, create) => {
      expect(create().equals(create())).toBe(true);
    });

    it.each([
      [
        '[1..2]',
        Range.closed(Integer.of(1), Integer.of(2)),
        '[1..2)',
        Range.closedOpen(Integer.of(1), Integer.of(2)),
      ],
      [
        '(1..2]',
        Range.openClosed(Integer.of(1), Integer.of(2)),
        '[1..2]',
        Range.closed(Integer.of(1), Integer.of(2)),
      ],
      [
        '(1..2)',
        Range.open(Integer.of(1), Integer.of(2)),
        '[1..2)',
        Range.closedOpen(Integer.of(1), Integer.of(2)),
      ],
      [
        '(1..+∞)',
        Range.greaterThan(Integer.of(1)),
        '[1..+∞)',
        Range.atLeast(Integer.of(1)),
      ],
      [
        '(-∞..2)',
        Range.lessThan(Integer.of(2)),
        '(-∞..2]',
        Range.atMost(Integer.of(2)),
      ],
    ])(
      'must not equal when only a bound type differs: %s and %s',
      (_, range, __, other) => {
        expect(range.equals(other)).toBe(false);
      }
    );

    it.each([
      [
        '[1..2]',
        Range.closed(Integer.of(1), Integer.of(2)),
        '[0..2]',
        Range.closed(Integer.of(0), Integer.of(2)),
      ],
      [
        '[1..2]',
        Range.closed(Integer.of(1), Integer.of(2)),
        '[1..3]',
        Range.closed(Integer.of(1), Integer.of(3)),
      ],
      [
        '[1..+∞)',
        Range.atLeast(Integer.of(1)),
        '(-∞..+∞)',
        Range.all<Integer>(),
      ],
      [
        '(-∞..2]',
        Range.atMost(Integer.of(2)),
        '(-∞..+∞)',
        Range.all<Integer>(),
      ],
    ])(
      'must not equal when an endpoint differs: %s and %s',
      (_, range, __, other) => {
        expect(range.equals(other)).toBe(false);
      }
    );

    it('must compare bounds rather than the values they contain', () => {
      const closed = Range.closed(Integer.of(1), Integer.of(2));
      const closedOpen = Range.closedOpen(Integer.of(1), Integer.of(3));

      expect(closed.equals(closedOpen)).toBe(false);
      expect(closed.canonical().equals(closedOpen.canonical())).toBe(true);
    });

    it.each([
      [
        'a range over another scalar',
        Range.closed(CodePoint.of(1), CodePoint.of(2)),
      ],
      [
        'a range over values without equality',
        Range.closed(new TestComparable(1), new TestComparable(2)),
      ],
      ['undefined', undefined],
      ['a string', '[1..2]'],
      ['a plain object', {}],
    ])('must not equal %s', (_, other) => {
      expect(Range.closed(Integer.of(1), Integer.of(2)).equals(other)).toBe(
        false
      );
    });
  });

  describe('[Comparable.symbol]', () => {
    it('must delegate to compareTo', () => {
      const a = Range.closed(new TestComparable(1), new TestComparable(9));
      const b = Range.closed(new TestComparable(3), new TestComparable(4));

      expect(a[Comparable.symbol](b)).toBe(a.compareTo(b));
      expect(b[Comparable.symbol](a)).toBe(b.compareTo(a));
    });
  });

  describe('[Equatable.symbol]', () => {
    it.each([
      [Range.closed(Integer.of(1), Integer.of(2)), true],
      [Range.closed(Integer.of(1), Integer.of(3)), false],
    ])('must delegate to equals for [1..2] and %s', (other, expected) => {
      const range = Range.closed(Integer.of(1), Integer.of(2));

      expect(range[Equatable.symbol](other)).toBe(expected);
    });

    it('must make a range equatable', () => {
      expect(Equatable.is(Range.all<Integer>())).toBe(true);
      expect(
        Equatable.equals(
          Range.closed(Integer.of(1), Integer.of(2)),
          Range.closed(Integer.of(1), Integer.of(2))
        )
      ).toBe(true);
      expect(
        Equatable.equals(
          Range.closed(Integer.of(1), Integer.of(2)),
          Range.closed(Integer.of(5), Integer.of(9))
        )
      ).toBe(false);
    });
  });

  describe('lower', () => {
    const three = new TestComparable(3);
    const five = new TestComparable(5);

    it.each<
      [
        string,
        Cut.Lower<TestComparable>,
        typeof BelowAll | typeof BelowValue | typeof AboveValue,
      ]
    >([
      ['open', Range.open(three, five).lower(), AboveValue],
      ['closed', Range.closed(three, five).lower(), BelowValue],
      ['closedOpen', Range.closedOpen(three, five).lower(), BelowValue],
      ['openClosed', Range.openClosed(three, five).lower(), AboveValue],
      ['greaterThan', Range.greaterThan(three).lower(), AboveValue],
      ['atLeast', Range.atLeast(three).lower(), BelowValue],
      ['lessThan', Range.lessThan(five).lower(), BelowAll],
      ['atMost', Range.atMost(five).lower(), BelowAll],
      ['all', Range.all<TestComparable>().lower(), BelowAll],
      ['singleton', Range.singleton(three).lower(), BelowValue],
    ])('must return the lower cut of a range built by %s', (_, cut, kind) => {
      expect(cut).toBeInstanceOf(kind);
    });

    it('must return the cut the range was built from', () => {
      expect(Range.closed(three, five).lower().value()).toBe(three);
    });

    it('must type the lower cut by the factory that built the range', () => {
      expectTypeOf(Range.open(three, five).lower()).toEqualTypeOf<
        AboveValue<TestComparable>
      >();
      expectTypeOf(Range.closed(three, five).lower()).toEqualTypeOf<
        BelowValue<TestComparable>
      >();
      expectTypeOf(Range.closedOpen(three, five).lower()).toEqualTypeOf<
        BelowValue<TestComparable>
      >();
      expectTypeOf(Range.openClosed(three, five).lower()).toEqualTypeOf<
        AboveValue<TestComparable>
      >();
      expectTypeOf(Range.greaterThan(three).lower()).toEqualTypeOf<
        AboveValue<TestComparable>
      >();
      expectTypeOf(Range.atLeast(three).lower()).toEqualTypeOf<
        BelowValue<TestComparable>
      >();
      expectTypeOf(Range.lessThan(five).lower()).toEqualTypeOf<
        BelowAll<TestComparable>
      >();
      expectTypeOf(Range.atMost(five).lower()).toEqualTypeOf<
        BelowAll<TestComparable>
      >();
      expectTypeOf(Range.all<TestComparable>().lower()).toEqualTypeOf<
        BelowAll<TestComparable>
      >();
      expectTypeOf(Range.singleton(three).lower()).toEqualTypeOf<
        BelowValue<TestComparable>
      >();
    });
  });

  describe('upper', () => {
    const three = new TestComparable(3);
    const five = new TestComparable(5);

    it.each<
      [
        string,
        Cut.Upper<TestComparable>,
        typeof AboveAll | typeof BelowValue | typeof AboveValue,
      ]
    >([
      ['open', Range.open(three, five).upper(), BelowValue],
      ['closed', Range.closed(three, five).upper(), AboveValue],
      ['closedOpen', Range.closedOpen(three, five).upper(), BelowValue],
      ['openClosed', Range.openClosed(three, five).upper(), AboveValue],
      ['greaterThan', Range.greaterThan(three).upper(), AboveAll],
      ['atLeast', Range.atLeast(three).upper(), AboveAll],
      ['lessThan', Range.lessThan(five).upper(), BelowValue],
      ['atMost', Range.atMost(five).upper(), AboveValue],
      ['all', Range.all<TestComparable>().upper(), AboveAll],
      ['singleton', Range.singleton(five).upper(), AboveValue],
    ])('must return the upper cut of a range built by %s', (_, cut, kind) => {
      expect(cut).toBeInstanceOf(kind);
    });

    it('must return the cut the range was built from', () => {
      expect(Range.closed(three, five).upper().value()).toBe(five);
    });

    it('must type the upper cut by the factory that built the range', () => {
      expectTypeOf(Range.open(three, five).upper()).toEqualTypeOf<
        BelowValue<TestComparable>
      >();
      expectTypeOf(Range.closed(three, five).upper()).toEqualTypeOf<
        AboveValue<TestComparable>
      >();
      expectTypeOf(Range.closedOpen(three, five).upper()).toEqualTypeOf<
        BelowValue<TestComparable>
      >();
      expectTypeOf(Range.openClosed(three, five).upper()).toEqualTypeOf<
        AboveValue<TestComparable>
      >();
      expectTypeOf(Range.greaterThan(three).upper()).toEqualTypeOf<
        AboveAll<TestComparable>
      >();
      expectTypeOf(Range.atLeast(three).upper()).toEqualTypeOf<
        AboveAll<TestComparable>
      >();
      expectTypeOf(Range.lessThan(five).upper()).toEqualTypeOf<
        BelowValue<TestComparable>
      >();
      expectTypeOf(Range.atMost(five).upper()).toEqualTypeOf<
        AboveValue<TestComparable>
      >();
      expectTypeOf(Range.all<TestComparable>().upper()).toEqualTypeOf<
        AboveAll<TestComparable>
      >();
      expectTypeOf(Range.singleton(five).upper()).toEqualTypeOf<
        AboveValue<TestComparable>
      >();
    });
  });

  describe('lowerBoundType', () => {
    const three = new TestComparable(3);
    const five = new TestComparable(5);

    it.each([
      ['open', Range.open(three, five).lowerBoundType(), 'OPEN'],
      ['closed', Range.closed(three, five).lowerBoundType(), 'CLOSED'],
      ['closedOpen', Range.closedOpen(three, five).lowerBoundType(), 'CLOSED'],
      ['openClosed', Range.openClosed(three, five).lowerBoundType(), 'OPEN'],
      ['greaterThan', Range.greaterThan(three).lowerBoundType(), 'OPEN'],
      ['atLeast', Range.atLeast(three).lowerBoundType(), 'CLOSED'],
      ['lessThan', Range.lessThan(five).lowerBoundType(), 'UNBOUNDED'],
      ['atMost', Range.atMost(five).lowerBoundType(), 'UNBOUNDED'],
      ['all', Range.all<TestComparable>().lowerBoundType(), 'UNBOUNDED'],
      ['singleton', Range.singleton(three).lowerBoundType(), 'CLOSED'],
    ])(
      'must read the lower bound of a range built by %s as %s',
      (_, type, expected) => {
        expect(type).toBe(expected);
      }
    );

    it('must type the lower bound by the factory that built the range', () => {
      expectTypeOf(
        Range.open(three, five).lowerBoundType()
      ).toEqualTypeOf<'OPEN'>();
      expectTypeOf(
        Range.closed(three, five).lowerBoundType()
      ).toEqualTypeOf<'CLOSED'>();
      expectTypeOf(
        Range.closedOpen(three, five).lowerBoundType()
      ).toEqualTypeOf<'CLOSED'>();
      expectTypeOf(
        Range.openClosed(three, five).lowerBoundType()
      ).toEqualTypeOf<'OPEN'>();
      expectTypeOf(
        Range.greaterThan(three).lowerBoundType()
      ).toEqualTypeOf<'OPEN'>();
      expectTypeOf(
        Range.atLeast(three).lowerBoundType()
      ).toEqualTypeOf<'CLOSED'>();
      expectTypeOf(
        Range.lessThan(five).lowerBoundType()
      ).toEqualTypeOf<'UNBOUNDED'>();
      expectTypeOf(
        Range.atMost(five).lowerBoundType()
      ).toEqualTypeOf<'UNBOUNDED'>();
      expectTypeOf(
        Range.all<TestComparable>().lowerBoundType()
      ).toEqualTypeOf<'UNBOUNDED'>();
      expectTypeOf(
        Range.singleton(three).lowerBoundType()
      ).toEqualTypeOf<'CLOSED'>();
    });
  });

  describe('upperBoundType', () => {
    const three = new TestComparable(3);
    const five = new TestComparable(5);

    it.each([
      ['open', Range.open(three, five).upperBoundType(), 'OPEN'],
      ['closed', Range.closed(three, five).upperBoundType(), 'CLOSED'],
      ['closedOpen', Range.closedOpen(three, five).upperBoundType(), 'OPEN'],
      ['openClosed', Range.openClosed(three, five).upperBoundType(), 'CLOSED'],
      ['greaterThan', Range.greaterThan(three).upperBoundType(), 'UNBOUNDED'],
      ['atLeast', Range.atLeast(three).upperBoundType(), 'UNBOUNDED'],
      ['lessThan', Range.lessThan(five).upperBoundType(), 'OPEN'],
      ['atMost', Range.atMost(five).upperBoundType(), 'CLOSED'],
      ['all', Range.all<TestComparable>().upperBoundType(), 'UNBOUNDED'],
      ['singleton', Range.singleton(three).upperBoundType(), 'CLOSED'],
    ])(
      'must read the upper bound of a range built by %s as %s',
      (_, type, expected) => {
        expect(type).toBe(expected);
      }
    );

    it('must type the upper bound by the factory that built the range', () => {
      expectTypeOf(
        Range.open(three, five).upperBoundType()
      ).toEqualTypeOf<'OPEN'>();
      expectTypeOf(
        Range.closed(three, five).upperBoundType()
      ).toEqualTypeOf<'CLOSED'>();
      expectTypeOf(
        Range.closedOpen(three, five).upperBoundType()
      ).toEqualTypeOf<'OPEN'>();
      expectTypeOf(
        Range.openClosed(three, five).upperBoundType()
      ).toEqualTypeOf<'CLOSED'>();
      expectTypeOf(
        Range.greaterThan(three).upperBoundType()
      ).toEqualTypeOf<'UNBOUNDED'>();
      expectTypeOf(
        Range.atLeast(three).upperBoundType()
      ).toEqualTypeOf<'UNBOUNDED'>();
      expectTypeOf(
        Range.lessThan(five).upperBoundType()
      ).toEqualTypeOf<'OPEN'>();
      expectTypeOf(
        Range.atMost(five).upperBoundType()
      ).toEqualTypeOf<'CLOSED'>();
      expectTypeOf(
        Range.all<TestComparable>().upperBoundType()
      ).toEqualTypeOf<'UNBOUNDED'>();
      expectTypeOf(
        Range.singleton(three).upperBoundType()
      ).toEqualTypeOf<'CLOSED'>();
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

  describe('precedes', () => {
    it.each([
      [
        Range.closedOpen(Integer.of(0), Integer.of(2)),
        Range.closedOpen(Integer.of(2), Integer.of(4)),
        true,
        false,
      ],
      [
        Range.closedOpen(Integer.of(0), Integer.of(2)),
        Range.closedOpen(Integer.of(1), Integer.of(3)),
        false,
        false,
      ],
      [
        Range.closed(Integer.of(0), Integer.of(2)),
        Range.closed(Integer.of(2), Integer.of(4)),
        false,
        false,
      ],
      [
        Range.closed(Integer.of(0), Integer.of(2)),
        Range.openClosed(Integer.of(2), Integer.of(4)),
        true,
        false,
      ],
      [
        Range.closedOpen(Integer.of(0), Integer.of(2)),
        Range.closed(Integer.of(2), Integer.of(4)),
        true,
        false,
      ],
      [
        Range.closedOpen(Integer.of(2), Integer.of(2)),
        Range.closedOpen(Integer.of(2), Integer.of(2)),
        true,
        true,
      ],
      [
        Range.closedOpen(Integer.of(1), Integer.of(1)),
        Range.closedOpen(Integer.of(1), Integer.of(3)),
        true,
        false,
      ],
      [
        Range.closedOpen(Integer.of(1), Integer.of(3)),
        Range.closedOpen(Integer.of(3), Integer.of(3)),
        true,
        false,
      ],
      [
        Range.closedOpen(Integer.of(2), Integer.of(2)),
        Range.closedOpen(Integer.of(1), Integer.of(3)),
        false,
        false,
      ],
      [
        Range.lessThan(Integer.of(2)),
        Range.atLeast(Integer.of(2)),
        true,
        false,
      ],
      [
        Range.atLeast(Integer.of(2)),
        Range.closedOpen(Integer.of(5), Integer.of(6)),
        false,
        false,
      ],
      [Range.all<Integer>(), Range.all<Integer>(), false, false],
    ])(
      'must tell whether %s precedes %s (%s) and the reverse (%s)',
      (a, b, aPrecedesB, bPrecedesA) => {
        expect(a.precedes(b)).toBe(aPrecedesB);
        expect(b.precedes(a)).toBe(bPrecedesA);
      }
    );

    it.each([
      [
        Range.open(new TestComparable(0), new TestComparable(2)),
        Range.open(new TestComparable(2), new TestComparable(4)),
        true,
        false,
      ],
      [
        Range.closed(new TestComparable(0), new TestComparable(2)),
        Range.closed(new TestComparable(2), new TestComparable(4)),
        false,
        false,
      ],
      [
        Range.atMost(new TestComparable(2)),
        Range.greaterThan(new TestComparable(2)),
        true,
        false,
      ],
      [
        Range.closed(new TestComparable(0), new TestComparable(1)),
        Range.closed(new TestComparable(3), new TestComparable(4)),
        true,
        false,
      ],
    ])(
      'must tell whether non-discrete %s precedes %s (%s) and the reverse (%s)',
      (a, b, aPrecedesB, bPrecedesA) => {
        expect(a.precedes(b)).toBe(aPrecedesB);
        expect(b.precedes(a)).toBe(bPrecedesA);
      }
    );
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

  describe('clamp', () => {
    it.each([
      [Range.closedOpen(Integer.of(1), Integer.of(3)), '[1..3)'],
      [Range.closedOpen(Integer.of(2), Integer.of(8)), '[2..4)'],
      [Range.closedOpen(Integer.of(-1), Integer.of(1)), '[0..1)'],
      [Range.closedOpen(Integer.of(6), Integer.of(8)), '[4..4)'],
      [Range.closedOpen(Integer.of(-3), Integer.of(-1)), '[0..0)'],
      [Range.lessThan(Integer.of(2)), '[0..2)'],
      [Range.atLeast(Integer.of(2)), '[2..4)'],
      [Range.all<Integer>(), '[0..4)'],
      [Range.closedOpen(Integer.of(4), Integer.of(4)), '[4..4)'],
    ])('must clamp %s to [0..4) as %s', (range, expected) => {
      const domain = Range.closedOpen(Integer.of(0), Integer.of(4));

      expect(range.clamp(domain).toString()).toBe(expected);
    });

    it.each([
      [Range.closedOpen(Integer.of(5), Integer.of(8)), '[5..8)'],
      [Range.closedOpen(Integer.of(-3), Integer.of(-1)), '[0..0)'],
      [Range.lessThan(Integer.of(2)), '[0..2)'],
      [Range.all<Integer>(), '[0..+∞)'],
    ])('must clamp %s to [0..+∞) as %s', (range, expected) => {
      const domain = Range.atLeast(Integer.of(0));

      expect(range.clamp(domain).toString()).toBe(expected);
    });

    it.each([
      [Range.closedOpen(Integer.of(6), Integer.of(8)), '[4..4)'],
      [Range.closedOpen(Integer.of(-3), Integer.of(-1)), '[-3..-1)'],
      [Range.atLeast(Integer.of(2)), '[2..4)'],
      [Range.all<Integer>(), '(-∞..4)'],
    ])('must clamp %s to (-∞..4) as %s', (range, expected) => {
      const domain = Range.lessThan(Integer.of(4));

      expect(range.clamp(domain).toString()).toBe(expected);
    });

    it.each([
      [Range.closedOpen(Integer.of(0), Integer.of(1)), '[2..2)'],
      [Range.closedOpen(Integer.of(5), Integer.of(6)), '[2..2)'],
      [Range.closedOpen(Integer.of(1), Integer.of(3)), '[2..2)'],
      [Range.all<Integer>(), '[2..2)'],
    ])('must clamp %s to the empty domain [2..2) as %s', (range, expected) => {
      const domain = Range.closedOpen(Integer.of(2), Integer.of(2));

      expect(range.clamp(domain).toString()).toBe(expected);
    });

    it.each([
      [Range.closed(new TestComparable(1), new TestComparable(3)), '[1..3]'],
      [Range.closed(new TestComparable(2), new TestComparable(8)), '[2..4)'],
      [Range.closed(new TestComparable(-1), new TestComparable(1)), '(0..1]'],
      [Range.closed(new TestComparable(6), new TestComparable(8)), '[4..4)'],
      [Range.closed(new TestComparable(-3), new TestComparable(-1)), '(0..0]'],
      [Range.closed(new TestComparable(4), new TestComparable(5)), '[4..4)'],
      [Range.all<TestComparable>(), '(0..4)'],
    ])(
      'must clamp %s to (0..4) as %s, keeping bounds as given',
      (range, expected) => {
        const domain = Range.open(new TestComparable(0), new TestComparable(4));

        expect(range.clamp(domain).toString()).toBe(expected);
      }
    );

    it('must type a range clamped to a bounded domain as bounded', () => {
      const clamped = Range.all<Integer>().clamp(
        Range.closedOpen(Integer.of(0), Integer.of(4))
      );

      expectTypeOf(clamped).toEqualTypeOf<Range.Bounded<Integer>>();
      expectTypeOf(clamped.lower().value()).toEqualTypeOf<Integer>();
      expect(clamped.lower().value().value()).toBe(0);
      expect(clamped.upper().value().value()).toBe(4);
    });

    it('must type a range clamped to an unbounded domain as any range', () => {
      const clamped = Range.all<Integer>().clamp(Range.atLeast(Integer.of(0)));

      expectTypeOf(clamped).toEqualTypeOf<Range<Integer>>();
    });
  });

  describe('canonical', () => {
    const semantics: [Range<Integer>, string][] = [
      [Range.closed(Integer.of(1), Integer.of(2)), '[1..3)'],
      [Range.open(Integer.of(0), Integer.of(3)), '[1..3)'],
      [Range.openClosed(Integer.of(0), Integer.of(2)), '[1..3)'],
      [Range.closedOpen(Integer.of(1), Integer.of(3)), '[1..3)'],
      [Range.atLeast(Integer.of(2)), '[2..+∞)'],
      [Range.greaterThan(Integer.of(1)), '[2..+∞)'],
      [Range.atMost(Integer.of(3)), '(-∞..4)'],
      [Range.all<Integer>(), '(-∞..+∞)'],
      [Range.open(Integer.of(1), Integer.of(2)), '[2..2)'],
      [Range.singleton(Integer.of(1)), '[1..2)'],
    ];

    it.each(semantics)('must canonicalise %s as %s', (range, expected) => {
      expect(range.canonical().toString()).toBe(expected);
    });

    it.each(semantics)(
      'must contain the same integers as %s once canonicalised',
      range => {
        const canonical = range.canonical();

        for (let n = -2; n <= 6; n += 1)
          expect(canonical.contains(Integer.of(n))).toBe(
            range.contains(Integer.of(n))
          );
      }
    );

    it.each(semantics)('must be idempotent for %s', range => {
      const canonical = range.canonical();

      expect(canonical.canonical().compareTo(canonical)).toBe(0);
    });

    it.each(semantics)(
      'must give %s a closed or unbounded lower bound and an open or unbounded upper bound',
      range => {
        const canonical = range.canonical();

        expect(canonical.lower()).not.toBeInstanceOf(AboveValue);
        expect(canonical.upper()).not.toBeInstanceOf(AboveValue);
      }
    );

    it('must type the cuts of a canonical range as below a value or unbounded', () => {
      const bounded = Range.closed(Integer.of(1), Integer.of(2)).canonical();
      const unbounded = Range.all<Integer>().canonical();

      expectTypeOf(bounded.lower()).toEqualTypeOf<BelowValue<Integer>>();
      expectTypeOf(bounded.upper()).toEqualTypeOf<BelowValue<Integer>>();
      expectTypeOf(unbounded.lower()).toEqualTypeOf<BelowAll<Integer>>();
      expectTypeOf(unbounded.upper()).toEqualTypeOf<AboveAll<Integer>>();
    });

    it('must canonicalise ranges with the same integers to equal ranges', () => {
      const a = Range.open(Integer.of(0), Integer.of(3)).canonical();
      const b = Range.closed(Integer.of(1), Integer.of(2)).canonical();
      const c = Range.openClosed(Integer.of(0), Integer.of(2)).canonical();

      expect(a.compareTo(b)).toBe(0);
      expect(b.compareTo(c)).toBe(0);
    });

    it('must keep an empty range empty', () => {
      const range = Range.open(Integer.of(1), Integer.of(2));

      expect(range.canonical().isEmpty()).toBe(true);
    });

    it('must throw when the successor of an endpoint is not a safe integer', () => {
      const range = Range.greaterThan(Integer.of(Number.MAX_SAFE_INTEGER));

      expect(() => range.canonical()).toThrow(
        new RangeError(
          `Invalid integer value: ${String(Number.MAX_SAFE_INTEGER + 1)}`
        )
      );
    });
  });
});
