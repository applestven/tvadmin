module.exports = {
    apps: [
        {
            name: 'tv-admin',
            script: 'node_modules/next/dist/bin/next',
            args: 'start -p 3060',
            cwd: './',
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '1G',
            env: {
                NODE_ENV: 'production',
                PORT: 3060
            },
            env_development: {
                NODE_ENV: 'development',
                PORT: 3060
            },
            // 日志配置
            log_date_format: 'YYYY-MM-DD HH:mm:ss',
            error_file: './logs/pm2-error.log',
            out_file: './logs/pm2-out.log',
            merge_logs: true,
            // 重启策略
            exp_backoff_restart_delay: 100,
            max_restarts: 10,
            min_uptime: '10s',
            // 优雅关闭
            kill_timeout: 5000,
            wait_ready: true,
            listen_timeout: 10000
        }
    ],

    // 部署配置（可选，用于远程部署）
    // deploy: {
    //     production: {
    //         user: 'ubuntu',
    //         host: '43.139.236.50',
    //         ref: 'origin/main',
    //         repo: 'git@github.com:applestven/tvadmin.git',
    //         path: '/home/ubuntu/apps/tvadmin',
    //         'pre-deploy-local': '',
    //         'post-deploy': 'pnpm install && pnpm build && pm2 reload ecosystem.config.js --env production',
    //         'pre-setup': ''
    //     },
    //     private: {
    //         user: 'apple',
    //         host: '192.168.191.168',
    //         ref: 'origin/main',
    //         repo: 'git@github.com:applestven/tvadmin.git',
    //         path: '/home/apple/apps/tvadmin',
    //         'pre-deploy-local': '',
    //         'post-deploy': 'pnpm install && pnpm build && pm2 reload ecosystem.config.js --env production',
    //         'pre-setup': ''
    //     }
    // }
}
