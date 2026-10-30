import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { createPreviewPlugin } from "./server/preview-service.mjs";
import { createApplicationPlugin } from "./server/application-plugin.mjs";

export default defineConfig({
  build: {
    outDir: "dist/client",
  },
  optimizeDeps: {
    entries: ["src/main.jsx"],
    noDiscovery: true,
    include: ["react", "react-dom/client", "react/jsx-runtime", "lucide-react", "highlight.js/lib/core", "highlight.js/lib/languages/typescript", "highlight.js/lib/languages/css", "highlight.js/lib/languages/json", "fflate"],
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: ["terminal.local"],
    fs: { deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "**/var/**", "**/*.sqlite*", "**/research/**"] },
    watch: { ignored: ["**/public/previews/**", "**/public/assets/thumbnails/**", "**/public/code/**", "**/var/**", "**/.preview-sources/**", "**/.preview-cache/**", "**/dist/**"] },
    warmup: {
      clientFiles: ["./src/main.jsx"],
    },
  },
  plugins: [createApplicationPlugin(), createPreviewPlugin(), react()],
});
