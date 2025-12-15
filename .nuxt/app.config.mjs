
import { updateAppConfig } from '#app/config'
import { defuFn } from 'defu'

const inlineConfig = {
  "nuxt": {
    "buildId": "e6841a67-4644-4df8-8738-fb66b07e0c00"
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
