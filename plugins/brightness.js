const { execSync } = require('child_process')
const { notify } = require('@iryu54/plugins-manager')
const pathfs = require('path')
const step = 0.1
const icon = pathfs.resolve(__dirname, 'bulb.png')

module.exports = {
  name: 'Brightness',
  command: 'brightness',
  requirements: {
    platforms: [
      'linux'
    ],
    commands: [
      'notify-send',
      'xrandr',
      'grep',
    ]
  },
  execute(options) {
    const amount = {
      increase: step,
      decrease: step * -1
    }
    setBrightnessForDevices(amount[options[0]])
  },
}

function getDevices() {
  return execSync('xrandr | grep " connected" | cut -f1 -d " "')
    .toString().split('\n')
    .filter(a => a)
}

function setBrightnessForDevices(amount) {
  const devices = getDevices()
  const [nextLevel] = devices.map(device => setBrightnessForDevice(device, amount))
  notify(module.exports, `${nextLevel * 100}%`, { timeout: 1, icon})
}

function setBrightnessForDevice(device, amount) {
  if (!device) throw Error('Device parameter is required ')
  const brightness = getBrightness(device)
  let nextLevel = brightness + amount
  if (nextLevel > 1) nextLevel = 1
  if (nextLevel < 0) nextLevel = 0
  execSync(`xrandr --output ${device} --brightness ${nextLevel}`)
  return nextLevel
}

function getBrightness(device) {
  const brightness = +execSync(`xrandr --verbose --current | grep ^"${device}" -A5 | grep "Brightness"`)
    .toString()
    .trim()
    .split('Brightness:')
  [1]
    .trim()
  if (Number.isNaN(brightness)) throw Error('Can\'t parse brightness')
  return brightness
}
