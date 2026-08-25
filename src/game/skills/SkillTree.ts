import type { Archetype } from "../entities/Archetype";

/** Abilities a tier-3 node can grant. */
export type Ability = "slam" | "shield";

/** Archetype stats a node can shift, as additive deltas. */
export type StatModifiers = Partial<{
  maxHp: number;
  moveSpeed: number;
  attackDamage: number;
  attackRange: number;
  attackInterval: number;
}>;

export interface SkillNode {
  id: string;
  tier: 1 | 2 | 3;
  name: string;
  description: string;
  modifiers?: StatModifiers;
  grants?: Ability;
}

/** Stats a unit actually fights with, after unlocked nodes are applied. */
export interface EffectiveStats {
  maxHp: number;
  moveSpeed: number;
  attackDamage: number;
  attackRange: number;
  attackInterval: number;
}

export const SLAM_DAMAGE = 25;
export const SLAM_RADIUS = 3.5;
export const SLAM_COOLDOWN = 4;
export const SHIELD_REDUCTION = 0.35;

/** The Ground troop tree. Tier 1 is the trunk; tiers 2 and 3 are either/or. */
export const GROUND_TREE: SkillNode[] = [
  {
    id: "conscript-training",
    tier: 1,
    name: "Conscript Training",
    description: "Baseline drilling. Unlocked from the start.",
  },
  {
    id: "ironhide",
    tier: 2,
    name: "Ironhide",
    description: "+60 max HP",
    modifiers: { maxHp: 60 },
  },
  {
    id: "honed-edge",
    tier: 2,
    name: "Honed Edge",
    description: "+8 attack damage",
    modifiers: { attackDamage: 8 },
  },
  {
    id: "seismic-slam",
    tier: 3,
    name: "Seismic Slam",
    description: `${SLAM_DAMAGE} damage to all enemies within ${SLAM_RADIUS}, every ${SLAM_COOLDOWN}s`,
    grants: "slam",
  },
  {
    id: "aegis-plating",
    tier: 3,
    name: "Aegis Plating",
    description: `${Math.round(SHIELD_REDUCTION * 100)}% incoming damage reduction`,
    grants: "shield",
  },
];

const ROOT_NODE_ID = "conscript-training";

/**
 * Which nodes an army has unlocked, and the stats that result.
 *
 * One pick per tier, and a tier is only reachable once the tier below it has
 * a pick. Derived stats are cached per archetype and dropped on any change.
 */
export class SkillTreeState {
  private readonly unlocked = new Set<string>([ROOT_NODE_ID]);
  private statCache = new Map<string, EffectiveStats>();

  private readonly nodes: SkillNode[];

  constructor(nodes: SkillNode[] = GROUND_TREE) {
    this.nodes = nodes;
  }

  getNodes(): SkillNode[] {
    return this.nodes;
  }

  isUnlocked(id: string): boolean {
    return this.unlocked.has(id);
  }

  /** The node picked at this tier, if any. */
  pickAtTier(tier: number): SkillNode | undefined {
    return this.nodes.find((n) => n.tier === tier && this.unlocked.has(n.id));
  }

  /** A node is available when its tier is open and nothing else is picked there. */
  canUnlock(id: string): boolean {
    const node = this.nodes.find((n) => n.id === id);
    if (!node || this.unlocked.has(node.id)) return false;
    if (this.pickAtTier(node.tier)) return false;
    return node.tier === 1 || this.pickAtTier(node.tier - 1) !== undefined;
  }

  unlock(id: string): boolean {
    if (!this.canUnlock(id)) return false;
    this.unlocked.add(id);
    this.statCache.clear();
    return true;
  }

  reset() {
    this.unlocked.clear();
    this.unlocked.add(ROOT_NODE_ID);
    this.statCache.clear();
  }

  private unlockedNodes(): SkillNode[] {
    return this.nodes.filter((n) => this.unlocked.has(n.id));
  }

  hasAbility(ability: Ability): boolean {
    return this.unlockedNodes().some((n) => n.grants === ability);
  }

  get damageReduction(): number {
    return this.hasAbility("shield") ? SHIELD_REDUCTION : 0;
  }

  /** Base archetype stats plus every unlocked modifier. */
  statsFor(archetype: Archetype): EffectiveStats {
    const cached = this.statCache.get(archetype.id);
    if (cached) return cached;

    const stats: EffectiveStats = {
      maxHp: archetype.maxHp,
      moveSpeed: archetype.moveSpeed,
      attackDamage: archetype.attackDamage,
      attackRange: archetype.attackRange,
      attackInterval: archetype.attackInterval,
    };

    // Only the Ground tree exists so far; once other trees are added this
    // should check that the node belongs to this archetype's tree.
    for (const node of this.unlockedNodes()) {
      if (!node.modifiers) continue;
      for (const [key, delta] of Object.entries(node.modifiers)) {
        stats[key as keyof EffectiveStats] += delta as number;
      }
    }

    this.statCache.set(archetype.id, stats);
    return stats;
  }
}

/** Shared do-nothing tree for units that get no progression (enemies). */
export const EMPTY_TREE = new SkillTreeState();
