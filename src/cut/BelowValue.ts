import { Comparable, Equatable, type Stringable } from '@fundamentry/trait';

import { Cut } from './Cut.js';
import { ValueCut } from './ValueCut.js';

export class BelowValue<
  T extends Comparable<T> & Stringable,
> extends ValueCut<T> {
  readonly #value: T;

  constructor(value: T) {
    super();

    this.#value = value;
  }

  static override [Symbol.hasInstance]<T extends Comparable<T> & Stringable>(
    cut: Cut<T>
  ): cut is BelowValue<T> {
    return Function.prototype[Symbol.hasInstance].call(this, cut);
  }

  override value(): T {
    return this.#value;
  }

  override equals(other: unknown): boolean {
    return (
      other instanceof Cut &&
      other instanceof BelowValue &&
      Equatable.equals<unknown>(this.#value, other.value())
    );
  }

  override isBelow(value: T): boolean {
    return this.#value[Comparable.symbol](value) <= 0;
  }
}
