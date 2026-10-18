import { Comparable, type Stringable } from '@fundamentry/trait';

import { Cut } from './Cut.js';

export abstract class ValueCut<
  T extends Comparable<T> & Stringable,
> extends Cut<T> {
  static [Symbol.hasInstance]<T extends Comparable<T> & Stringable>(
    cut: Cut<T>
  ): cut is ValueCut<T> {
    return Function.prototype[Symbol.hasInstance].call(this, cut);
  }

  abstract value(): T;

  override compareTo(other: Cut<T>): number {
    const value = this.value();

    return other instanceof ValueCut
      ? value[Comparable.symbol](other.value()) ||
          Number(other.isBelow(value)) - Number(this.isBelow(value))
      : -other.compareTo(this);
  }

  override toString(): string {
    return this.value()[Symbol.toPrimitive]('string');
  }
}
