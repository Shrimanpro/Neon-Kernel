import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from "path"
import fs from "fs"

const GAME_DIR = path.resolve(__dirname, "game/web")

// Serves the Godot web export at /web/ in dev and copies it to dist/web on build.
function godotGame() {
  return {
    name: "godot-game",
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        if (req.url === "/web" || req.url === "/web/") req.url = "/game/web/index.html"
        else if (req.url.startsWith("/web/")) req.url = "/game" + req.url
        next()
      })
    },
    closeBundle() {
      fs.cpSync(GAME_DIR, path.resolve(__dirname, "dist/web"), {
        recursive: true,
        filter: (src) => !src.endsWith(".import"),
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
            tailwindcss(),
            godotGame()],
  base: "./",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
})
