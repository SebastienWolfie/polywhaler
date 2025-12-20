
import { updateAppConfig } from '#app/config'
import { defuFn } from 'defu'

const inlineConfig = {
  "nuxt": {
    "buildId": "e4d29fe8-f314-4f0f-b5a0-15ed09eb439a"
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
