
import { updateAppConfig } from '#app/config'
import { defuFn } from 'defu'

const inlineConfig = {
  "nuxt": {
    "buildId": "2e2a3d87-4528-42cf-9e3e-3a7108c579ea"
  }
}

// Vite - webpack is handled directly in #app/config
if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    updateAppConfig(newModule.default)
  })
}

import cfg0 from "/Users/icon/ico/polywhaler/app.config.ts"

export default /*@__PURE__*/ defuFn(cfg0, inlineConfig)
