import * as THREE from "three";

const DURATION = 0.45;

interface ActiveRing {
  mesh: THREE.Mesh;
  material: THREE.MeshBasicMaterial;
  radius: number;
  age: number;
}

/** Expanding, fading ground rings — the visible tell for a Seismic Slam. */
export class SlamEffects {
  private readonly rings: ActiveRing[] = [];

  private readonly scene: THREE.Scene;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  spawn(position: THREE.Vector3, radius: number) {
    const material = new THREE.MeshBasicMaterial({
      color: 0xffb347,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(new THREE.RingGeometry(0.85, 1, 32), material);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(position.x, 0.05, position.z);
    this.scene.add(mesh);
    this.rings.push({ mesh, material, radius, age: 0 });
  }

  update(delta: number) {
    for (let i = this.rings.length - 1; i >= 0; i--) {
      const ring = this.rings[i];
      ring.age += delta;
      const t = ring.age / DURATION;

      if (t >= 1) {
        ring.mesh.removeFromParent();
        ring.mesh.geometry.dispose();
        ring.material.dispose();
        this.rings.splice(i, 1);
        continue;
      }

      ring.mesh.scale.setScalar(ring.radius * t);
      ring.material.opacity = 1 - t;
    }
  }

  clear() {
    for (const ring of this.rings) {
      ring.mesh.removeFromParent();
      ring.mesh.geometry.dispose();
      ring.material.dispose();
    }
    this.rings.length = 0;
  }
}
