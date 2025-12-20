
import { updateAppConfig } from '#app/config'
import { defuFn } from 'defu'

const inlineConfig = {
  "nuxt": {
    "buildId": "aa885b42-afc0-4eb5-bc2a-4bc36acdc5b4"
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
