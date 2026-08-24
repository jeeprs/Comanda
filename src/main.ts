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

const restartButton = document.createElement("button");
restartButton.textContent = "Restart";
restartButton.style.cssText = `
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 8px 18px;
  font: 13px/1 monospace;
  color: #e8e8e8;
  background: rgba(10, 10, 15, 0.75);
  border: 1px solid #4a5568;
  border-radius: 6px;
  cursor: pointer;
`;
restartButton.addEventListener("mouseenter", () => {
  restartButton.style.background = "rgba(40, 44, 58, 0.9)";
});
restartButton.addEventListener("mouseleave", () => {
  restartButton.style.background = "rgba(10, 10, 15, 0.75)";
});
app.appendChild(restartButton);

const game = new Game(viewport);
restartButton.addEventListener("click", () => {
  game.restart();
  restartButton.blur(); // otherwise Space/Enter would re-trigger it
});
game.setOnTick((world) => {
  const controls = "WASD pan · Q/E rotate · R/F pitch · scroll zoom\n\n";
  const status = world.units
    .map((u) => `${u.id.padEnd(10)} [${u.team}] ${u.getState().padEnd(9)} hp ${u.hp}/${u.maxHp}`)
    .join("\n");
  hud.textContent = controls + status;
});
game.start();
