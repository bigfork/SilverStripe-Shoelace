set :keep_releases,     fetch(:keep_releases, 5)

namespace :deploy do
  desc "Build"
  after :updated, :build do
    on roles(:web) do
      within release_path do
        execute :composer, "install --no-dev --quiet"
      end
    end
  end
end