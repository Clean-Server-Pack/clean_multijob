
local player_data = {}
local job_counts  = {}



local getSlotMax = function(playerId)
  if type(playerId) == 'string' then 
    return Config.defaultSlotMax
  end

  local myRoles = exports['Badger_Discord_API']:GetDiscordRoles(playerId)
  local myMax = Config.defaultSlotMax
  for cfgRole,roleData in pairs(Config.roles) do
    for _, myRole in ipairs(myRoles) do
      if myRole == roleData.discordId then
        myMax = roleData.maxSlots or myMax
      end
    end
  end
  return myMax
end

local saveAll = function()  
  Core.Files.Save('multi_jobs.json', player_data)
end

local removeFromOldJob = function(src)
  for job_name,players in pairs(job_counts) do 
    for i=#players,1,-1 do 
      if players[i] == src then 
        table.remove(players, i)
        break
      end
    end
  end
end

local getJobPlayerCount = function(job_name)
  if not job_counts[job_name] then return 0 end
  return #job_counts[job_name]
end

exports('getJobPlayerCount', getJobPlayerCount)

-- Functionallity 

local addJob = function(player_id, job_name, job_rank)
  if type(player_id) == 'number' then 
    local is_online = Core.Player.Get(player_id)
    if not is_online then return false, print('Player is not online please provide their CID'); end
    player_id = Core.Player.Id(player_id)
  end 

  if not player_data[player_id] then player_data[player_id] = {} end
  if player_data[player_id][job_name] and player_data[player_id][job_name] == job_rank then return false, print('Player already has this job'); end
  player_data[player_id][job_name] = job_rank
  saveAll()
end

exports('addJob', addJob)

local removeJob = function(player_id, job_name)
  local src = false
  if type(player_id) == 'number' then 
    local is_online = Core.Player.Get(player_id)
    if not is_online then return false, print('Player is not online'); end
    src = player_id
    player_id = Core.Player.Id(player_id)
  end 

  if not player_data[player_id] then return false, print('Player does not have any jobs'); end
  player_data[player_id][job_name] = nil
  if src then 
    Core.Player.SetJob(src, Config.unemployed.jobName, 0)
  end
  saveAll()
end

exports('removeJob', removeJob)

local getJobs = function(player_id)
  if type(player_id) == 'number' then 
    local is_online = Core.Player.Get(player_id)
    if not is_online then return false, print('Player is not online'); end
    player_id = Core.Player.Id(player_id)
  end 

  return player_data[player_id] or {}
end

exports('getJobs', getJobs)

local getPlayersWithJob = function(job_name)
  local players = {}
  for k,v in pairs(player_data) do 
    if v[job_name] then 
      table.insert(players, k)
    end
  end
  return players
end

exports('getPlayersWithJob', getPlayersWithJob)

--\\ JOB COUNTING 

RegisterNetEvent('dirk_multijob:playerJobChange', function(name, rank)
  local src = source 
  removeFromOldJob(src)
  if not job_counts[name] then job_counts[name] = {} end
  table.insert(job_counts[name], src)
  addJob(src, name, rank)
end)

AddEventHandler('playerDropped', function(source, reason)
  removeFromOldJob(source)
end)

---\\ Conversion from PS-UI
RegisterNetEvent('dirk_multijob:player_login', function()
  local src = source 
  local cid = Core.Player.Id(src)
  local current_job = Core.Player.GetJob(src)
  
  if player_data[cid] then return false; end

  if Config.convertFromPS then 
    local old_jobs = MySQL.query.await("SELECT jobdata FROM multijobs WHERE citizenid = ?", {cid})
    if not old_jobs then return false; end
    --  FORMAT TO NEW STYLE 
    local new_format = {}
    for k,v in pairs(old_jobs) do 
      new_format[k] = v
    end

  else
    player_data[cid] = {}
    player_data[cid][current_job.name] = current_job.rank
  end


  --\\ Get all jobs from old PS-UI table
  print('Converted Multi Jobs', json.encode(player_data[cid], {indent = true}))
end)

onReady(function()
  player_data = Core.Files.Load('multi_jobs.json') or {}
  print('Loaded Multi Jobs', player_data)
  Core.Callback('dirk_multijob:getJobs', function(src, cb, current_job)
    local player_jobs = player_data[Core.Player.Id(src)] or {}
    local jobs = {}
    for k,v in pairs(player_jobs) do
      jobs[k] = {
        rank = v,
        active = getJobPlayerCount(k)
      }
    end

    if current_job and not jobs[current_job] then 
      jobs[current_job] = {
        rank = 0,
        active = getJobPlayerCount(current_job)
      }
    end

    cb(jobs, getSlotMax(src))
  end)
end)



--- UI 
RegisterNetEvent('dirk_multijob:selectJob', function(job_name)
  local src = source 
  local cid = Core.Player.Id(src)
  local player_jobs = player_data[cid] or {}
  if not player_jobs[job_name] and job_name ~= Config.unemployed.jobName then return print('Player does not have this job'); end
  Core.Player.SetJob(src, job_name, player_jobs[job_name])
end)

RegisterNetEvent('dirk_multijob:quitJob', function(job_name)
  local src = source 
  removeJob(src, job_name)
end)

RegisterNetEvent('dirk_mutlijob:toggleDuty', function(job_name, state)
  local src = source 
  local cid = Core.Player.Id(src)
  local player_jobs = player_data[cid] or {}
  if not player_jobs[job_name] and job_name ~= Config.unemployed.jobName then return print('Player does not have this job'); end
  Core.Player.SetDuty(src, state)
end)
