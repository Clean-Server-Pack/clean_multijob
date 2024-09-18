 
fx_version 'cerulean' 
lua54 'yes' 
games { 'rdr3', 'gta5' } 
author 'DirkScripts' 
description 'Multijob for FiveM' 
version '1.0.0' 

shared_script{
  '@clean_lib/init.lua',
}

client_script { 
  'src/client/main.lua', 
  'src/client/ui.lua', 
} 

server_script { 
  '@oxmysql/lib/MySQL.lua',
  'src/server/sql.lua',
  'src/server/job_counts.lua',
  'src/server/main.lua',
} 
 
ui_page 'web/build/index.html'

files {
  'config.lua',
  'web/build/index.html',
	'web/build/**/*',
}