#!/bin/env node
const fs = require('fs')
const pathfs = require('path')
const commandExists = require('command-exists');
const PromiseB = require('bluebird')
const platform = require('os').platform()
const { notify } = require('./notify')

;(async () => {
  const [, , command, ...options] = process.argv
  const plugins = await loadPlugins()
  await PromiseB.map(plugins, async plugin => {
    if (plugin.command === command && await requirements(plugin)) {
      plugin.execute(options)
    }
  })
})()  

async function requirements(plugin) {
  const { platforms, commands } = plugin?.requirements || {}
  if(platforms) {
    if (!platforms.includes(platform)) {
      notify(plugin, `not works in ${platform}`)
      return false
    }
  }
  if (commands?.length) {
    const result = await PromiseB.map(commands, async command => {
      return commandExists(command)
        .then(() => true)
        .catch(() => {
          notify(plugin, `You must install ${command}`)
          return false
        })
    });
    if(result.some(r => !r)) {
      return false 
    }
  }
  return true
}

function loadPlugins() {
  const pluginsPath = pathfs.resolve(__dirname, 'plugins')
  const files = fs.readdirSync(pluginsPath)
  return files.map(file => {
    const pluginPath = pathfs.resolve(pluginsPath, file)
    if(pathfs.extname(pluginPath) !== '.js') return
    let plugin
    const mockPlugin = { name: pluginPath,}
    try { plugin = require(pluginPath) }
    catch (e) {}
    if (!plugin) notify(mockPlugin, `Cant parse`)
    else if (!plugin?.name) notify(mockPlugin, `Should have name field`)
    else if (!plugin?.execute) notify(plugin, `Should have execute field`)
    else if (!plugin?.command) notify(plugin, `Should have command field`)
    else {
      return plugin
    }
  }).filter(a => a)
}


