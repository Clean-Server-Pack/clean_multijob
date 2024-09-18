
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
