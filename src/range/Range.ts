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
}

export class Range<T extends Comparable<T> & Stringable>
  implements Comparable<Range<T>>, Stringable
{
  #lower: Cut.Lower<T>;

  #upper: Cut.Upper<T>;

  private constructor(lower: Cut.Lower<T>, upper: Cut.Upper<T>) {
    this.#lower = lower;
    this.#upper = upper;

    if (this.#lower.compareTo(this.#upper) > 0)
      throw new RangeError(`Invalid range: ${this.toString()}`);
  }

  static open<T extends Comparable<T> & Stringable>(
    lower: T,
    upper: T
  ): Range<T> {
    return new Range(new AboveValue(lower), new BelowValue(upper));
  }

  static closed<T extends Comparable<T> & Stringable>(
    lower: T,
    upper: T
  ): Range<T> {
    return new Range(new BelowValue(lower), new AboveValue(upper));
  }

  static closedOpen<T extends Comparable<T> & Stringable>(
    lower: T,
    upper: T
  ): Range<T> {
    return new Range(new BelowValue(lower), new BelowValue(upper));
  }

  static openClosed<T extends Comparable<T> & Stringable>(
    lower: T,
    upper: T
  ): Range<T> {
    return new Range(new AboveValue(lower), new AboveValue(upper));
  }

  static greaterThan<T extends Comparable<T> & Stringable>(lower: T): Range<T> {
    return new Range(new AboveValue(lower), new AboveAll<T>());
  }

  static atLeast<T extends Comparable<T> & Stringable>(lower: T): Range<T> {
    return new Range(new BelowValue(lower), new AboveAll<T>());
  }

  static lessThan<T extends Comparable<T> & Stringable>(upper: T): Range<T> {
    return new Range(new BelowAll<T>(), new BelowValue(upper));
  }

  static atMost<T extends Comparable<T> & Stringable>(upper: T): Range<T> {
    return new Range(new BelowAll<T>(), new AboveValue(upper));
  }

  static all<T extends Comparable<T> & Stringable>(): Range<T> {
    return new Range(new BelowAll<T>(), new AboveAll<T>());
  }

  static singleton<T extends Comparable<T> & Stringable>(value: T): Range<T> {
    return new Range(new BelowValue(value), new AboveValue(value));
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

  hasLowerBound(): boolean {
    return this.lowerEndpoint() !== undefined;
  }

  hasUpperBound(): boolean {
    return this.upperEndpoint() !== undefined;
  }

  lowerEndpoint(): T | undefined {
    const lower = this.#lower;

    return lower instanceof ValueCut ? lower.value() : undefined;
  }

  upperEndpoint(): T | undefined {
    const upper = this.#upper;

    return upper instanceof ValueCut ? upper.value() : undefined;
  }

  lowerBoundType(): Range.Bound.Type {
    const lower = this.#lower;

    if (!(lower instanceof ValueCut)) return 'UNBOUNDED';

    return lower.isBelow(lower.value()) ? 'CLOSED' : 'OPEN';
  }

  upperBoundType(): Range.Bound.Type {
    const upper = this.#upper;

    if (!(upper instanceof ValueCut)) return 'UNBOUNDED';

    return upper.isBelow(upper.value()) ? 'OPEN' : 'CLOSED';
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
    if (!this.isConnected(other)) return undefined;

    const lower =
      this.#lower.compareTo(other.#lower) >= 0 ? this.#lower : other.#lower;
    const upper =
      this.#upper.compareTo(other.#upper) <= 0 ? this.#upper : other.#upper;

    return new Range(lower, upper);
  }

  span(other: Range<T>): Range<T> {
    const lower =
      this.#lower.compareTo(other.#lower) <= 0 ? this.#lower : other.#lower;
    const upper =
      this.#upper.compareTo(other.#upper) >= 0 ? this.#upper : other.#upper;

    return new Range(lower, upper);
  }

  canonical<D extends Comparable<D> & Stringable>(
    this: Range<D & Discrete<D>>
  ): Range<D> {
    const canonicalise = <C extends Cut<D & Discrete<D>>>(cut: C) =>
      cut instanceof ValueCut && !cut.isBelow(cut.value())
        ? new BelowValue(cut.value()[Discrete.successor]())
        : cut;

    return new Range(canonicalise(this.#lower), canonicalise(this.#upper));
  }
}
