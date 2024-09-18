local Config = require 'config'

SQL = {
  ensureTable = function()
    MySQL.Async.execute('CREATE TABLE IF NOT EXISTS multijob (citizenId VARCHAR(50), jobs VARCHAR(255), times VARCHAR(255))', {})
    MySQL.Async.execute('CREATE TABLE IF NOT EXISTS duty_webhooks (job_name VARCHAR(50), webhook VARCHAR(255))', {})
  end,

  loadDutyHook = function()
    return MySQL.Sync.fetchAll('SELECT * FROM duty_webhooks', {})
  end,

  updateDutyHook = function(job_name, webhook)
    MySQL.Async.execute('INSERT INTO duty_webhooks (job_name, webhook) VALUES (@job_name, @webhook) ON DUPLICATE KEY UPDATE webhook = @webhook', {
      ['@job_name'] = job_name,
      ['@webhook'] = webhook,
    })
  end,

  loadPlayerData = function(player)
    if type(player) == 'number' then player = lib.player.identifier(player) end
    local jobs = MySQL.Sync.fetchAll('SELECT * FROM multijob WHERE citizenId = @citizenId', {['@citizenId'] = player})
    if not jobs[1] then 
      SQL.ensurePlayer(player)
      return {
        jobs  = {},
        times = {},
      }
    end
    return {
      jobs  = json.decode(jobs[1].jobs),
      times = json.decode(jobs[1].times),
    }
  end,

  ensurePlayer = function(player, jobs, times)
    if type(player) == 'number' then player = lib.player.identifier(player) end
    local data = MySQL.Sync.fetchAll('SELECT * FROM multijob WHERE citizenId = @citizenId', {['@citizenId'] = player})
    if not data[1] then
      MySQL.Async.execute('INSERT INTO multijob (citizenId, jobs, times) VALUES (@citizenId, @jobs, @times)', {
        ['@citizenId'] = player,
        ['@jobs'] = json.encode(jobs or {}),
        ['@times'] = json.encode(times or {}),
      })

    else 
      local found_jobs = data[1].jobs and json.decode(data[1].jobs)
      local found_times = data[1].times and json.decode(data[1].times)
      if jobs then 
        for job_name,job_rank in pairs(jobs) do 
          found_jobs[job_name] = job_rank
        end
      end

      if times then 
        for job_name,job_time in pairs(times) do 
          found_times[job_name] = job_time
        end
      end
    end
  end,

  updatePlayerJobs = function(player, jobs)
    if type(player) == 'number' then player = lib.player.identifier(player) end
    -- update player jobs
    print('sQL NEW JOBS', json.encode(jobs, {indent = true}))
    MySQL.Async.execute('UPDATE multijob SET jobs = @jobs WHERE citizenId = @citizenId', {
      ['@citizenId'] = player,
      ['@jobs'] = json.encode(jobs),
    })
  end,


  updatePlayerTimes = function(player, times)
    if type(player) == 'number' then player = lib.player.identifier(player) end
    -- update player times
    MySQL.Async.execute('UPDATE multijob SET times = @times WHERE citizenId = @citizenId', {
      ['@citizenId'] = player,
      ['@times'] = json.encode(times),
    })
  end,
}

lib.callback.register('clean_multijob:updateJobHook', function(src, job_name, webhook)
  SQL.updateDutyHook(job_name, webhook)
  return true
end)

lib.callback.register('clean_multijob:getJobHook', function(src)
  return SQL.loadDutyHook()
end)

CreateThread(function()
  SQL.ensureTable()

  
  if Config.convertFromPS then 
    local old_jobs = MySQL.query.await("SELECT citizenid, jobdata FROM multijobs", {})
    if not old_jobs then 
      return lib.print.info('You have Config.convertFromPS enabled but no old jobs to convert')
    end
    

  
    for _,result in pairs(old_jobs) do 
      local citizenId = result.citizenid
      jobs = json.decode(result.jobdata)
     
      SQL.ensurePlayer(citizenId, jobs, {})

      -- remove old jobs
     
    end
    
    MySQL.Async.execute('DROP TABLE multijobs', {})
  end
end)
