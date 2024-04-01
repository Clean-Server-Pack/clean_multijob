local job_info = {}

onReady(function()
  if not Settings.Framework then Core, Settings = exports['dirk-core']:getCore(); end
  if Settings.Framework == 'qb-core' then 
    local QBCore = exports['qb-core']:GetCoreObject()
    job_info = QBCore.Shared.Jobs
  end
end)

getJobInfo = function(job_name, job_rank)
  local raw = job_info[job_name]
  return {
    label = raw.label,
    rank_label = raw.grades[tostring(job_rank)].name,
    salary = raw.grades[tostring(job_rank)].payment,
  }
end

local in_menu = false 
local last_call = GetGameTimer() - Config.spamPrevention * 1000
openMenu = function()
  if Config.spamPrevention then 
    if GetGameTimer() - last_call < Config.spamPrevention * 1000 then return Core.UI.Notify('Stop spamming this menu you fucking geek!') end
    last_call = GetGameTimer()
  end
  local current_job = Core.Player.GetJob()
  local my_jobs, max_jobs = Core.SyncCallback('dirk_multijob:getJobs', current_job.name)
  local job_display = {}

  if not my_jobs[current_job.name] then 
    my_jobs[current_job.name] = {
      rank = current_job.rank,
      selected = true,
      label = current_job.label,
      active = current_job.active,
      duty = current_job.duty,
    }
  end

  for k,v in pairs(my_jobs) do 
    local on_duty = current_job.name == k and current_job.duty or false
    local job_info = getJobInfo(k, v.rank)
    job_display[k] = {
      name  = k, 
      label = job_info.label or v.label, 
      rank  = v.rank,
      selected = current_job.name == k,
      rank_label = job_info.rank_label,
      duty = current_job.name == k and current_job.duty or false,
      active = v.active,
      salary = job_info.salary,
    }
  end


  job_display[Config.unemployed.jobName] = job_display[Config.unemployed.jobName] or {
    name  = Config.unemployed.jobName, 
    label = Config.unemployed.jobLabel, 
    rank  = 0,
    selected = current_job.name == Config.unemployed.jobName,
    rank_label = Config.unemployed.rankLabel,
    duty = false,
    active = 0,
    salary = 0,
  }

  SetNuiFocus(true, true)
  SetNuiFocusKeepInput(true)
  in_menu = true


  CreateThread(function()
    while in_menu do 
      Wait(0)
      --\ Disable mouse movement 
      DisableControlAction(0, 1, true)
      DisableControlAction(0, 2, true)
      DisableControlAction(0, 142, true)
      DisableControlAction(0, 106, true)
      DisableControlAction(0, 200, true)
      DisableControlAction(0, 202, true)

    end
  end)
  SendNUIMessage({
    module = 'JobBar',
    action = 'JOB_BAR_STATE', 
    data   = {
      action  = 'OPEN', 
      my_jobs = job_display,
      max_slots = max_jobs,
    }
  })
end

local closeMenu = function()
  SetNuiFocusKeepInput(true)
  SetNuiFocus(false, false)
  in_menu = false
  SendNUIMessage({
    module = 'JobBar',
    action = 'JOB_BAR_STATE', 
    data   = {
      action  = 'CLOSE', 
    }
  })
end

RegisterCommand('jobmenu', function()
  if not in_menu then
    openMenu()
    return 
  end

  closeMenu()
end, false)




RegisterKeyMapping('jobmenu', 'Open Job Menu', 'keyboard', 'F6')



RegisterNuiCallback('LOSE_FOCUS_JOB', function(data, cb)

  SetNuiFocusKeepInput(true)
  SetNuiFocus(false, false)
  in_menu = false
  cb('ok')
end)

RegisterNuiCallback('JOB_SELECT', function(data, cb)
  local job_name, selected = data.job, data.selected
  if not selected and job_name == Config.unemployed.jobName then return cb('ok'); end
  TriggerServerEvent('dirk_multijob:selectJob', job_name)
  cb('ok')
end)


RegisterNuiCallback('JOB_DUTY', function(data, cb)
  local job_name, duty = data.job, data.duty
  TriggerServerEvent('dirk_mutlijob:toggleDuty', job_name, duty)
  cb('ok')
end)

RegisterNuiCallback('JOB_DELETE', function(data, cb)
  local job_name = data.job
  TriggerServerEvent('dirk_multijob:quitJob', job_name)
  cb('ok')
end)






