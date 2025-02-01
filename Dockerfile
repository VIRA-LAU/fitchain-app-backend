FROM node:20-alpine

# Open SSL is required for Prisma to work
RUN apk add --no-cache openssl

COPY . /app
WORKDIR /app

RUN npm install

RUN sed -i 's/localhost/dev-db/g' .env
RUN sed -i 's/localhost/test-db/g' .env.test

CMD [ "/bin/sh", "-c", " \
    npm run prisma:dev:deploy && \
    npm run prisma:dev:load && \
    npx prisma migrate dev && \
    npm start" ]