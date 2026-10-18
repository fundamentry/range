import { Comparator } from '@fundamentry/order';
import { Comparable, Discrete, type Stringable } from '@fundamentry/trait';

import {
  AboveAll,
  AboveValue,
  BelowAll,
  BelowValue,
  type Cut,
  ValueCut,
} from '#project/cut';

export namespace Range {
  export namespace Bound {
    export type Type = 'CLOSED' | 'OPEN' | 'UNBOUNDED';
  }

  export type Open<T extends Comparable<T> & Stringable> = Range<
    T,
    AboveValue<T>,
    BelowValue<T>
  >;

  export type Closed<T extends Comparable<T> & Stringable> = Range<
    T,
    BelowValue<T>,
    AboveValue<T>
  >;

  export type ClosedOpen<T extends Comparable<T> & Stringable> = Range<
    T,
    BelowValue<T>,
    BelowValue<T>
  >;

  export type OpenClosed<T extends Comparable<T> & Stringable> = Range<
    T,
    AboveValue<T>,
    AboveValue<T>
  >;

  export type GreaterThan<T extends Comparable<T> & Stringable> = Range<
    T,
    AboveValue<T>,
    AboveAll<T>
  >;

  export type AtLeast<T extends Comparable<T> & Stringable> = Range<
    T,
    BelowValue<T>,
    AboveAll<T>
  >;

  export type LessThan<T extends Comparable<T> & Stringable> = Range<
    T,
    BelowAll<T>,
    BelowValue<T>
  >;

  export type AtMost<T extends Comparable<T> & Stringable> = Range<
    T,
    BelowAll<T>,
    AboveValue<T>
  >;

  export type All<T extends Comparable<T> & Stringable> = Range<
    T,
    BelowAll<T>,
    AboveAll<T>
  >;

  export type Bounded<T extends Comparable<T> & Stringable> = Range<
    T,
    Cut.Bounded<T>,
    Cut.Bounded<T>
  >;
}

export class Range<
  T extends Comparable<T> & Stringable,
  L extends Cut.Lower<T> = Cut.Lower<T>,
  U extends Cut.Upper<T> = Cut.Upper<T>,
