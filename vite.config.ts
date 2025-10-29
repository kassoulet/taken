import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables
  const env = loadEnv(mode, process.cwd(), "");

  // Set base path conditionally
  // Use /taken/ for GitHub Pages deployment, but fallback to root for local dev
  const isGitHubPages = env.VITE_GITHUB_PAGES === "true";
  const base = isGitHubPages ? "/taken/" : "/";

  return {
    base,
    plugins: [react()],
    server: {
      open: true,
    },
  };
});
