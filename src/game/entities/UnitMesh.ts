import * as THREE from "three";

export interface UnitMeshParts {
  /** Unrotated root — attach camera-facing overlays (hp bars) here. */
  root: THREE.Group;
  /** Turned to face the unit's heading. */
  visual: THREE.Group;
}

/** A simple robed-figure-with-a-hat placeholder mesh, tinted by team color. */
export function buildUnitMesh(color: number): UnitMeshParts {
  const root = new THREE.Group();
  const visual = new THREE.Group();
  root.add(visual);

  const body = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.4, 0.9, 4, 8),
    new THREE.MeshStandardMaterial({ color }),
  );
  body.position.y = 0.85;
  body.castShadow = true;
  visual.add(body);

  const hat = new THREE.Mesh(
    new THREE.ConeGeometry(0.35, 0.7, 8),
    new THREE.MeshStandardMaterial({ color: 0x1a1a1a }),
  );
  hat.position.y = 1.85;
  hat.castShadow = true;
  visual.add(hat);

  return { root, visual };
}
