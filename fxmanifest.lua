 
fx_version 'cerulean' 
lua54 'yes' 
games { 'rdr3', 'gta5' } 
author 'DirkScripts' 
description 'React Boilerplate for FiveM | Uses mantine for theming' 
version '1.0.0' 

shared_script{
  'config.lua',
  'src/shared/utils.lua',
}

client_script { 
  'src/client/main.lua', 
  'src/client/ui.lua', 
} 

server_script { 
  'src/server/main.lua',
} 
 
ui_page 'web/build/index.html'

files {
	'web/build/index.html',
	'web/build/**/*',
}