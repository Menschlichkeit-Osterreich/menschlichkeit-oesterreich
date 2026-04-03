module.exports = {
  apps: [{
    name: 'openwolf-daemon',
    script: 'npx',
    args: 'openwolf daemon start',
    cwd: '../../',
    autorestart: true,
    watch: false,
    max_memory_restart: '200M',
    env: {
      NODE_ENV: 'production',
      PUPPETEER_EXECUTABLE_PATH: process.env.PUPPETEER_EXECUTABLE_PATH || ''
    },
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    error_file: './logs/openwolf-error.log',
    out_file: './logs/openwolf-out.log',
  }]
};
