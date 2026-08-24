import * as THREE from "three";

const WIDTH = 1.0;
const HEIGHT = 0.14;
const BORDER = 0.02;

const HIGH = new THREE.Color(0x4caf50);
const MID = new THREE.Color(0xffc107);
const LOW = new THREE.Color(0xe53935);

/**
 * A floating hp bar drawn above a unit. Built from sprites so it always faces
 * the camera regardless of how the unit or the camera is turned.
 */
export class HealthBar {
  readonly group = new THREE.Group();

  private readonly fill: THREE.Sprite;
  private readonly fillMaterial: THREE.SpriteMaterial;

  constructor(height: number) {
    this.group.position.y = height;

    const background = new THREE.Sprite(
      new THREE.SpriteMaterial({ color: 0x11141a, depthTest: false, transparent: true }),
    );
    background.scale.set(WIDTH, HEIGHT, 1);
    background.renderOrder = 1;
    this.group.add(background);

    this.fillMaterial = new THREE.SpriteMaterial({ color: HIGH, depthTest: false, transparent: true });
    this.fill = new THREE.Sprite(this.fillMaterial);
    this.fill.renderOrder = 2;
    this.group.add(this.fill);

    this.setFraction(1);
  }

  /** @param fraction remaining hp, 0..1 */
  setFraction(fraction: number) {
    const clamped = THREE.MathUtils.clamp(fraction, 0, 1);
    const innerWidth = WIDTH - BORDER * 2;

    // Sprites scale about their center, so shift left as the bar shrinks to
    // keep it anchored to the left edge.
    this.fill.scale.set(innerWidth * clamped, HEIGHT - BORDER * 2, 1);
    this.fill.position.x = -(innerWidth * (1 - clamped)) / 2;

    this.fillMaterial.color.copy(
      clamped > 0.5
        ? MID.clone().lerp(HIGH, (clamped - 0.5) * 2)
        : LOW.clone().lerp(MID, clamped * 2),
    );
  }

  dispose() {
    this.group.traverse((object) => {
      if (object instanceof THREE.Sprite) object.material.dispose();
    });
    this.group.removeFromParent();
  }
}
