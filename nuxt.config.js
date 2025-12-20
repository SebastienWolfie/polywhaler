// https://v3.nuxtjs.org/api/configuration/nuxt.config
import { nodePolyfills } from 'vite-plugin-node-polyfills'


export default defineNuxtConfig({
  css: [
    "~/assets/css/tailwind.css",
    "~/Layouts/global.css"
  ],
  modules: ["@nuxtjs/tailwindcss", "nuxt-icon"],
  plugins: [{ src: "@/plugins/aos", ssr: false, mode: "client" }],
  nitro: {
    preset: 'vercel'
  },
  routeRules: {
    '/api/**': { cache: false } 
  },
  experimental: {
    renderJsonPayloads: false
  }
});
