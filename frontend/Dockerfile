FROM node:20-alpine

RUN mkdir -p /app/frontend && chown -R node:node /app/frontend

WORKDIR /app/frontend

USER node

COPY --chown=node:node package*.json ./

RUN npm install

ARG VITE_API_URL

ENV VITE_API_URL=$VITE_API_URL

COPY --chown=node:node . .

EXPOSE 8080

CMD ["npm", "run", "dev", "--", "--host"]