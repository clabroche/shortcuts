#!/bin/env node

const path = require("path");
const pluginsManager = require("@iryu54/plugins-manager")

;(async () => {
  const [, , command, ...options] = process.argv
  await pluginsManager.loadPlugins([
    path.resolve(__dirname, 'plugins')
  ])
  await pluginsManager.launch(command, options)

})().catch(console.error)
