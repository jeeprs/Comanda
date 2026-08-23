import * as THREE from "three";
import { Team } from "./Team";
import { buildUnitMesh } from "./UnitMesh";
import type { Behavior } from "../behaviors/Behavior";
import type { World } from "../world/World";

export type UnitState = "idle" | "moving" | "attacking" | "dead";

export interface UnitConfig {
  id: string;
  team: Team;
  color: number;
  position: THREE.Vector3;
  behavior: Behavior;
  maxHp?: number;
  moveSpeed?: number;
  attackDamage?: number;
  attackRange?: number;
  attackInterval?: number;
}

export class Unit {
  readonly id: string;
  readonly team: Team;
  readonly mesh: THREE.Group;
  readonly behavior: Behavior;

  maxHp: number;
  hp: number;
  moveSpeed: number;
  attackDamage: number;
  attackRange: number;
  attackInterval: number;

  private state: UnitState = "idle";
  private attackCooldown = 0;

  constructor(config: UnitConfig) {
    this.id = config.id;
    this.team = config.team;
    this.behavior = config.behavior;
    this.maxHp = config.maxHp ?? 100;
    this.hp = this.maxHp;
    this.moveSpeed = config.moveSpeed ?? 3;
    this.attackDamage = config.attackDamage ?? 12;
    this.attackRange = config.attackRange ?? 1.6;
    this.attackInterval = config.attackInterval ?? 0.8;

    this.mesh = buildUnitMesh(config.color);
    this.mesh.position.copy(config.position);
  }

  get position(): THREE.Vector3 {
    return this.mesh.position;
  }

  isAlive(): boolean {
    return this.hp > 0;
  }

  getState(): UnitState {
    return this.state;
  }

  setState(state: UnitState) {
    this.state = state;
  }

  moveBy(direction: THREE.Vector3, delta: number) {
    this.mesh.position.addScaledVector(direction, this.moveSpeed * delta);
  }

  faceDirection(direction: THREE.Vector3) {
    if (direction.lengthSq() < 1e-6) return;
    this.mesh.rotation.y = Math.atan2(direction.x, direction.z);
  }

  tryAttack(target: Unit, delta: number) {
    this.attackCooldown -= delta;
    if (this.attackCooldown > 0) return;
    this.attackCooldown = this.attackInterval;
    target.takeDamage(this.attackDamage);
  }

  takeDamage(amount: number) {
    this.hp = Math.max(0, this.hp - amount);
    if (this.hp === 0) this.setState("dead");
  }

  update(world: World, delta: number) {
    if (!this.isAlive()) return;
    this.behavior.update(this, world, delta);
  }

  dispose() {
    this.mesh.removeFromParent();
  }
}
