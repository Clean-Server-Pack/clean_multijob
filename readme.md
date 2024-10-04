
# clean_multijob 

## Similar Design Better Execution of a well known multijob script (all code is entirely my own)
 
## Usage 
F6 Key is default to open can be changed via keybindings, automatically converts from old ps_ui style of storage, will also pickup setJobs adding these to your multijob menu 


```lua
  ---[[ USAGE ]]--- 

  local added, error = exports['clean_multijob']:addJob(src | citizenid, job_name, job_rank)
  if not added then print(error); end 
  --\\ error msgs 
  --\\ Player cant be found
  --\\ Player has same job already
  --\\ Player does not have enough slots
  --\\ Job does not exist


  local removed, error = exports['clean_multijob']:removeJob(src | citizenid, job_name)
  if not removed then print(error); end
  --\\ error msgs
  --\\ Player cant be found
  --\\ Player does not have job
  --\\ Job does not exist

  local count = exports['clean_multijob']:getJobPlayerCount(job_name)
  --// Returns the amount of players with the job online right now 

  local players_in_job = exports['clean_multijob']:getPlayersWithJob(job_name)
  --// Returns a table with all the player ids that have the job -- for boss menu etc?


  local players_jobs = exports['clean_multijob']:getJobs(src | citizenid) 
  --// Returns a table with all the jobs the player has and their ranks
```


# QBX_MANAGEMENT? Implementation from Discord #svgd

```lua

---@param employeeCitizenId string
---@diagnostic disable-next-line: undefined-doc-name
---@param boss Player | table
---@param groupName string
---@param groupType GroupType
---@return boolean success
local function fireEmployee(employeeCitizenId, boss, groupName, groupType)
    local src = boss.PlayerData.source
    local employee = exports.qbx_core:GetPlayerByCitizenId(employeeCitizenId) or exports.qbx_core:GetOfflinePlayer(employeeCitizenId)

    if not employee then
        exports.qbx_core:Notify(src, locale('error.person_doesnt_exist'), 'error')
        return false
    end

    if employee.PlayerData.citizenid == boss.PlayerData.citizenid then
        local message = groupType == 'gang' and locale('error.kick_yourself') or locale('error.fire_yourself')
        exports.qbx_core:Notify(src, message, 'error')
        return false
    end

    local employeeGrade = groupType == 'job' and employee.PlayerData.jobs?[groupName] or employee.PlayerData.gangs?[groupName]
    local bossGrade = groupType == 'job' and boss.PlayerData.jobs?[groupName] or boss.PlayerData.gangs?[groupName]
    if employeeGrade >= bossGrade then
        exports.qbx_core:Notify(src, locale('error.fire_boss'), 'error')
        return false
    end

    if groupType == 'job' then
        local success, errorResult = exports.qbx_core:RemovePlayerFromJob(employeeCitizenId, groupName)
        print(employeeCitizenId)

        local removed, err
        if not employee.Offline then
            -- Employee is online
            removed, err = exports['clean_multijob']:removeJob(employee.PlayerData.source, groupName)
        else
            -- Employee is offline
            removed, err = exports['clean_multijob']:removeJob(employeeCitizenId, groupName)
        end

        if not removed then
            print(err)
        end

        assert(success, errorResult and errorResult.message or 'Unknown error')
    else
        local success, errorResult = exports.qbx_core:RemovePlayerFromGang(employeeCitizenId, groupName)
        assert(success, errorResult and errorResult.message or 'Unknown error')
    end

    if not employee.Offline then
        local message = groupType == 'gang' and locale('error.you_gang_fired', GANGS[groupName].label) or locale('error.you_job_fired', JOBS[groupName].label)
        exports.qbx_core:Notify(employee.PlayerData.source, message, 'error')
    end

    return true
end

```