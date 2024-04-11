
local player_data = {}
local job_counts  = {}
local found_roles = {}

local getSlotMax = function(playerId)
  if type(playerId) == 'string' then 
    return Config.regularSlots
  end
  local now = os.time()
  local myRoles =  {}
  if found_roles[playerId] then 
    local diff = now - found_roles[playerId].find_time
    if diff >= 120 then 
      
      found_roles[playerId].roles = myRoles
      found_roles[playerId].find_time = now

    else 
      myRoles = found_roles[playerId].roles
    end
  else
    myRoles = exports['Badger_Discord_API']:GetDiscordRoles(playerId)
    found_roles[playerId] = {
      find_time = now 
      roles     = myRoles
    }
  end

  local myMax = Config.regularSlots
  if myRoles and type(myRoles) == 'table' then 
    for cfgRole,roleData in pairs(Config.roles) do
      for _, myRole in ipairs(myRoles) do
        if tostring(myRole) == tostring(roleData.discordId) then
          myMax = roleData.slots or myMax
        end
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
  if player_data[player_id][job_name] and player_data[player_id][job_name] == job_rank then return false end
  player_data[player_id][job_name] = job_rank
  saveAll()
end

exports('addJob', addJob)

local removeJob = function(player_id, job_name)
  local src = false
  if type(player_id) == 'number' then 
    local is_online = Core.Player.Get(player_id)
    if not is_online then return false, print('Player is not online please provide their citizenID instead'); end
    src = player_id
    player_id = Core.Player.Id(player_id)
  end 

  if not player_data[player_id] then player_data[player_id] = {} end
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
      table.insert(players, {
        citizen_id = k, 
        rank       = v[job_name]
      })
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

onReady(function()
  player_data = Core.Files.Load('multi_jobs.json') or {}

  if Config.convertFromPS then 
    local old_jobs = MySQL.query.await("SELECT citizenid, jobdata FROM multijobs", {})

    for _,result in pairs(old_jobs) do 
      local cid = result.citizenid
      if not player_data[cid] then 
        player_data[cid] = json.decode(result.jobdata) or {}
      end
    end
    print(json.encode(player_data, {indent = true}))
    print('CONVERTED THE PLAYERS JOBS FROM ABOVE, PROBABLY TUURN OFF THE convertFromPS setting in the config now...')
    saveAll()
  end



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
    local max_slots = getSlotMax(src)
    cb(jobs, max_slots)
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
