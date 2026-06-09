const path = require("path")
const root = __dirname

module.exports = {
  apps: [
    {
      name: "cecj-frontend",
      cwd: path.join(root, "apps/frontend"),
      script: path.join(root, "apps/frontend/node_modules/next/dist/bin/next"),
      args: "start",
      exec_mode: "fork",
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        NEXT_PUBLIC_API_URL: "https://api.dev.moseskalunga.com",
      },
    },
    {
      name: "cecj-backend",
      cwd: path.join(root, "apps/backend"),
      script: path.join(root, "apps/backend/dist/main.js"),
      exec_mode: "fork",
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: 3001,
      },
    },
  ],
};
