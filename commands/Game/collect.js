const { getPlayer } = require('../../scripts/helpers/database')
const Player = require('../../scripts/database/models/Player')
const SimpleEmbed = require('../../scripts/helpers/simpleEmbed')
const Check = require('../../scripts/helpers/checks')

// Saved User List for Cooldowns
const collectedRecently = {}

module.exports = {
  name: 'collect',
  description: '',
  aliases: [],
  disabled: false,
  admin: false,
  execute: async (client, message, args) => {
    // Return with helpful information
    let sentences = [
      'The rakeback program allows you to earn a portion of your money back on your bets.',
      'The standard rate is 2%.',
      'As a rogue, this can be upgraded and improved through class upgrades.',
      'You can collect every 30 minutes.',
    ]
    if (await Check.checkIfHelp(message, args, sentences, '!collect', 'Rakeback Program (Help)')) return

    // Cooldown Logic
    if (collectedRecently[message.author.id]) {
      let msNeeded = 1000 * 60 * 30 // 30 Minutes
      if (new Date().getTime() - new Date(collectedRecently[message.author.id]).getTime() < msNeeded) {
        let msPassed = new Date().getTime() - new Date(collectedRecently[message.author.id]).getTime()
        let minutesUntil = Math.ceil((((msNeeded - msPassed) / msNeeded) * msNeeded) / 60000)
        SimpleEmbed.error(message, 'Please wait ` ' + minutesUntil + ' ' + (minutesUntil <= 1 ? 'minute' : 'minutes') + ' ` before collecting again.')
        return
      } else {
        delete collectedRecently[message.author.id]
      }
    }

    // Get Player and Do Checks
    const player = await getPlayer(message)
    if (!player) return

    let rakeback = player.rakeback

    if (!rakeback || rakeback == 0) {
      SimpleEmbed.log(message, '!collect', 'Rakeback Program', 'You have nothing to collect...', 'red')
    } else {
      // Add User to Cooldown List
      collectedRecently[message.author.id] = new Date()

      await Player.findOneAndUpdate({ id: player.id }, { $inc: { 'currencies.coins.current': rakeback }, rakeback: 0 })
      SimpleEmbed.log(message, '!collect', 'Rakeback Program', 'You have collected :coin:`' + rakeback.toFixed(2) + '` as rakeback from your bets.', 'green')
    }
  },
}