>
  implements Comparable<Range<T>>, Stringable
{
  readonly #lower: L;

  readonly #upper: U;

  private constructor(lower: L, upper: U) {
    this.#lower = lower;
    this.#upper = upper;

    if (this.#lower.compareTo(this.#upper) > 0)
      throw new RangeError(`Invalid range: ${this.toString()}`);
  }

  static open<T extends Comparable<T> & Stringable>(
    lower: T,
    upper: T
  ): Range.Open<T> {
    return new Range(new AboveValue(lower), new BelowValue(upper));
  }

  static closed<T extends Comparable<T> & Stringable>(
    lower: T,
    upper: T
  ): Range.Closed<T> {
    return new Range(new BelowValue(lower), new AboveValue(upper));
  }

  static closedOpen<T extends Comparable<T> & Stringable>(
    lower: T,
    upper: T
  ): Range.ClosedOpen<T> {
    return new Range(new BelowValue(lower), new BelowValue(upper));
  }

  static openClosed<T extends Comparable<T> & Stringable>(
    lower: T,
    upper: T
  ): Range.OpenClosed<T> {
    return new Range(new AboveValue(lower), new AboveValue(upper));
  }

  static greaterThan<T extends Comparable<T> & Stringable>(
    lower: T
  ): Range.GreaterThan<T> {
    return new Range(new AboveValue(lower), new AboveAll<T>());
  }

  static atLeast<T extends Comparable<T> & Stringable>(
    lower: T
  ): Range.AtLeast<T> {
    return new Range(new BelowValue(lower), new AboveAll<T>());
  }

  static lessThan<T extends Comparable<T> & Stringable>(
    upper: T
  ): Range.LessThan<T> {
    return new Range(new BelowAll<T>(), new BelowValue(upper));
  }

  static atMost<T extends Comparable<T> & Stringable>(
    upper: T
  ): Range.AtMost<T> {
    return new Range(new BelowAll<T>(), new AboveValue(upper));
  }

  static all<T extends Comparable<T> & Stringable>(): Range.All<T> {
    return new Range(new BelowAll<T>(), new AboveAll<T>());
  }

  static singleton<T extends Comparable<T> & Stringable>(
    value: T
  ): Range.Closed<T> {
    return Range.closed(value, value);
  }

  toString(): string {
    const opening = this.lowerBoundType() === 'CLOSED' ? '[' : '(';
    const closing = this.upperBoundType() === 'CLOSED' ? ']' : ')';

    return `${opening}${String(this.#lower)}..${String(this.#upper)}${closing}`;
  }

  compareTo(other: Range<T>): number {
    return Comparator.comparingWith<Range<T>, Cut<T>>(range => range.#lower)
      .thenComparingByWith(range => range.#upper)
      .compare(this, other);
  }

  [Comparable.symbol](other: Range<T>): number {
    return this.compareTo(other);
  }

  [Symbol.toPrimitive](): string {
    return this.toString();
  }

  lower(): L {
    return this.#lower;
  }

  upper(): U {
    return this.#upper;
  }

  lowerBoundType(): L extends BelowValue<T>
    ? 'CLOSED'
    : L extends AboveValue<T>
      ? 'OPEN'
      : 'UNBOUNDED';

  lowerBoundType(): Range.Bound.Type {
    if (this.#lower instanceof BelowValue) return 'CLOSED';

    return this.#lower instanceof AboveValue ? 'OPEN' : 'UNBOUNDED';
  }

  upperBoundType(): U extends BelowValue<T>
    ? 'OPEN'
    : U extends AboveValue<T>
      ? 'CLOSED'
      : 'UNBOUNDED';

  upperBoundType(): Range.Bound.Type {
    if (this.#upper instanceof BelowValue) return 'OPEN';

    return this.#upper instanceof AboveValue ? 'CLOSED' : 'UNBOUNDED';
  }

  isEmpty(): boolean {
    return this.#lower.compareTo(this.#upper) === 0;
  }

  contains(value: T): boolean {
    return this.#lower.isBelow(value) && !this.#upper.isBelow(value);
  }

  containsAll(values: Iterable<T>): boolean {
    for (const value of values) if (!this.contains(value)) return false;

    return true;
  }

  encloses(other: Range<T>): boolean {
    return (
      this.#lower.compareTo(other.#lower) <= 0 &&
      this.#upper.compareTo(other.#upper) >= 0
    );
  }

  isConnected(other: Range<T>): boolean {
    return (
      this.#lower.compareTo(other.#upper) <= 0 &&
      other.#lower.compareTo(this.#upper) <= 0
    );
  }

  intersection(other: Range<T>): Range<T> | undefined {
    return this.isConnected(other) ? this.clamp(other) : undefined;
  }

  span(other: Range<T>): Range<T> {
    const lower =
      this.#lower.compareTo(other.#lower) <= 0 ? this.#lower : other.#lower;
    const upper =
      this.#upper.compareTo(other.#upper) >= 0 ? this.#upper : other.#upper;

    return new Range(lower, upper);
  }

  clamp(domain: Range.Bounded<T>): Range.Bounded<T>;

  clamp(domain: Range<T>): Range<T>;

  clamp(domain: Range<T>): Range<T> {
    const max = <C extends Cut<T>>(a: C, b: C) => (a.compareTo(b) >= 0 ? a : b);
    const min = <C extends Cut<T>>(a: C, b: C) => (a.compareTo(b) <= 0 ? a : b);

    const cappedAt = (cut: Cut.Lower<T>, bound: Cut.Upper<T>) =>
      bound instanceof ValueCut && cut.compareTo(bound) > 0 ? bound : cut;
    const flooredAt = (cut: Cut.Upper<T>, bound: Cut.Lower<T>) =>
      bound instanceof ValueCut && cut.compareTo(bound) < 0 ? bound : cut;

    return new Range(
      cappedAt(max(this.#lower, domain.#lower), domain.#upper),
      flooredAt(min(this.#upper, domain.#upper), domain.#lower)
    );
  }

  canonical<D extends Comparable<D> & Stringable>(
    this: Range<D & Discrete<D>>
  ): Range<
    D,
    L extends BelowAll<D & Discrete<D>> ? BelowAll<D> : BelowValue<D>,
    U extends AboveAll<D & Discrete<D>> ? AboveAll<D> : BelowValue<D>
  >;

  canonical<D extends Comparable<D> & Stringable>(
    this: Range<D & Discrete<D>>
  ): Range<D> {
    const canonicalise = <C extends Cut<D & Discrete<D>>>(cut: C) =>
      cut instanceof AboveValue
        ? new BelowValue(cut.value()[Discrete.successor]())
        : cut;

    return new Range(canonicalise(this.#lower), canonicalise(this.#upper));
  }
}
