# wai-worker-guide
Multi-worker w.ai mining setup with PM2 - Tested on GTX 1080 Ti
# Complete w.ai Multi-Worker Setup Guide

## Hardware Requirements
- **GPU**: GTX 1080 Ti (11GB VRAM) or equivalent
- **RAM**: 16GB+ recommended
- **OS**: Ubuntu 22.04 LTS
- **Storage**: 50GB+ free space

## System Setup

### 1. Update System and Install Dependencies
```bash
# Update system packages
apt update && apt upgrade -y

# Install essential tools
apt install screen curl iptables build-essential git wget lz4 jq make gcc nano automake autoconf tmux htop nvme-cli libgbm1 pkg-config libssl-dev libleveldb-dev tar clang bsdmainutils ncdu unzip libleveldb-dev -y

# Install Python
apt install python3 python3-pip python3-venv python3-dev -y
```

### 2. Install Node.js
```bash
apt update
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs
node -v  # Should show v22.x.x
npm install -g yarn
```

### 3. Verify GPU Setup
```bash
nvidia-smi  # Should show your GPU
nvcc --version  # Should show CUDA version
```

## w.ai CLI Installation

### 4. Install w.ai CLI
```bash
curl -fsSL https://app.w.ai/install.sh | bash
```

### 5. Get Your API Key
1. Visit the w.ai platform
2. Create account and get your API key
3. Keep it ready for next steps

## Single Worker Test (Important!)

### 6. Test Single Worker First
```bash
# Set your API key (replace with your actual key)
export W_AI_API_KEY=your_actual_api_key_here

# Test single worker
wai run
```

**Wait for it to start earning coins before proceeding!** You should see:
- "Task in progress..."
- "Task completed in X seconds"
- "You earned 1 w.ai coin"

Press `Ctrl+C` to stop once confirmed working.

## Multi-Worker Setup

### 7. Install PM2
```bash
npm install -g pm2
```

### 8. Create Isolated Worker Setup
```bash
# Create separate directories for each worker
mkdir -p /workspace/worker1
mkdir -p /workspace/worker2
mkdir -p /workspace/worker3
mkdir -p /workspace/worker4

# Copy wai binary to each worker directory
cp /usr/bin/wai /workspace/worker1/wai
cp /usr/bin/wai /workspace/worker2/wai
cp /usr/bin/wai /workspace/worker3/wai
cp /usr/bin/wai /workspace/worker4/wai

# Make them executable
chmod +x /workspace/worker*/wai
```

### 9. Create PM2 Configuration Files

Create `worker1.config.js`:
```bash
cat > worker1.config.js << EOF
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
      W_AI_API_KEY: 'your_actual_api_key_here',
      HOME: '/workspace/worker1'
    }
  }]
};
EOF
```

Create `worker2.config.js`:
```bash
cat > worker2.config.js << EOF
module.exports = {
  apps: [{
    name: 'wai-worker-2',
    script: '/workspace/worker2/wai',
    args: 'run',
    cwd: '/workspace/worker2',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      W_AI_API_KEY: 'your_actual_api_key_here',
      HOME: '/workspace/worker2'
    }
  }]
};
EOF
```

Create `worker3.config.js`:
```bash
cat > worker3.config.js << EOF
module.exports = {
  apps: [{
    name: 'wai-worker-3',
    script: '/workspace/worker3/wai',
    args: 'run',
    cwd: '/workspace/worker3',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      W_AI_API_KEY: 'your_actual_api_key_here',
      HOME: '/workspace/worker3'
    }
  }]
};
EOF
```

Create `worker4.config.js`:
```bash
cat > worker4.config.js << EOF
module.exports = {
  apps: [{
    name: 'wai-worker-4',
    script: '/workspace/worker4/wai',
    args: 'run',
    cwd: '/workspace/worker4',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      W_AI_API_KEY: 'your_actual_api_key_here',
      HOME: '/workspace/worker4'
    }
  }]
};
EOF
```

**Remember to replace `your_actual_api_key_here` with your real API key in all config files!**

