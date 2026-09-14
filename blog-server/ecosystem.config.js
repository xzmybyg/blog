module.exports = {
  apps: [
    {
      name: process.env.PM2_APP_NAME || 'blog',
      script: './bin/www',
      cwd: __dirname,
      autorestart: true,
      env_production: {
        NODE_ENV: 'production',
        RELEASE_SHA: process.env.RELEASE_SHA,
      },
    },
  ],
}
