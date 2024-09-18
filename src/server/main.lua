local Config = require 'config'
local json_file = false
local player_data = {}
local tracking_duty = {}

local start_tracking_duty = function(player_id, job_name)
  if type(player_id) == 'number' then 
    player_id = lib.player.identifier(player_id)
  end
  if not Config.enableTimeTracking then return end
  if tracking_duty[player_id] then 
    if tracking_duty[player_id].job == job_name then return end
    return 
  end
  local now = os.time()
  tracking_duty[player_id] = {
    job = job_name,
    start = now
  }
  lib.print.info('Player', player_id, 'has started tracking duty for job', job_name)
end

AddEventHandler('playerDropped', function()
  local src = source
  local cid = lib.player.identifier(src)
  local found_player = player_data[cid]
  if not found_player then return end
  found_player.online = false

  stop_tracking_duty(cid)
end)

local stop_tracking_duty = function(player_id)
  if type(player_id) == 'number' then 
    player_id = lib.player.identifier(player_id)
  end
  if not Config.enableTimeTracking then return end
  if not tracking_duty[player_id] then return end
  local start = tracking_duty[player_id].start
  local job_name = tracking_duty[player_id].job
  local now = os.time()
  local diff = now - start
  local day = os.date('%d/%m')
  local found_player = player_data[player_id]
  if not found_player then return end
  local player_times = found_player.times
  if not player_times[job_name] then 
    player_times[job_name] = {}
  end

  if not player_times[job_name][day] then 
    player_times[job_name][day] = 0
  end
  player_times[job_name][day] = player_times[job_name][day] + diff
  SQL.updatePlayerTimes(player_id, player_times)
  lib.print.info('Player', player_id, 'has played', diff, 'seconds for job', job_name)
  lib.print.info('Total time played for job', job_name, 'is now', player_times[job_name][day], 'seconds')
  tracking_duty[player_id] = nil
end

lib.callback.register('clean_multijob:getPersonalTimes', function(src, job)
  local found_player = player_data[lib.player.identifier(src)]
  if not found_player then return false; end
  print('looking for job', job) 
  return found_player.times[job] or {}
end)

lib.callback.register('clean_multijob:getEmployeeTimes', function(src, job)
  local ret = {}
  for k,v in pairs(player_data) do 
    if v.jobs[job] then 
      table.insert(ret, {
        name = k,
        times = v.times[job] or {}
      })
    end
  end
  return ret
end)



checkOnline = function(identifier)
  assert(type(identifier) == 'string' or type(identifier) == 'number', 'Identifier must be a string or number')
  if type(identifier) == 'number' then 
    return GetPlayerByServerId(identifier) ~= 0
  end
  local plys = GetPlayers()
  for _, ply in ipairs(plys) do 
    local other_ply = lib.player.get(tonumber(ply))
    if other_ply then 
      if identifier == lib.player.identifier(tonumber(ply)) then
        return ply
      end
    end
  end
  return false
end

local loadPlayer = function(id)
  if type(id) == 'number' then 
    id = lib.player.identifier(id)
  end

  local found_player = rawget(player_data, id) or SQL.loadPlayerData(id)
  local is_online = checkOnline(id)
  found_player.online = is_online
  player_data[id] = found_player

  if Config.convertFromOldJSON then 
    if not json_file then 
      local loaded_file = LoadResourceFile(GetCurrentResourceName(), 'player_data.json')
      if loaded_file then 
        json_file = json.decode(loaded_file)
      end
    end 
    if not json_file then 
      lib.print.error('No JSON file found for converting from old JSON')
      goto end_convert
    end 
    if not json_file[id] then 
      goto end_convert      
    end

    for job_name, job_rank in pairs(json_file[id]) do 
      addJob(id, job_name, job_rank)
    end
  end   
  ::end_convert::

  return found_player
end 

setmetatable(player_data, {
  __index = function(t, player_id)
    if type(player_id) == 'number' then 
      player_id = lib.player.identifier(player_id)
    end 
    local found_player = loadPlayer(player_id) 
    rawset(t, player_id, found_player)
    return found_player
    
  end
})




