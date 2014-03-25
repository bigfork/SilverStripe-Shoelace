namespace :assets do
	task :symlink do
		on roles(:web) do
			execute "rm -rf #{fetch(:release_path)}/assets"

			execute "mkdir -p #{fetch(:deploy_to)}/shared/assets"
			execute "ln -nfs #{fetch(:deploy_to)}/shared/assets #{fetch(:release_path)}/assets"

			:fix_permissions
		end
	end
	task :upload do
		on roles(:web) do
			system "rsync -rvz -e \"ssh\" assets/ #{fetch(:user)}@#{fetch(:host_ip)}:#{fetch(:deploy_to)}/shared/assets"
			:fix_permissions
		end
	end
	task :download do
		on roles(:web) do
			system "rsync -rvz -e \"ssh\" #{fetch(:user)}@#{fetch(:host_ip)}:#{fetch(:deploy_to)}/shared/assets/ assets"
			system "chmod -R 775 assets/"
		end
	end
	task :fix_permissions do
		on roles(:web) do
			if fetch(:skip_fix_permissions, false) == false then
				execute "mkdir -p #{shared_path}/assets"
				execute "chown -R #{fetch(:user)}:#{fetch(:group)} #{shared_path}/assets"
				execute "chmod -R 775 #{shared_path}/assets"
			end
		end
	end
end

after('deploy:updated', 'assets:symlink')