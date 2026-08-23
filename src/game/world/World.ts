import type { Unit } from "../entities/Unit";
import type { Team } from "../entities/Team";

/** Holds all live units and answers the queries behaviors need (nearest enemy, etc). */
export class World {
  readonly units: Unit[] = [];

  add(unit: Unit) {
    this.units.push(unit);
  }

  removeDead() {
    for (const unit of this.units.filter((u) => !u.isAlive())) {
      unit.dispose();
    }
    this.units.splice(0, this.units.length, ...this.units.filter((u) => u.isAlive()));
  }

  nearestEnemy(unit: Unit): Unit | undefined {
    let nearest: Unit | undefined;
    let nearestDistSq = Infinity;
    for (const other of this.units) {
      if (other === unit || other.team === unit.team || !other.isAlive()) continue;
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
