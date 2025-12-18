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
    preset: 'vercel',
    vercel: {
      functions: {
        // This bundles all your server routes into one single function
        includeFiles: 'server/**',
      },
      config: {
        // This ensures all routes are handled by one function
        functions: {
          "maxDuration": 10
        }
      }
    },
    // This is the key setting to bypass the 12-function limit:
    output: {
      serverDir: '.output/server'
    }
  },
  // Ensure you aren't over-splitting
  routeRules: {
    '/api/**': { isr: false } // Ensures API isn't split into static/lambda hybrids
  },
  vite: {
    plugins: [
      nodePolyfills({
        // Include buffer and process
        include: ['buffer', 'process'],
        
        // This is the most crucial part: forces the globals
        globals: {
          Buffer: true,
          global: true,
          process: true,
        },
        
        protocolImports: true,
      }),
    ],
    // 4. Also force optimization for the Solana libraries if needed (optional, but helpful)
    optimizeDeps: {
        include: ['@solana/web3.js', '@solana/spl-token'],
    }
  }
});
