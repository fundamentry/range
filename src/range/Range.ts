import { type Comparable, type Stringable } from '@fundamentry/trait';

import { Cut } from '#project/cut';

export namespace Range {
  export namespace Bound {
    export type Type = 'CLOSED' | 'OPEN' | 'UNBOUNDED';
  }
}

export class Range<T extends Comparable<T> & Stringable> implements Stringable {
  #lower: Cut<T>;

  #upper: Cut<T>;

  private constructor(lower: Cut<T>, upper: Cut<T>) {
    this.#lower = lower;
    this.#upper = upper;

    if (
      this.#lower.compareTo(this.#upper) > 0 ||
      this.#lower.compareTo(Cut.aboveAll()) === 0 ||
      this.#upper.compareTo(Cut.belowAll()) === 0
    )
      throw new RangeError(`Invalid range: ${this.toString()}`);
  }

  static open<T extends Comparable<T> & Stringable>(
    lower: T,
    upper: T
  ): Range<T> {
    return new Range(Cut.aboveValue(lower), Cut.belowValue(upper));
  }

  static closed<T extends Comparable<T> & Stringable>(
    lower: T,
    upper: T
  ): Range<T> {
    return new Range(Cut.belowValue(lower), Cut.aboveValue(upper));
  }

  static closedOpen<T extends Comparable<T> & Stringable>(
    lower: T,
    upper: T
  ): Range<T> {
    return new Range(Cut.belowValue(lower), Cut.belowValue(upper));
  }

  static openClosed<T extends Comparable<T> & Stringable>(
    lower: T,
    upper: T
  ): Range<T> {
    return new Range(Cut.aboveValue(lower), Cut.aboveValue(upper));
  }

  static greaterThan<T extends Comparable<T> & Stringable>(lower: T): Range<T> {
    return new Range(Cut.aboveValue(lower), Cut.aboveAll());
  }

  static atLeast<T extends Comparable<T> & Stringable>(lower: T): Range<T> {
    return new Range(Cut.belowValue(lower), Cut.aboveAll());
  }

  static lessThan<T extends Comparable<T> & Stringable>(upper: T): Range<T> {
    return new Range(Cut.belowAll(), Cut.belowValue(upper));
  }

  static atMost<T extends Comparable<T> & Stringable>(upper: T): Range<T> {
    return new Range(Cut.belowAll(), Cut.aboveValue(upper));
  }

  static all<T extends Comparable<T> & Stringable>(): Range<T> {
    return new Range(Cut.belowAll(), Cut.aboveAll());
  }

  static singleton<T extends Comparable<T> & Stringable>(value: T): Range<T> {
    return new Range(Cut.belowValue(value), Cut.aboveValue(value));
  }

  toString(): string {
    return `${this.#lower.describeAsLowerBound()}..${this.#upper.describeAsUpperBound()}`;
  }

  hasLowerBound(): boolean {
    return this.lowerEndpoint() !== undefined;
  }

  hasUpperBound(): boolean {
    return this.upperEndpoint() !== undefined;
  }

  lowerEndpoint(): T | undefined {
    return this.#lower.endpoint();
  }

  upperEndpoint(): T | undefined {
    return this.#upper.endpoint();
  }

  lowerBoundType(): Range.Bound.Type {
    if (!this.hasLowerBound()) return 'UNBOUNDED';

    return this.#lower.isBelowValue() ? 'CLOSED' : 'OPEN';
  }

  upperBoundType(): Range.Bound.Type {
    if (!this.hasUpperBound()) return 'UNBOUNDED';

    return this.#upper.isAboveValue() ? 'CLOSED' : 'OPEN';
  }

  isEmpty(): boolean {
    return this.#lower.compareTo(this.#upper) === 0;
  }

  contains(value: T): boolean {
    return this.#lower.isLessThan(value) && !this.#upper.isLessThan(value);
  }

  containsAll(values: Iterable<T>): boolean {
    return [...values].every(value => this.contains(value));
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
}
