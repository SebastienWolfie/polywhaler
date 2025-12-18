
import { updateAppConfig } from '#app/config'
import { defuFn } from 'defu'

const inlineConfig = {
  "nuxt": {
    "buildId": "e610ef4c-80fb-44a6-9b0c-765ae9d89b77"
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
