return {



  convertFromOldJSON = true, --\\ If you have an old JSON file with player data, set this to true to convert it to the new system

  spamPrevention = 2, --\\ How many seconds between each menu open to stop spamming?
  setUnemployedStart = true, --\\ Should the player start as unemployed?
  unemployedJob = 'unemployed', --\\ What should the unemployed job be called?


  enableTimeTracking = true, --\\ Should the script track time played for each job? (happens only when they go on duty)
  jobCounts          = true, --\\ Should the script track how many players are in each job?

  regularSlots = 2, --\\ How many jobs in total can a regular player have at once?

  usingDiscordRoles = false, --\\ If you want to use discord roles to determine job slots, set this to true
  roles = { --\\ Requires 
    admin = {discordId = '123456789', slots = 5},
    moderator = {discordId = '987654321', slots = 3},
    helper = {discordId = '123456789', slots = 2},
    supporter = {discordId = '987654321', slots = 1},
  },
}











