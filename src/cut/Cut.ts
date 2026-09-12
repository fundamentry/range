import { Comparator } from '@fundamentry/order';
import { type Comparable, type Stringable } from '@fundamentry/trait';

export namespace Cut {
  export type Variant<T extends Comparable<T> & Stringable> =
    | { kind: 'BELOW_ALL'; rank: -1 }
    | { kind: 'ABOVE_ALL'; rank: 1 }
    | { kind: 'BELOW_VALUE'; rank: 0; value: T }
    | { kind: 'ABOVE_VALUE'; rank: 0; value: T };
}

export class Cut<T extends Comparable<T> & Stringable> implements Comparable<
  Cut<T>
> {
  #variant: Cut.Variant<T>;

  private constructor(variant: Cut.Variant<T>) {
    this.#variant = variant;
  }

  static belowAll<T extends Comparable<T> & Stringable>(): Cut<T> {
    return new Cut({ kind: 'BELOW_ALL', rank: -1 });
  }

  static aboveAll<T extends Comparable<T> & Stringable>(): Cut<T> {
    return new Cut({ kind: 'ABOVE_ALL', rank: 1 });
  }

  static belowValue<T extends Comparable<T> & Stringable>(value: T): Cut<T> {
    return new Cut({ kind: 'BELOW_VALUE', rank: 0, value });
  }

  static aboveValue<T extends Comparable<T> & Stringable>(value: T): Cut<T> {
    return new Cut({ kind: 'ABOVE_VALUE', rank: 0, value });
  }

  describeAsLowerBound(): string {
    const variant = this.#variant;

    if (variant.kind === 'BELOW_ALL') return '(-∞';
    if (variant.kind === 'ABOVE_ALL') return '(+∞';
    if (variant.kind === 'BELOW_VALUE') return `[${variant.value.toString()}`;

    return `(${variant.value.toString()}`;
  }

  describeAsUpperBound(): string {
    const variant = this.#variant;

    if (variant.kind === 'ABOVE_ALL') return '+∞)';

    if (variant.kind === 'BELOW_ALL') return '-∞)';

    if (variant.kind === 'ABOVE_VALUE') return `${variant.value.toString()}]`;

    return `${variant.value.toString()})`;
  }

  isBelowValue(): boolean {
    return this.#variant.kind === 'BELOW_VALUE';
  }

  isAboveValue(): boolean {
    return this.#variant.kind === 'ABOVE_VALUE';
  }

  endpoint(): T | undefined {
    const variant = this.#variant;

    return variant.kind === 'BELOW_VALUE' || variant.kind === 'ABOVE_VALUE'
      ? variant.value
      : undefined;
  }

  isLessThan(value: T): boolean {
    const variant = this.#variant;

    if (variant.kind === 'BELOW_ALL') return true;

    if (variant.kind === 'ABOVE_ALL') return false;

    if (variant.kind === 'BELOW_VALUE')
      return variant.value.compareTo(value) <= 0;

    return variant.value.compareTo(value) < 0;
  }

  compareTo(other: Cut<T>): number {
    return Comparator.comparingNumber<Cut<T>>(cut => cut.#variant.rank)
      .thenComparingByOptionalWith(cut => cut.endpoint())
      .thenComparingByBoolean(cut => cut.isAboveValue())
      .compare(this, other);
  }
}
