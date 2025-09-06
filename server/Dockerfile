FROM node:23-alpine

WORKDIR /src

COPY package* .

RUN npm install

COPY . .

EXPOSE 5173

CMD [ "npm" , "run" , "dev" ]