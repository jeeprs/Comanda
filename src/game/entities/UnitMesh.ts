import * as THREE from "three";

/** A simple robed-figure-with-a-hat placeholder mesh, tinted by team color. */
export function buildUnitMesh(color: number): THREE.Group {
  const group = new THREE.Group();

  const body = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.4, 0.9, 4, 8),
    new THREE.MeshStandardMaterial({ color }),
  );
  body.position.y = 0.85;
  body.castShadow = true;
  group.add(body);

  const hat = new THREE.Mesh(
    new THREE.ConeGeometry(0.35, 0.7, 8),
    new THREE.MeshStandardMaterial({ color: 0x1a1a1a }),
  );
  hat.position.y = 1.85;
  hat.castShadow = true;
  group.add(hat);

  return group;
}
