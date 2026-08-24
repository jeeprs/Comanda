import * as THREE from "three";
import { createGround } from "./world/Ground";
import { World } from "./world/World";
import { WizardCamera } from "./camera/WizardCamera";
import { Unit } from "./entities/Unit";
import { Team } from "./entities/Team";
import { SeekAndAttackBehavior } from "./behaviors/SeekAndAttackBehavior";

const TEAM_COLOR: Record<Team, number> = {
  [Team.Player]: 0x4fd1c5,
  [Team.Enemy]: 0xe05353,
};

/** Half-extent of the walkable ground, so spawns stay on the plane. */
const SPAWN_BOUNDS = 48;

export class Game {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly clock = new THREE.Clock();
  private readonly wizardCamera: WizardCamera;
  private readonly world = new World();

  private readonly raycaster = new THREE.Raycaster();
  private readonly groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  private nextUnitId = 0;

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
    this.renderer.domElement.addEventListener("click", (e) => this.handleClick(e, Team.Player));
    this.renderer.domElement.addEventListener("contextmenu", (e) => {
      e.preventDefault(); // suppress the browser menu so right-click is ours
      this.handleClick(e, Team.Enemy);
    });
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

  /** Creates a unit of the given team and puts it on the battlefield. */
  spawnUnit(team: Team, position: THREE.Vector3): Unit {
    const label = team === Team.Player ? "familiar" : "enemy";
    const unit = new Unit({
      id: `${label}-${++this.nextUnitId}`,
      team,
      color: TEAM_COLOR[team],
      position,
      behavior: new SeekAndAttackBehavior(),
    });
    this.world.add(unit);
    this.scene.add(unit.mesh);
    return unit;
  }

  private spawnDemoUnits() {
    this.spawnUnit(Team.Player, new THREE.Vector3(-10, 0, 0));
    this.spawnUnit(Team.Enemy, new THREE.Vector3(10, 0, 0));
  }

  /** Spawns a unit of the given team wherever the player clicked on the ground. */
  private handleClick(event: MouseEvent, team: Team) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    const pointer = new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1,
    );

    this.raycaster.setFromCamera(pointer, this.wizardCamera.camera);

    const point = new THREE.Vector3();
    // Misses only when looking exactly along the horizon.
    if (!this.raycaster.ray.intersectPlane(this.groundPlane, point)) return;
    if (Math.abs(point.x) > SPAWN_BOUNDS || Math.abs(point.z) > SPAWN_BOUNDS) return;

    this.spawnUnit(team, point);
  }

  /** Clears the battlefield and respawns the starting units. */
  restart() {
    this.world.clear();
    this.nextUnitId = 0;
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
