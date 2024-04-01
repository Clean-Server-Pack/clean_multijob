onReady(function()
  local my_job = Core.Player.GetJob()
  TriggerServerEvent('dirk_multijob:playerJobChange', my_job.name, my_job.rank)
end)

RegisterNetEvent("Dirk-Core:JobChange", function(job)
  local my_job = Core.Player.GetJob()
  TriggerServerEvent('dirk_multijob:playerJobChange', my_job.name, my_job.rank)
end)