npm install -g serve

pm2 start "serve dist -l 3003 --single" --name vite-prod
