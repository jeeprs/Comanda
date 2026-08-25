import * as THREE from "three";
import { Team } from "./Team";
import { buildUnitMesh } from "./UnitMesh";
import { HealthBar } from "./HealthBar";
import type { Archetype, Domain } from "./Archetype";
import {
  SLAM_COOLDOWN,
  SLAM_DAMAGE,
  SLAM_RADIUS,
  type SkillTreeState,
} from "../skills/SkillTree";
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
  /** Progression applied to this unit; pass EMPTY_TREE for none. */
  skills: SkillTreeState;
  /** Called when a slam lands, so the scene can show it. */
  onSlam?: (position: THREE.Vector3, radius: number) => void;
}

export class Unit {
  readonly id: string;
  readonly team: Team;
  readonly archetype: Archetype;
  readonly mesh: THREE.Group;
  readonly behavior: Behavior;
  readonly skills: SkillTreeState;

  private readonly visual: THREE.Group;
  private readonly healthBar: HealthBar;
  private readonly onSlam?: (position: THREE.Vector3, radius: number) => void;

  hp: number;

  private state: UnitState = "idle";
  private attackCooldown = 0;
  private slamCooldown = SLAM_COOLDOWN;

  constructor(config: UnitConfig) {
    this.id = config.id;
    this.team = config.team;
    this.archetype = config.archetype;
    this.behavior = config.behavior;
    this.skills = config.skills;
    this.onSlam = config.onSlam;
    this.hp = config.skills.statsFor(config.archetype).maxHp;

    const { root, visual } = buildUnitMesh(config.archetype, config.teamColor);
    this.mesh = root;
    this.visual = visual;
    this.mesh.position.copy(config.position);

    this.healthBar = new HealthBar(config.archetype.hoverHeight + 2.4);
    this.mesh.add(this.healthBar.group);
  }

  /** Archetype baseline with unlocked skill modifiers folded in. */
  get stats() {
    return this.skills.statsFor(this.archetype);
  }

  get maxHp(): number {
    return this.stats.maxHp;
  }

  get moveSpeed(): number {
    return this.stats.moveSpeed;
  }

  get attackDamage(): number {
    return this.stats.attackDamage;
  }

  get attackRange(): number {
    return this.stats.attackRange;
  }

  get attackInterval(): number {
    return this.stats.attackInterval;
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
    const reduced = amount * (1 - this.skills.damageReduction);
    this.hp = Math.max(0, this.hp - reduced);
    this.refreshHealthBar();
    if (this.hp === 0) this.setState("dead");
  }

  /** Redraw the bar after hp or max hp changed outside of taking damage. */
  refreshHealthBar() {
    this.healthBar.setFraction(this.hp / this.maxHp);
  }

  update(world: World, delta: number) {
    if (!this.isAlive()) return;
    this.updateAbilities(world, delta);
    this.behavior.update(this, world, delta);
  }

  /** Fires Seismic Slam when it's off cooldown and something is in reach. */
  private updateAbilities(world: World, delta: number) {
    if (!this.skills.hasAbility("slam")) return;

    this.slamCooldown -= delta;
    if (this.slamCooldown > 0) return;

    const targets = world.enemiesWithin(this, SLAM_RADIUS);
    if (targets.length === 0) return;

    this.slamCooldown = SLAM_COOLDOWN;
    for (const target of targets) {
      target.takeDamage(SLAM_DAMAGE);
    }
    this.onSlam?.(this.position, SLAM_RADIUS);
  }

  dispose() {
    this.healthBar.dispose();
    this.mesh.removeFromParent();
  }
}
