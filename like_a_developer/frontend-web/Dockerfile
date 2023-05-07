FROM node:lts-alpine as development

WORKDIR /app

COPY package*.json ./

RUN yarn install --frozen-lockfile

COPY . .

CMD ["yarn", "start"]

FROM node:lts-alpine as production

WORKDIR /app

COPY package*.json ./

RUN yarn install --frozen-lockfile --production

COPY . .

RUN yarn build

EXPOSE 3000

CMD ["yarn", "start"]
