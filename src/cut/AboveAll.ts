import { type Comparable, type Stringable } from '@fundamentry/trait';

import { Cut } from './Cut.js';

export class AboveAll<T extends Comparable<T> & Stringable> extends Cut<T> {
  override isBelow(_: T): false {
    return false;
  }

  override compareTo(other: Cut<T>): number {
    return other instanceof AboveAll ? 0 : 1;
  }

  override toString(): '+∞' {
    return '+∞';
  }
}
