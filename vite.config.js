import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  AUDIO_EDITIONS,
  TEXT_EDITIONS,
  escapeRegExp,
  getAudioCacheName,
} from "./src/lib/quranEditions.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const translationKeyPattern = [
  ...new Set(
    [...AUDIO_EDITIONS, ...TEXT_EDITIONS]
      .filter((edition) => edition.textSource !== "alquran")
      .map((edition) => edition.translationKey)
      .filter(Boolean),
  ),
]
  .map(escapeRegExp)
  .join("|");

const surahDataPattern = new RegExp(
  `^https://quranenc\\.com/api/v1/(?:translation/sura/(?:${translationKeyPattern})/\\d+|translations/updates\\?key=(?:${translationKeyPattern}))$`,
);

const audioRoutes = AUDIO_EDITIONS.map((edition) => {
  const urlPattern =
    edition.audioSource === "alquran"
      ? new RegExp(
          `^https://cdn\\.islamic\\.network/quran/audio/${edition.bitrate}/${escapeRegExp(edition.id)}/\\d+\\.mp3$`,
        )
      : new RegExp(
          `^https://d\\.quranenc\\.com/data/audio/${escapeRegExp(edition.translationKey)}/\\d{3}\\d{3}\\.mp3$`,
        );

  return {
    urlPattern,
    handler: "CacheFirst",
    options: {
      cacheName: getAudioCacheName(edition.id),
      // Media elements issue opaque `Range` requests. `statuses: []` blocks
      // Workbox from caching any fetched response, while cache hits are still
      // served: the app stores complete files itself, so no partial response can
      // poison offline playback.
      cacheableResponse: { statuses: [] },
      expiration: {
        maxEntries: 1600,
        maxAgeSeconds: 60 * 60 * 24 * 180,
      },
    },
  };
});

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",

      manifest: {
        id: "/",
        name: "Quran - MP3",
        short_name: "Quran MP3",
        description: "Écoutez la récitation du Noble Coran verset par verset.",
        lang: "fr",
        start_url: "/",
        scope: "/",
        display: "standalone",
        display_override: ["standalone", "minimal-ui"],
        theme_color: "#ffffff",
        background_color: "#ffffff",
        categories: ["education", "lifestyle"],

        shortcuts: [
          {
            name: "Ouvrir le lecteur",
            short_name: "Lecteur",
            description: "Reprendre l’écoute du Noble Coran",
            url: "/#/lecteur",
            icons: [
              {
                src: "/192x192.png",
                sizes: "192x192",
                type: "image/png",
              },
            ],
          },
        ],

        icons: [
          {
            src: "/192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },

      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        globPatterns: [
          "**/*.{js,css,html,ico,png,svg,webmanifest,woff2}",
        ],

        maximumFileSizeToCacheInBytes: 50 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: surahDataPattern,
            handler: "NetworkFirst",
            options: {
              cacheName: "quran-surah-data-v3",
              networkTimeoutSeconds: 3,
              cacheableResponse: { statuses: [0, 200] },
              expiration: {
                maxEntries: 115,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
            },
          },
          ...audioRoutes,
        ],
      },
    }),
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
