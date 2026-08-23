import "./style.css";
import { Game } from "./game/Game";

const app = document.querySelector<HTMLDivElement>("#app")!;

const viewport = document.createElement("div");
viewport.style.cssText = "position:absolute; inset:0;";
app.appendChild(viewport);

const hud = document.createElement("div");
hud.style.cssText = `
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 10px 14px;
  font: 13px/1.5 monospace;
  color: #e8e8e8;
  background: rgba(10, 10, 15, 0.55);
  border-radius: 6px;
  pointer-events: none;
  white-space: pre;
`;
app.appendChild(hud);

const game = new Game(viewport);
game.setOnTick((world) => {
  const controls = "WASD pan · Q/E rotate · R/F pitch · scroll zoom\n\n";
  const status = world.units
    .map((u) => `${u.id.padEnd(10)} [${u.team}] ${u.getState().padEnd(9)} hp ${u.hp}/${u.maxHp}`)
    .join("\n");
  hud.textContent = controls + status;
});
game.start();
