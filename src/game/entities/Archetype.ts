/** Where a unit exists — and therefore what can reach it. */
export type Domain = "ground" | "air";

export type ArchetypeId = "ground" | "aerial" | "hybrid";

/** The data definition of a troop type. Tune these numbers, not the code. */
export interface Archetype {
  id: ArchetypeId;
  name: string;
  /** What this unit *is*. */
  domain: Domain;
  /** Domains this unit can *attack*. */
  canTarget: Domain[];
  color: number;
  /** Resting height off the ground; non-zero makes a unit visibly airborne. */
  hoverHeight: number;
  maxHp: number;
  moveSpeed: number;
  attackDamage: number;
  attackRange: number;
  /** Seconds between attacks. */
  attackInterval: number;
}

export const ARCHETYPES: Readonly<Record<ArchetypeId, Archetype>> = {
  ground: {
    id: "ground",
    name: "Ground",
    domain: "ground",
    canTarget: ["ground"],
    color: 0x8b5a2b,
    hoverHeight: 0,
    maxHp: 160,
    moveSpeed: 2.2,
    attackDamage: 18,
    attackRange: 1.6,
    attackInterval: 1.0,
  },
  aerial: {
    id: "aerial",
    name: "Aerial",
    domain: "air",
    canTarget: ["ground", "air"],
    color: 0x3b82f6,
    hoverHeight: 2.2,
    maxHp: 70,
    moveSpeed: 4.5,
    attackDamage: 10,
    attackRange: 6.0,
    attackInterval: 0.7,
  },
  hybrid: {
    id: "hybrid",
    name: "Hybrid",
    domain: "ground",
    canTarget: ["ground", "air"],
    color: 0x9333ea,
    hoverHeight: 0,
    maxHp: 110,
    moveSpeed: 3.0,
    attackDamage: 13,
    attackRange: 3.0,
    attackInterval: 0.85,
  },
};

export const ARCHETYPE_ORDER: ArchetypeId[] = ["ground", "aerial", "hybrid"];

/** True when `attacker` is allowed to attack something in `domain`. */
export function canTarget(attacker: Archetype, domain: Domain): boolean {
  return attacker.canTarget.includes(domain);
}
