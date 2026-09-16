import { type Comparable, type Stringable } from '@fundamentry/trait';

import { type Range } from '#project/range';

export class RangeSet<
  T extends Comparable<T> & Stringable,
> implements Stringable {
  readonly #ranges: readonly Range<T>[];

  private constructor(ranges: readonly Range<T>[]) {
    this.#ranges = ranges;
  }

  static from<T extends Comparable<T> & Stringable>(
    ranges: Iterable<Range<T>>
  ): RangeSet<T> {
    const merged: Range<T>[] = [];

    [...ranges]
      .filter(range => !range.isEmpty())
      .sort((a, b) => a.compareTo(b))
      .forEach(range => {
        const last = merged.at(-1);

        if (last?.isConnected(range))
          merged[merged.length - 1] = last.span(range);
        else merged.push(range);
      });

    return new RangeSet(merged);
  }

  toString(): string {
    return `{${this.#ranges.map(range => range.toString()).join(', ')}}`;
  }

  contains(value: T): boolean {
    return this.#ranges.some(range => range.contains(value));
  }

  encloses(range: Range<T>): boolean {
    return this.#ranges.some(member => member.encloses(range));
  }

  asRanges(): readonly Range<T>[] {
    return this.#ranges;
  }

  isEmpty(): boolean {
    return this.#ranges.length === 0;
  }

  span(): Range<T> {
    const first = this.#ranges.at(0);
    const last = this.#ranges.at(-1);

    if (first === undefined || last === undefined)
      throw new RangeError('Cannot compute span of an empty range set.');

    return first.span(last);
  }
}
