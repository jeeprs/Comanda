import * as THREE from "three";
import type { Archetype } from "./Archetype";

const BODY_SIZE = 0.9;
const RING_INNER = 0.55;
const RING_OUTER = 0.75;

export interface UnitMeshParts {
  /** Unrotated root — attach camera-facing overlays (hp bars) here. */
  root: THREE.Group;
  /** Turned to face the unit's heading. */
  visual: THREE.Group;
}

/**
 * Placeholder unit visuals: one shared box for every archetype, tinted by
 * archetype color, over a team-colored ring so both readings stay legible.
 */
export function buildUnitMesh(archetype: Archetype, teamColor: number): UnitMeshParts {
  const root = new THREE.Group();
  const visual = new THREE.Group();
  root.add(visual);

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(BODY_SIZE, BODY_SIZE * 1.6, BODY_SIZE),
    new THREE.MeshStandardMaterial({ color: archetype.color }),
  );
  body.position.y = archetype.hoverHeight + BODY_SIZE * 0.8;
  body.castShadow = true;
  visual.add(body);

  // Always on the ground, even for fliers — it marks the unit's footprint.
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(RING_INNER, RING_OUTER, 24),
    new THREE.MeshBasicMaterial({ color: teamColor, side: THREE.DoubleSide }),
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.02;
  root.add(ring);

  return { root, visual };
}
