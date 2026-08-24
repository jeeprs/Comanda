import * as THREE from "three";
import type { Behavior } from "./Behavior";
import type { Unit } from "../entities/Unit";
import type { World } from "../world/World";

const _toTarget = new THREE.Vector3();

/**
 * Walks toward the nearest enemy this unit can actually attack and engages it
 * once in range. Idles when every living enemy is out of its targetable
 * domains (e.g. a ground-only melee unit facing nothing but fliers).
 */
export class SeekAndAttackBehavior implements Behavior {
  update(unit: Unit, world: World, delta: number): void {
    const target = world.nearestEnemy(unit);
    if (!target) {
      unit.setState("idle");
      return;
    }

    _toTarget.subVectors(target.position, unit.position);
    const distance = _toTarget.length();

    if (distance > unit.attackRange) {
      _toTarget.normalize();
      unit.moveBy(_toTarget, delta);
      unit.faceDirection(_toTarget);
      unit.setState("moving");
    } else {
      unit.faceDirection(_toTarget.normalize());
      unit.setState("attacking");
      unit.tryAttack(target, delta);
    }
  }
}
