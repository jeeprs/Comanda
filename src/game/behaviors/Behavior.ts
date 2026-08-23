import type { Unit } from "../entities/Unit";
import type { World } from "../world/World";

/**
 * A behavior rule a unit follows each tick. Familiars will eventually pick
 * from a set of these (or a composed tree of them); for now each unit just
 * runs one.
 */
export interface Behavior {
  update(unit: Unit, world: World, delta: number): void;
}
