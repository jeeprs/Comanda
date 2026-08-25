import type { Game } from "../game/Game";
import type { SkillNode } from "../game/skills/SkillTree";

/**
 * Temporary debug UI for driving the skill tree. Deliberately plain — this is
 * scaffolding to exercise the system, not the real progression screen.
 */
export function mountDebugSkillPanel(parent: HTMLElement, game: Game): void {
  const panel = document.createElement("div");
  panel.style.cssText = `
    position: absolute;
    bottom: 12px;
    left: 12px;
    padding: 10px 12px;
    font: 12px/1.4 monospace;
    color: #e8e8e8;
    background: rgba(10, 10, 15, 0.8);
    border: 1px dashed #4a5568;
    border-radius: 6px;
    max-width: 320px;
  `;
  parent.appendChild(panel);

  const title = document.createElement("div");
  title.textContent = "DEBUG · Ground skill tree";
  title.style.cssText = "color:#8b98a8; margin-bottom:8px; letter-spacing:0.5px;";
  panel.appendChild(title);

  const buttons: { node: SkillNode; el: HTMLButtonElement }[] = [];
  const nodes = game.skillTree.getNodes();

  for (const tier of [1, 2, 3]) {
    const row = document.createElement("div");
    row.style.cssText = "display:flex; gap:6px; margin-bottom:6px; align-items:center;";

    const label = document.createElement("span");
    label.textContent = `T${tier}`;
    label.style.cssText = "color:#8b98a8; width:20px; flex:none;";
    row.appendChild(label);

    for (const node of nodes.filter((n) => n.tier === tier)) {
      const button = document.createElement("button");
      button.textContent = node.name;
      button.title = node.description;
      button.style.cssText = `
        flex: 1;
        padding: 5px 8px;
        font: 11px/1.2 monospace;
        border-radius: 4px;
        cursor: pointer;
      `;
      button.addEventListener("click", () => {
        game.unlockSkill(node.id);
        refresh();
      });
      row.appendChild(button);
      buttons.push({ node, el: button });
    }

    panel.appendChild(row);
  }

  const reset = document.createElement("button");
  reset.textContent = "Reset skills";
  reset.style.cssText = `
    margin-top: 4px;
    padding: 5px 8px;
    width: 100%;
    font: 11px/1.2 monospace;
    color: #e8e8e8;
    background: rgba(60, 30, 30, 0.9);
    border: 1px solid #7a4a4a;
    border-radius: 4px;
    cursor: pointer;
  `;
  reset.addEventListener("click", () => {
    game.resetSkills();
    refresh();
  });
  panel.appendChild(reset);

  function refresh() {
    for (const { node, el } of buttons) {
      const unlocked = game.skillTree.isUnlocked(node.id);
      const available = game.skillTree.canUnlock(node.id);
      el.disabled = !available;

      el.style.color = unlocked ? "#0d1117" : available ? "#e8e8e8" : "#5a6472";
      el.style.background = unlocked
        ? "#4caf50"
        : available
          ? "rgba(40,44,58,0.9)"
          : "rgba(24,26,32,0.9)";
      el.style.border = `1px solid ${unlocked ? "#4caf50" : available ? "#4a5568" : "#2c3038"}`;
      el.style.cursor = available ? "pointer" : "default";
    }
  }

  refresh();
}
