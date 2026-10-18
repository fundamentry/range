import { Comparable, type Stringable } from '@fundamentry/trait';

import { type AboveAll } from './AboveAll.js';
import { type AboveValue } from './AboveValue.js';
import { type BelowAll } from './BelowAll.js';
import { type BelowValue } from './BelowValue.js';

export namespace Cut {
  export type Lower<T extends Comparable<T> & Stringable> =
    BelowAll<T> | BelowValue<T> | AboveValue<T>;

  export type Upper<T extends Comparable<T> & Stringable> =
    AboveAll<T> | BelowValue<T> | AboveValue<T>;

  export type Bounded<T extends Comparable<T> & Stringable> =
    BelowValue<T> | AboveValue<T>;
}

export abstract class Cut<T extends Comparable<T> & Stringable>
  implements Comparable<Cut<T>>, Stringable
{
  abstract isBelow(value: T): boolean;

  abstract compareTo(other: Cut<T>): number;

  abstract toString(): string;

  [Comparable.symbol](other: Cut<T>): number {
    return this.compareTo(other);
  }

  [Symbol.toPrimitive](): string {
    return this.toString();
  }
}
