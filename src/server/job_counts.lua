local job_counts  = {}

removeFromOldJob = function(src)
  for job_name,players in pairs(job_counts) do 
    for i=#players,1,-1 do 
      if players[i] == src then 
        table.remove(players, i)
        break
      end
    end
  end
end

getJobPlayerCount = function(job_name)
  if not job_counts[job_name] then return 0 end
  return #job_counts[job_name]
end

addToNewJob = function(src, job_name)
  job_counts[job_name] = job_counts[job_name] or {}
  table.insert(job_counts[job_name], src)
end

AddEventHandler('playerDropped', function(source, reason)
  removeFromOldJob(source)
end)

exports('getJobPlayerCount', getJobPlayerCount)
