import { type Comparable, type Stringable } from '@fundamentry/trait';

import { Cut } from './Cut.js';

export class BelowAll<T extends Comparable<T> & Stringable> extends Cut<T> {
  override isBelow(_: T): true {
    return true;
  }

  override compareTo(other: Cut<T>): number {
    return other instanceof BelowAll ? 0 : -1;
  }

  override toString(): '-∞' {
    return '-∞';
  }
}
