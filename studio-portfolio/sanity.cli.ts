import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'dwxmoldx',
    dataset: 'production'
  },
  deployment: {
    appId: 'a7v3bf9rmq6yjq36rrqx2kcv',
    autoUpdates: true,
  }
})