local getSlotMax = function(playerId)
  if not Config.usingDiscordRoles then 
    return Config.regularSlots
  end 
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
      find_time = now,
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


-- Functionallity 

local hasJob = function(player_id, job_name)
  local found_player = player_data[player_id]
  if not found_player then return false; end
  return found_player.jobs[job_name] or false, found_player.jobs[job_name] or 0
end

local addJob = function(player_id, job_name, job_rank)
  local found_player = player_data[player_id]

  local has_job, rank  = hasJob(player_id, job_name)
  if has_job and rank == job_rank then return false end
  found_player.jobs[job_name] = job_rank
  SQL.updatePlayerJobs(player_id, found_player.jobs)
end

exports('addJob', addJob)

local removeJob = function(player_id, job_name)
  local found_player = player_data[player_id]
  if not found_player then return false; end
  if found_player.online then 
    lib.player.setJob(player_id, Config.unemployedJob, 0)
  end

  found_player.jobs[job_name] = nil
  stop_tracking_duty(player_id)
  SQL.updatePlayerJobs(player_id, player_data[player_id].jobs)
end

exports('removeJob', removeJob)

local getJobs = function(player_id)
  local found_player = player_data[player_id]
  if not found_player then return false; end
  return found_player.jobs
end

exports('getJobs', getJobs)

local getPlayersWithJob = function(job_name)
  local ret = {}
  for k,v in pairs(player_data) do 
    if v.jobs[job_name] then 
      table.insert(ret, {
        citizen_id = k, 
        rank       = v.jobs[job_name]
      })
    end
  end
  return ret
end

exports('getPlayersWithJob', getPlayersWithJob)

--\\ JOB COUNTING 

RegisterNetEvent('clean_multijob:jobUpdate', function(job)
  local src = source 
  removeFromOldJob(src)
  addToNewJob(src, job.name)
  if job.name == Config.unemployedJob then 
    return 
  end
  addJob(src, job.name, job.rank)
end)




RegisterNetEvent('clean_multijob:playerJoined', function()
  local src = source
  if not Config.setUnemployedStart then return end
  lib.player.setJob(src, Config.unemployedJob, 0)
  lib.player.setDuty(src, false)
end)

lib.callback.register('clean_multijob:getJobs', function(src, current_job)
  local cid = lib.player.identifier(src)
  local found_player = player_data[cid]
  local jobs = {}
  for k,v in pairs(found_player.jobs) do
    jobs[k] = {
      name = k,
      rank = v,
      active = getJobPlayerCount(k)
    }
  end

  if current_job and not jobs[current_job] then 
    jobs[current_job] = {
      name = current_job,
      rank = 0,
      active = getJobPlayerCount(current_job)
    }
  end


  local max_slots = getSlotMax(src)
  return jobs, max_slots
end)

--- UI 
RegisterNetEvent('clean_multijob:selectJob', function(job_name)
  local src = source 
  local cid = lib.player.identifier(src)
  stop_tracking_duty(cid)
  local found_player = player_data[cid]
  local player_jobs = found_player.jobs
  if not player_jobs[job_name] and job_name ~= Config.unemployedJob then return print('Player does not have this job'); end
  lib.player.setJob(src, job_name, player_jobs[job_name])
end)

RegisterNetEvent('clean_multijob:quitJob', function(job_name)
  local src = source 
  removeJob(src, job_name)
end)



local current_active = {}
 
RegisterNetEvent('clean_multijob:toggleDuty', function(job_name, state)
  local src = source 
  local cid = lib.player.identifier(src)
  local found_player = player_data[cid]
  local player_jobs = found_player.jobs
  if not player_jobs[job_name] and job_name ~= Config.unemployedJob then return print('Player does not have this job'); end
  lib.player.setDuty(src, state)

  if state then 
    start_tracking_duty(cid, job_name)
  else 
    stop_tracking_duty(cid)
  end
end)

