module.exports = {
  apps: [
    {
      name: 'places-explorer-web',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'places-explorer-bot',
      script: 'npm',
      args: 'run bot',
      env: {
        NODE_ENV: 'production',
      },
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
    },
  ],
}; 