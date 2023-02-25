FROM node:16-alpine

RUN apk add --update --no-cache \
    make \
    g++ \
    jpeg-dev \
    cairo-dev \
    giflib-dev \
    pango-dev \
    libtool \
    autoconf \
    automake

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npx prisma generate

CMD ["node","index.js"]
