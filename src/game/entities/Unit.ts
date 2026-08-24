import * as THREE from "three";
import { Team } from "./Team";
import { buildUnitMesh } from "./UnitMesh";
import { HealthBar } from "./HealthBar";
import type { Archetype, Domain } from "./Archetype";
import type { Behavior } from "../behaviors/Behavior";
import type { World } from "../world/World";

export type UnitState = "idle" | "moving" | "attacking" | "dead";

export interface UnitConfig {
  id: string;
  team: Team;
  teamColor: number;
  archetype: Archetype;
  position: THREE.Vector3;
  behavior: Behavior;
}

export class Unit {
  readonly id: string;
  readonly team: Team;
  readonly archetype: Archetype;
  readonly mesh: THREE.Group;
  readonly behavior: Behavior;

  private readonly visual: THREE.Group;
  private readonly healthBar: HealthBar;

  hp: number;

  private state: UnitState = "idle";
  private attackCooldown = 0;

  constructor(config: UnitConfig) {
    this.id = config.id;
    this.team = config.team;
    this.archetype = config.archetype;
    this.behavior = config.behavior;
    this.hp = config.archetype.maxHp;

    const { root, visual } = buildUnitMesh(config.archetype, config.teamColor);
    this.mesh = root;
    this.visual = visual;
    this.mesh.position.copy(config.position);

    this.healthBar = new HealthBar(config.archetype.hoverHeight + 2.4);
    this.mesh.add(this.healthBar.group);
  }

  get maxHp(): number {
    return this.archetype.maxHp;
  }

  get moveSpeed(): number {
    return this.archetype.moveSpeed;
  }

  get attackDamage(): number {
    return this.archetype.attackDamage;
  }

  get attackRange(): number {
    return this.archetype.attackRange;
  }

  get attackInterval(): number {
    return this.archetype.attackInterval;
  }

  /** What this unit is, for targeting checks. */
  get domain(): Domain {
    return this.archetype.domain;
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
    this.visual.rotation.y = Math.atan2(direction.x, direction.z);
  }

  tryAttack(target: Unit, delta: number) {
    this.attackCooldown -= delta;
    if (this.attackCooldown > 0) return;
    this.attackCooldown = this.attackInterval;
    target.takeDamage(this.attackDamage);
  }

  takeDamage(amount: number) {
    this.hp = Math.max(0, this.hp - amount);
    this.healthBar.setFraction(this.hp / this.maxHp);
    if (this.hp === 0) this.setState("dead");
  }

  update(world: World, delta: number) {
    if (!this.isAlive()) return;
    this.behavior.update(this, world, delta);
  }

  dispose() {
    this.healthBar.dispose();
    this.mesh.removeFromParent();
  }
}
