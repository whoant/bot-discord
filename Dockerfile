FROM node:16.13.2-alpine3.14

WORKDIR /app
COPY package*.json ./
COPY yarn.lock ./

ENV PREFIX=@
ENV TOKEN_VOICE=
ENV TOKEN_GOOGLE=


RUN yarn
COPY . .
CMD ["yarn", "start"]