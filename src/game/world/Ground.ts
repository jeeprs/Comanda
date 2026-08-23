import * as THREE from "three";

const GROUND_SIZE = 100;

export function createGround(): THREE.Group {
  const group = new THREE.Group();
  group.name = "Ground";

  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(GROUND_SIZE, GROUND_SIZE),
    new THREE.MeshStandardMaterial({ color: 0x2c3a2e, roughness: 1 }),
  );
  plane.rotation.x = -Math.PI / 2;
  plane.receiveShadow = true;
  group.add(plane);

  const grid = new THREE.GridHelper(GROUND_SIZE, GROUND_SIZE / 2, 0x445544, 0x333c33);
  group.add(grid);

  return group;
}
