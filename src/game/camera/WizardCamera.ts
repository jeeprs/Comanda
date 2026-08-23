import * as THREE from "three";

const PAN_SPEED = 18;
const ROTATE_SPEED = 1.6;
const ZOOM_SPEED = 12;
const MIN_DISTANCE = 6;
const MAX_DISTANCE = 45;
const MIN_PITCH = THREE.MathUtils.degToRad(25);
const MAX_PITCH = THREE.MathUtils.degToRad(80);
const PAN_BOUNDS = 48;

/**
 * A controllable RTS-style camera: the player pans a ground-anchored pivot
 * with WASD, orbits it with Q/E, and zooms with the scroll wheel. The
 * camera itself always looks at the pivot from a spherical offset.
 */
export class WizardCamera {
  readonly camera: THREE.PerspectiveCamera;

  private readonly pivot = new THREE.Vector3(0, 0, 0);
  private distance = 22;
  private azimuth = Math.PI / 4;
  private pitch = THREE.MathUtils.degToRad(55);

  private readonly keys = new Set<string>();

  constructor(aspect: number) {
    this.camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 500);
    this.updateCameraPosition();

    window.addEventListener("keydown", (e) => this.keys.add(e.code));
    window.addEventListener("keyup", (e) => this.keys.delete(e.code));
    window.addEventListener(
      "wheel",
      (e) => {
        this.distance = THREE.MathUtils.clamp(
          this.distance + Math.sign(e.deltaY) * ZOOM_SPEED * 0.1 * this.distance * 0.2,
          MIN_DISTANCE,
          MAX_DISTANCE,
        );
      },
      { passive: true },
    );
  }

  resize(aspect: number) {
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
  }

  update(delta: number) {
    const forward = new THREE.Vector3(Math.sin(this.azimuth), 0, Math.cos(this.azimuth));
    const right = new THREE.Vector3(forward.z, 0, -forward.x);

    const pan = new THREE.Vector3();
    if (this.keys.has("KeyW") || this.keys.has("ArrowUp")) pan.add(forward);
    if (this.keys.has("KeyS") || this.keys.has("ArrowDown")) pan.sub(forward);
    if (this.keys.has("KeyD") || this.keys.has("ArrowRight")) pan.add(right);
    if (this.keys.has("KeyA") || this.keys.has("ArrowLeft")) pan.sub(right);

    if (pan.lengthSq() > 0) {
      pan.normalize().multiplyScalar(PAN_SPEED * delta);
      this.pivot.add(pan);
      this.pivot.x = THREE.MathUtils.clamp(this.pivot.x, -PAN_BOUNDS, PAN_BOUNDS);
      this.pivot.z = THREE.MathUtils.clamp(this.pivot.z, -PAN_BOUNDS, PAN_BOUNDS);
    }

    if (this.keys.has("KeyQ")) this.azimuth += ROTATE_SPEED * delta;
    if (this.keys.has("KeyE")) this.azimuth -= ROTATE_SPEED * delta;
    if (this.keys.has("KeyR")) this.pitch = THREE.MathUtils.clamp(this.pitch + ROTATE_SPEED * delta, MIN_PITCH, MAX_PITCH);
    if (this.keys.has("KeyF")) this.pitch = THREE.MathUtils.clamp(this.pitch - ROTATE_SPEED * delta, MIN_PITCH, MAX_PITCH);

    this.updateCameraPosition();
  }

  private updateCameraPosition() {
    const horizontal = Math.cos(this.pitch) * this.distance;
    const height = Math.sin(this.pitch) * this.distance;
    const offset = new THREE.Vector3(
      Math.sin(this.azimuth) * horizontal,
      height,
      Math.cos(this.azimuth) * horizontal,
    );
    this.camera.position.copy(this.pivot).add(offset);
    this.camera.lookAt(this.pivot);
  }
}
