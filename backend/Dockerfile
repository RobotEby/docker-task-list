FROM node:18-alpine

# WORKDIR must match the bind mount target in docker-compose.yml
# (./backend:/app/backend) so local edits are reflected inside the container.
WORKDIR /app/backend

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 5000

HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=5 \
  CMD node -e "fetch('http://localhost:5000/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["npm", "start"]
