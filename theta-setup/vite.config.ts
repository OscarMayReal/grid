import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"
import tailwindcss from "@tailwindcss/vite"
import { builtinModules } from 'module'


// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // optimizeDeps: {
  //   exclude: ['child_process', 'fs', 'os'],
  // },
  base: "./",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // build: {
  //   commonjsOptions: {
  //     transformMixedEsModules: true
  //   },
  //   rollupOptions: {
  //     external: builtinModules.filter(x => x !== 'child_process')
  //   }
  // }
})
