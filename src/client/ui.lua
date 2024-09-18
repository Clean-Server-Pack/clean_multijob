local Config = require 'config'


lib.onCache('playerLoaded', function(loaded)
  if not loaded then return; end
  TriggerServerEvent('clean_multijob:playerJoined')
end)

lib.onCache('job', function(job)
  print('NEW JOB', json.encode(job, {indent = true}))
  TriggerServerEvent('clean_multijob:jobUpdate', {
    name = job.name,
    rank = job.grade,
  })
end)

RegisterNuiCallback('GET_SETTINGS', function(data, cb)
  cb({
    primaryColor       = lib.settings.primaryColor,
    primaryShade       = lib.settings.primaryShade,
    enableTimeTracking = Config.enableTimeTracking,
    jobCounts          = Config.jobCounts,
    unemployedJob      = Config.unemployedJob,
  })
end)

getJobInfo = function(job_name, job_rank)
  local raw = lib.FW.Shared.Jobs[job_name]
  return {
    label      = raw.label,
    rank_label = raw.grades[tonumber(job_rank)].name,
    isboss     = raw.grades[tonumber(job_rank)].isboss,
    salary     = raw.grades[tonumber(job_rank)].payment,
  }
end

local in_menu = false 
local last_call = GetGameTimer() - Config.spamPrevention * 1000
openMenu = function()
  print('OPEN MENU')
  if Config.spamPrevention then 
    if GetGameTimer() - last_call < Config.spamPrevention * 1000 then 
      return lib.notify({
        title = 'Job Menu', 
        description = 'Stop spamming this menu you fucking geek!'
      }) 
    end
    last_call = GetGameTimer()
  end
  local current_job = cache.job
  local my_jobs, max_jobs = lib.callback.await('clean_multijob:getJobs', current_job.name)
  local job_display = {}
  print('cur job')
  print(json.encode(current_job, {indent = true}))

  if not my_jobs[current_job.name] then 
    my_jobs[current_job.name] = {
      rank = current_job.rank,
      selected = true,
      label = current_job.label,
      active = current_job.active,
      duty = current_job.onduty,
    }
  end

  local inserted = {}
  for k,v in pairs(my_jobs) do 
    local on_duty = current_job.name == k and current_job.duty or false
    local job_info = getJobInfo(k, v.rank)
    table.insert(inserted, k)
    table.insert(job_display, {
      name  = k, 
      label = job_info.label or v.label, 
      rank  = v.rank,
      isboss = job_info.isboss,
      selected = current_job.name == k,
      rank_label = job_info.rank_label,
      duty = current_job.name == k and current_job.onduty or false,
      active = v.active,
      salary = job_info.salary,
    })
  end



  if not lib.table.includes(inserted, Config.unemployedJob) then 
    local job_info = getJobInfo(Config.unemployedJob, 0)
    table.insert(job_display, {
      name  = Config.unemployedJob, 
      label = job_info.label, 
      rank  = 0,
      selected = current_job.name == Config.unemployedJob,
      rank_label = job_info.rank_label,
      duty = false,
      active = 0,
      salary = 0,
    })
  end

  SetNuiFocus(true, true)
  in_menu = true

  SendNUIMessage({
    action = 'OPEN_MENU', 
    data   = {
      jobs = job_display,
      maxSlots = max_jobs,
    }
  })
end

local closeMenu = function()
  SetNuiFocus(false, false)
  in_menu = false
  SendNUIMessage({
    action = 'CLOSE_MENU', 
  })
end

RegisterCommand('jobmenu', function()
  if not in_menu then
    openMenu()
    return 
  end

  closeMenu()
end, false)


RegisterKeyMapping('jobmenu', 'Open Job Menu', 'keyboard', 'J')



RegisterNuiCallback('LOSE_FOCUS_JOB', function(data, cb)
  SetNuiFocus(false, false)
  in_menu = false
  cb('ok')
end)

RegisterNuiCallback('JOB_SELECT', function(data, cb)
  local job_name = data.job
  TriggerServerEvent('clean_multijob:selectJob', job_name)
  cb('ok')
end)


RegisterNuiCallback('JOB_DUTY', function(data, cb)
  local job_name, duty = data.job, data.duty
  TriggerServerEvent('clean_multijob:toggleDuty', job_name, duty)
  cb('ok')
end)

RegisterNuiCallback('JOB_DELETE', function(data, cb)
  local job_name = data.job
  if job_name == Config.unemployedJob then return cb(false); end
  TriggerServerEvent('clean_multijob:quitJob', job_name)
  cb('ok')
end)

RegisterNuiCallback('GET_PERSONAL_TIMES', function(data, cb)
  local job_name = data.job
  local times = lib.callback.await('clean_multijob:getPersonalTimes', job_name) 
  print('TIMES', json.encode(times, {indent = true}))
  local parsed = {}
  for k,v in pairs(times) do 
    table.insert(parsed, {
      Hours = math.floor(v / 60),
      date  = k,
    })
  end
  table.sort(parsed, function(a,b) return a.date < b.date end)
  print('PARSED', json.encode(parsed, {indent = true}))
  cb(parsed)
end)




RegisterNuiCallback('GET_EMPLOYEES_TIMES', function(data, cb)
  local job_name = data.job
  local times, webhook = lib.callback.await('clean_multijob:getEmployeeTimes', job_name) 
  print('TIMES', json.encode(times, {indent = true}))
  local parsed = {}
  for _,player_data in pairs(times) do 
    parsed[player_data.name] = {}
    for k,v in pairs(player_data.times) do 
      table.insert(parsed[player_data.name], {
        Hours = math.floor(v / 60),
        date  = k,
      })
    end
    table.sort(parsed[player_data.name], function(a,b) return a.date < b.date end)
  end

  parsed['all'] = {}
  local day_exists = function(day)
    for _,v in pairs(parsed['all']) do 
      if v.date == day then return v; end
    end
    return false
  end

  for k,v in pairs(parsed) do 
    if k == 'all' then goto continue end
    for _,time in pairs(v) do 
      local exists = day_exists(time.date)
      if exists then 
        exists.Hours = exists.Hours + time.Hours
      else 
        table.insert(parsed['all'], {
          Hours = time.Hours,
          date  = time.date,
        })
      end
    end
    ::continue::
  end 

  table.sort(parsed['all'], function(a,b) return a.date < b.date end)
  print('PARSED', json.encode(parsed, {indent = true}))
  cb(parsed)
end)

