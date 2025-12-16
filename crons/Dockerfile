FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./
# If you add dependencies later, uncomment the next line
# RUN npm install

COPY . .

# The command that runs when the cron triggers
CMD ["node", "index.js"]
