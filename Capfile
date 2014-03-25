require '../credentials'

set :stage_config_path,		"util/capistrano/config/deploy"
set :deploy_config_path,	"util/capistrano/config/deploy.rb"
set :application,			"<appname>"
set :repo_url,				"<repo>"

# Load DSL and Setup Up Stages
require 'capistrano/setup'

# Includes default deployment tasks
require 'capistrano/deploy'

# Loads custom tasks from `lib/capistrano/tasks' if you have any defined.
Dir.glob('util/capistrano/tasks/*.rb').each { |r| import r }
