// Current Invite Link: https://discord.com/oauth2/authorize?client_id=968648306689466458&permissions=8&scope=bot%20applications.commands

// Imports of packages
const { Client, Collection } = require('discord.js')
const loadButtonActions = require('./scripts/loaders/loadButtonActions')
const loadCommands = require('./scripts/loaders/loadCommands')
const loadEvents = require('./scripts/loaders/loadEvents')
const loadJobs = require('./scripts/loaders/loadJobs')
const express = require('express')
const app = express()
const port = 8080
const File = require('./scripts/file')
const Db = require('./scripts/database/db')

app.get('/', (req, res) => {
  res.status(200).send('Healthy code!')
})

app.get('/player-data', (req, res) => {
  res.status(200).json(File.read())
})

app.listen(port, () => {
  console.log('Health check server is now up on port: ' + port)
})

// Setup env variables
require('dotenv').config()

// Setting up Client
global.client = new Client({
  intents: [
    'GUILDS',
    'GUILD_BANS',
    'GUILD_MEMBERS',
    'GUILD_INTEGRATIONS',
    'GUILD_WEBHOOKS',
    'GUILD_INVITES',
    'GUILD_VOICE_STATES',
    'GUILD_MESSAGE_REACTIONS',
    'GUILD_MESSAGE_TYPING',
    'DIRECT_MESSAGES',
    'GUILD_PRESENCES',
    'GUILD_MESSAGES',
    'DIRECT_MESSAGE_REACTIONS',
    'DIRECT_MESSAGE_TYPING',
  ],
})

// Setup Collections for storing commands and aliases
client.commands = new Collection()
client.aliases = new Collection()

// Setup Collection for storing actions
client.buttonActions = new Collection()

const startup = async () => {
  // Connect to Database
  await Db.connect()

  // Load Events
  await loadEvents(client)

  // Load Commands
  await loadCommands(client)

  // Load Button Actions
  await loadButtonActions(client)

  // Load Jobs
  await loadJobs(client)

  // Login
  client.login(process.env.DISCORD_TOKEN)
}

// Start the Bot
startup()
