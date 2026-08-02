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
        NEXT_PUBLIC_API_URL: "https://api.campdejesusbelairfizi.com/api/v1",
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
        BACKEND_URL: "https://api.campdejesusbelairfizi.com",
        MEDIA_BASE_URL: "https://api.campdejesusbelairfizi.com",
        MEDIA_ROOT: "/var/lib/cecj/media",
        MEDIA_TEMP_ROOT: "/var/lib/cecj/.cecj-media-tmp",
        UPLOAD_REQUEST_TIMEOUT_MS: "2700000",
        HTTP_KEEP_ALIVE_TIMEOUT_MS: "65000",
        SITE_URL: "https://campdejesusbelairfizi.com",
      },
    },
  ],
};
