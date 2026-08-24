import type { Unit } from "../entities/Unit";
import type { Team } from "../entities/Team";
import { canTarget } from "../entities/Archetype";

/** Holds all live units and answers the queries behaviors need (nearest enemy, etc). */
export class World {
  readonly units: Unit[] = [];

  add(unit: Unit) {
    this.units.push(unit);
  }

  /** Despawns every unit, releasing their meshes and hp bars. */
  clear() {
    for (const unit of this.units) unit.dispose();
    this.units.length = 0;
  }

  removeDead() {
    for (const unit of this.units.filter((u) => !u.isAlive())) {
      unit.dispose();
    }
    this.units.splice(0, this.units.length, ...this.units.filter((u) => u.isAlive()));
  }

  /**
   * Nearest living enemy this unit is actually able to attack — a ground-only
   * attacker will not see aerial units at all.
   */
  nearestEnemy(unit: Unit): Unit | undefined {
    let nearest: Unit | undefined;
    let nearestDistSq = Infinity;
    for (const other of this.units) {
      if (other === unit || other.team === unit.team || !other.isAlive()) continue;
      if (!canTarget(unit.archetype, other.domain)) continue;
      const distSq = unit.position.distanceToSquared(other.position);
      if (distSq < nearestDistSq) {
        nearestDistSq = distSq;
        nearest = other;
      }
    }
    return nearest;
  }

  unitsOfTeam(team: Team): Unit[] {
    return this.units.filter((u) => u.team === team);
  }
}