### 10. Start Workers
```bash
# Start workers one by one with delays
pm2 start worker1.config.js
sleep 30  # Wait 30 seconds
pm2 start worker2.config.js
sleep 30
pm2 start worker3.config.js
sleep 30
pm2 start worker4.config.js
```

## Monitoring and Management

### Check Status
```bash
# View all workers
pm2 list

# Check individual worker logs
pm2 logs wai-worker-1 --lines 10
pm2 logs wai-worker-2 --lines 10
pm2 logs wai-worker-3 --lines 10
pm2 logs wai-worker-4 --lines 10

# Monitor live activity
pm2 logs  # Press Ctrl+C to exit
```

### Monitor Hardware
```bash
# GPU usage
nvidia-smi

# CPU and RAM
htop

# Disk usage
du -sh /workspace/worker*
```

### Restart Stuck Workers
```bash
# Restart specific worker
pm2 restart wai-worker-1

# Restart all workers
pm2 restart all

# Stop all workers
pm2 stop all

# Delete all workers (to start fresh)
pm2 delete all
```

## Expected Results

### Startup Phase (10-15 minutes)
- "Checking for updates..." loops
- Various Python errors (normal)
- "Text file busy" errors may occur initially
- **Be patient!** This is normal initialization

### Working Phase
- "Task in progress..."
- "Task completed in X seconds"
- "You earned 1 w.ai coin. You now have X w.ai coins"
- Occasional "Connection to server lost. Attempting to reconnect..."

### Performance Metrics
- **Earnings**: ~1 coin per 5-20 seconds per worker
- **Daily**: 2000+ coins per worker
- **GPU Usage**: 70-90%
- **RAM**: ~15MB per worker

## Troubleshooting

### Common Issues

**Infinite Update Loop**
- Wait 15+ minutes first
- Restart specific worker: `pm2 restart wai-worker-X`
- If persistent, run with 3 workers instead of 4

**Text File Busy Errors**
- Stop all workers: `pm2 stop all`
- Clear cache: `rm -rf /workspace/worker*/.*`
- Restart workers one by one

**Worker Keeps Crashing**
- Check logs: `pm2 logs wai-worker-X`
- Reduce workers to 2-3 instead of 4
- Check GPU memory with `nvidia-smi`

**Low GPU Usage**
- Add more workers (up to 6-8 for GTX 1080 Ti)
- Monitor temperature (keep under 80°C)

### Performance Tuning

**For RTX 3080/3090:**
- Can run 6-8 workers
- Increase `max_memory_restart` to '2G'

**For GTX 1070/1080:**
- Limit to 2-3 workers
- Monitor memory usage carefully

## Alternative Method: Screen Sessions

If PM2 causes issues, use screen sessions:

```bash
# Worker 1
screen -S worker1
export W_AI_API_KEY=your_actual_api_key_here
wai run
# Press Ctrl+A then D to detach

# Worker 2
screen -S worker2
export W_AI_API_KEY=your_actual_api_key_here  
wai run
# Press Ctrl+A then D to detach

# Continue for workers 3 and 4...

# List sessions
screen -ls

# Reattach to session
screen -r worker1
```

## Success Indicators

✅ **Your setup is working when you see:**
- All workers showing "online" in `pm2 list`
- Regular "You earned X w.ai coin" messages
- GPU utilization 70%+
- Stable uptime (hours without restart)

❌ **Issues that need attention:**
- Workers showing "errored" status
- No coin earnings for 30+ minutes
- GPU utilization under 30%
- Frequent restarts

## Final Notes

- **Start conservatively**: Begin with 2 workers, then scale up
- **Monitor initially**: Watch logs for first hour
- **Be patient**: Initial setup takes 10-15 minutes per worker
- **Temperature**: Keep GPU under 80°C
- **Backup configs**: Save your working PM2 configurations

## Tested Configuration

This guide was tested and verified on:
- **GPU**: GTX 1080 Ti (11GB VRAM)
- **Server**: Ubuntu 22.04 LTS
- **Results**: 4 workers, 2000+ coins/day per worker
- **Uptime**: 11+ hours stable operation

---

**Good luck with your w.ai mining operation!** 🚀
