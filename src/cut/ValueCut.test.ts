import { describe, expect, it } from 'vitest';

import { Comparable, type Stringable } from '@fundamentry/trait';

import { AboveAll } from './AboveAll.js';
import { AboveValue } from './AboveValue.js';
import { BelowAll } from './BelowAll.js';
import { BelowValue } from './BelowValue.js';
import { ValueCut } from './ValueCut.js';

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

describe('ValueCut', () => {
  describe('[Symbol.hasInstance]', () => {
    it.each([
      ['a below-value cut', new BelowValue(new TestComparable(3)), true],
      ['an above-value cut', new AboveValue(new TestComparable(3)), true],
      ['a below-all cut', new BelowAll<TestComparable>(), false],
      ['an above-all cut', new AboveAll<TestComparable>(), false],
    ])('must tell whether %s is a cut at a value: %s', (_, cut, expected) => {
      expect(cut instanceof ValueCut).toBe(expected);
    });

    it.each([
      ['a below-value cut', new BelowValue(new TestComparable(3)), true],
      ['an above-value cut', new AboveValue(new TestComparable(3)), false],
    ])(
      'must keep checking for the subclass it is called on: %s is a below-value cut: %s',
      (_, cut, expected) => {
        expect(cut instanceof BelowValue).toBe(expected);
      }
    );
  });

  describe('compareTo', () => {
    it.each([
      [
        'a lower value before a higher one',
        new BelowValue(new TestComparable(3)),
        new AboveValue(new TestComparable(5)),
        -2,
      ],
      [
        'a higher value after a lower one',
        new AboveValue(new TestComparable(5)),
        new BelowValue(new TestComparable(3)),
        2,
      ],
      [
        'two below-value cuts at the same value as equal',
        new BelowValue(new TestComparable(3)),
        new BelowValue(new TestComparable(3)),
        0,
      ],
      [
        'two above-value cuts at the same value as equal',
        new AboveValue(new TestComparable(3)),
        new AboveValue(new TestComparable(3)),
        0,
      ],
      [
        'below before above at the same value',
        new BelowValue(new TestComparable(3)),
        new AboveValue(new TestComparable(3)),
        -1,
      ],
      [
        'above after below at the same value',
        new AboveValue(new TestComparable(3)),
        new BelowValue(new TestComparable(3)),
        1,
      ],
      [
        'the value before the side: above a lower value before below a higher one',
        new AboveValue(new TestComparable(3)),
        new BelowValue(new TestComparable(5)),
        -2,
      ],
      [
        'the value before the side: below a higher value after above a lower one',
        new BelowValue(new TestComparable(5)),
        new AboveValue(new TestComparable(3)),
        2,
      ],
      [
        'a below-value cut after a below-all cut',
        new BelowValue(new TestComparable(3)),
        new BelowAll<TestComparable>(),
        1,
      ],
      [
        'an above-value cut after a below-all cut',
        new AboveValue(new TestComparable(3)),
        new BelowAll<TestComparable>(),
        1,
      ],
      [
        'a below-value cut before an above-all cut',
        new BelowValue(new TestComparable(3)),
        new AboveAll<TestComparable>(),
        -1,
      ],
      [
        'an above-value cut before an above-all cut',
        new AboveValue(new TestComparable(3)),
        new AboveAll<TestComparable>(),
        -1,
      ],
    ])('must order %s', (_, cut, other, expected) => {
      expect(cut.compareTo(other)).toBe(expected);
    });
  });

  describe('toString', () => {
    it.each([
      ['a below-value cut', new BelowValue(new TestComparable(3))],
      ['an above-value cut', new AboveValue(new TestComparable(3))],
    ])('must describe %s by its value', (_, cut) => {
      expect(cut.toString()).toBe('3');
    });
  });
});
