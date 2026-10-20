import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",

      manifest: {
        name: "Poèmes islamiques",
        short_name: "Poèmes",
        description: "Un lecteur audio de poèmes islamiques.",
        lang: "fr",
        start_url: "/",
        scope: "/",
        display: "standalone",
        theme_color: "#212121",
        background_color: "#212121",

        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },

      workbox: {
        globPatterns: [
          "**/*.{js,css,html,ico,png,svg,webmanifest}",
          "audio/*.mp3",
          "images/christien.jpg",
          "images/markus-spiske-zJDqiEGUCHY-unsplash.jpg",
          "images/voie.jpg",
          "images/guillaume-de-germ.jpg",
          "images/لا إله إلا الله1.jpeg",
          "images/sunset-desert-with-muslim-mosque-foreground.jpg",
        ],

        maximumFileSizeToCacheInBytes: 15 * 1024 * 1024,
      },
    }),
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
