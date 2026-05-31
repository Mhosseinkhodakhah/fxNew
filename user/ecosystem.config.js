module.exports = {
  apps: [
    {
      name: 'user-service',
      script: 'dist/src/main.js',
      instances: 1,
      exec_mode: 'cluster',
    },
  ],
};
