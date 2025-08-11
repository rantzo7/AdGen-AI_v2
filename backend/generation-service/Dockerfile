FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

# Install Chromium dependencies for Puppeteer
RUN apk add --no-cache udev ttf-freefont chromium

COPY . .

RUN npm run build

EXPOSE 3003

CMD ["npm", "start"]
