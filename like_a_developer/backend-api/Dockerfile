FROM node:lts-alpine As development

WORKDIR /app

COPY package*.json yarn.lock ./

RUN yarn install

COPY . .

RUN yarn build

#
FROM node:lts-alpine as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /app

COPY package*.json ./

RUN yarn install 

COPY . .

COPY --from=development /app/dist ./dist

CMD ["node", "dist/main"]