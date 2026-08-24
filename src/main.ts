import "./style.css";
import { Game } from "./game/Game";
import { Team } from "./game/entities/Team";
import { ARCHETYPES, ARCHETYPE_ORDER } from "./game/entities/Archetype";

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
const MAX_LISTED = 10;

game.setOnTick((world) => {
  const selected = game.getSelectedArchetype();

  const controls =
    "WASD pan · Q/E rotate · R/F pitch · scroll zoom\n" +
    "left-click: spawn familiar · right-click: spawn enemy\n\n";

  const picker =
    ARCHETYPE_ORDER.map((id, i) => {
      const a = ARCHETYPES[id];
      return `${a.id === selected.id ? "▸" : " "}${i + 1} ${a.name}`;
    }).join("  ") +
    `\n   hp ${selected.maxHp} · spd ${selected.moveSpeed} · dmg ${selected.attackDamage}` +
    ` · rng ${selected.attackRange} · hits ${selected.canTarget.join("+")}\n\n`;

  const counts = `familiars ${world.unitsOfTeam(Team.Player).length}  ·  enemies ${
    world.unitsOfTeam(Team.Enemy).length
  }\n\n`;

  const listed = world.units
    .slice(0, MAX_LISTED)
    .map(
      (u) =>
        `${u.id.padEnd(11)} ${u.archetype.name.padEnd(7)} ${u.getState().padEnd(9)} hp ${u.hp}/${u.maxHp}`,
    )
    .join("\n");

  const overflow = world.units.length > MAX_LISTED ? `\n… +${world.units.length - MAX_LISTED} more` : "";

  hud.textContent = controls + picker + counts + listed + overflow;
});
game.start();
