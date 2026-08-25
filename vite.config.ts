import { defineConfig } from "vite";

export default defineConfig({
  server: {
    port: 5173,
    // Fail loudly if the port is taken instead of quietly serving on another
    // one — a second server on a stray port looks exactly like "my changes
    // aren't showing up".
    strictPort: true,
  },
});
