// https://v3.nuxtjs.org/api/configuration/nuxt.config


export default defineNuxtConfig({
  css: [
    "~/assets/css/tailwind.css",
    "~/Layouts/global.css"
  ],
  modules: ["@nuxtjs/tailwindcss", "nuxt-icon"],
  plugins: [{ src: "@/plugins/aos", ssr: false, mode: "client" }],
  experimental: {
    renderJsonPayloads: false
  }
});
