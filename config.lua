Config = {
  spamPrevention = 2, --\\ How many seconds between each menu open to stop spamming?
  unemployed = {
    jobName = 'unemployed',
    jobLabel = 'Unemployed',
    rankLabel = 'Bum',
  },

  regularSlots = 2, --\\ How many jobs in total can a regular player have at once?


  roles = { --\\ Requires badger_discord_api
    admin = {discordId = '123456789', slots = 5},
    moderator = {discordId = '987654321', slots = 3},
    helper = {discordId = '123456789', slots = 2},
    supporter = {discordId = '987654321', slots = 1},
  },
}


Core,Settings = exports['dirk-core']:getCore()













