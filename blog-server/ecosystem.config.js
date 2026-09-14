module.exports = {
  apps: [
    {
      name: 'blog',
      script: './bin/www',
      cwd: __dirname,
      autorestart: true,
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
}
