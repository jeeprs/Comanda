import * as THREE from "three";
import { createGround } from "./world/Ground";
import { World } from "./world/World";
import { WizardCamera } from "./camera/WizardCamera";
import { Unit } from "./entities/Unit";
import { Team } from "./entities/Team";
import { SeekAndAttackBehavior } from "./behaviors/SeekAndAttackBehavior";

export class Game {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly clock = new THREE.Clock();
  private readonly wizardCamera: WizardCamera;
  private readonly world = new World();

  private readonly container: HTMLElement;
  private onTick?: (world: World) => void;

  constructor(container: HTMLElement) {
    this.container = container;
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    container.appendChild(this.renderer.domElement);

    this.wizardCamera = new WizardCamera(container.clientWidth / container.clientHeight);

    this.setupScene();
    this.spawnDemoUnits();

    window.addEventListener("resize", () => this.handleResize());
    this.handleResize();
  }

  /** Lets the UI layer observe per-frame world state (e.g. for a HUD). */
  setOnTick(callback: (world: World) => void) {
    this.onTick = callback;
  }

  private setupScene() {
    this.scene.background = new THREE.Color(0x1b1e2a);
    this.scene.fog = new THREE.Fog(0x1b1e2a, 30, 90);

    this.scene.add(createGround());

    const hemi = new THREE.HemisphereLight(0x8899bb, 0x223322, 0.6);
    this.scene.add(hemi);

    const sun = new THREE.DirectionalLight(0xfff2d9, 1.2);
    sun.position.set(15, 25, 10);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -30;
    sun.shadow.camera.right = 30;
    sun.shadow.camera.top = 30;
    sun.shadow.camera.bottom = -30;
    this.scene.add(sun);
  }

  private spawnDemoUnits() {
    const familiar = new Unit({
      id: "familiar-1",
      team: Team.Player,
      color: 0x4fd1c5,
      position: new THREE.Vector3(-10, 0, 0),
      behavior: new SeekAndAttackBehavior(),
    });

    const enemy = new Unit({
      id: "enemy-1",
      team: Team.Enemy,
      color: 0xe05353,
      position: new THREE.Vector3(10, 0, 0),
      behavior: new SeekAndAttackBehavior(),
    });

    for (const unit of [familiar, enemy]) {
      this.world.add(unit);
      this.scene.add(unit.mesh);
    }
  }

  /** Clears the battlefield and respawns the starting units. */
  restart() {
    this.world.clear();
    this.spawnDemoUnits();
  }

  private handleResize() {
    const { clientWidth, clientHeight } = this.container;
    this.renderer.setSize(clientWidth, clientHeight);
    this.wizardCamera.resize(clientWidth / clientHeight);
  }

  start() {
    this.renderer.setAnimationLoop(() => this.tick());
  }

  private tick() {
    const delta = Math.min(this.clock.getDelta(), 0.1);

    this.wizardCamera.update(delta);
    for (const unit of this.world.units) {
      unit.update(this.world, delta);
    }
    this.world.removeDead();

    this.onTick?.(this.world);
    this.renderer.render(this.scene, this.wizardCamera.camera);
  }
}
