import { Comparable, type Stringable } from '@fundamentry/trait';

import { type Cut } from './Cut.js';
import { ValueCut } from './ValueCut.js';

export class AboveValue<
  T extends Comparable<T> & Stringable,
> extends ValueCut<T> {
  readonly #value: T;

  constructor(value: T) {
    super();

    this.#value = value;
  }

  static override [Symbol.hasInstance]<T extends Comparable<T> & Stringable>(
    cut: Cut<T>
  ): cut is AboveValue<T> {
    return Function.prototype[Symbol.hasInstance].call(this, cut);
  }

  override value(): T {
    return this.#value;
  }

  override isBelow(value: T): boolean {
    return this.#value[Comparable.symbol](value) < 0;
  }
}
