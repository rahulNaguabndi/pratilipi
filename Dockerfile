FROM node:10.1.0

# Create app directory
WORKDIR /usr/src/app

COPY . .

RUN npm install


EXPOSE 8084

CMD [ "node", "app.js" ]
