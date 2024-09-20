local Config = require 'config'


lib.onCache('playerLoaded', function(loaded)
  if not loaded then return; end
  TriggerServerEvent('clean_multijob:playerJoined')
end)

lib.onCache('job', function(job)
  if not job then return; end
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
  if not raw then 
    lib.print.info('Cannot find job info for ', job_name)
    return false
  end
  job_rank = lib.settings.framework == 'qbx_core' and tonumber(job_rank) or tostring(job_rank)
  return {
    label      = raw.label,
    rank_label = raw.grades[job_rank].name,
    isboss     = raw.grades[job_rank].isboss,
    salary     = raw.grades[job_rank].payment,
  }
end

local in_menu = false 
local last_call = GetGameTimer() - Config.spamPrevention * 1000
openMenu = function()
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
    if job_info then 
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
  local parsed = {}
  for k,v in pairs(times) do 
    table.insert(parsed, {
      Hours = math.floor(v / 60),
      date  = k,
    })
  end
  table.sort(parsed, function(a,b) return a.date < b.date end)
  cb(parsed)
end)




RegisterNuiCallback('GET_EMPLOYEES_TIMES', function(data, cb)
  local job_name = data.job
  local times, webhook = lib.callback.await('clean_multijob:getEmployeeTimes', job_name) 
  times['ALL'] = {}
  local day_exists = function(day)
    for _,v in pairs(times['ALL']) do 
      if v.date == day then return v; end
    end
    return false
  end

  for player_name, player_times in pairs(times) do 
    for date, seconds in pairs(player_times) do 
      table.insert(times[player_name], {
        date = date,
        Hours = math.floor(seconds / 60)
      })
      player_times[date] = nil 
    end 
    table.sort(times[player_name], function(a,b) return a.date < b.date end)
  end 

  for player_name,player_times in pairs(times) do 
    if player_name == 'ALL' then 
      goto continue
    end
    for _, data in pairs(player_times) do 
      if data then 
        local date_exists = day_exists(data.date)
        if not date_exists then 
          table.insert(times['ALL'], {
            date = data.date,
            Hours = data.Hours,
          })
        else 
          date_exists.Hours = date_exists.Hours + data.Hours
        end 
      end 

    end
    ::continue::
  end 

  
  
  table.sort(times['ALL'], function(a,b) return a.date < b.date end)
  -- Force ALL to be first
  table.insert(times, 1, table.remove(times, #times)) 

  cb({
    times = times, 
    webhook = webhook,
  })
end)

RegisterNuiCallback('SAVE_NEW_WEBHOOK', function(data, cb)
  local job_name, webhook = data.job, data.webhook
  lib.callback.await('clean_multijob:updateJobHook', job_name, webhook)
  cb('ok')
end)

