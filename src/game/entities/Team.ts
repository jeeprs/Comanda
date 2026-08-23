export const Team = {
  Player: "player",
  Enemy: "enemy",
} as const;

export type Team = (typeof Team)[keyof typeof Team];
