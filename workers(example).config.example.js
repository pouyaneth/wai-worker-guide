module.exports = {
  apps: [{
    name: 'wai-worker-1',
    script: '/workspace/worker1/wai',
    args: 'run',
    cwd: '/workspace/worker1',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      W_AI_API_KEY: 'YOUR_API_KEY_HERE',
      HOME: '/workspace/worker1'
    }
  }]
};
