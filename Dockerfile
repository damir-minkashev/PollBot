FROM node:17.9.0-alpine

WORKDIR /nest

COPY package.json ./

RUN npm install

COPY . .

COPY ./dist ./dist

CMD ["npm", "run", "start"]
