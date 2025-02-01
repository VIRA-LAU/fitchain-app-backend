# Fitchain App NestJS Backend

## Setting up the project

Clone the repository:

```
git clone https://github.com/VIRA-LAU/fitchain-app-backend.git
```

Add the hidden `.env` file with the required environment variables:

```
NODE_ENV=
SERVER_URL=
AI_SERVER_URL=
DATABASE_URL=
JWT_SECRET=
GOOGLE_MAPS_API_KEY=
NODEMAILER_EMAIL=
NODEMAILER_PASSWORD=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
S3_REGION=
S3_BUCKET=
S3_AI_BUCKET=
NOTIFICATIONS_TOKEN=
```

Switch to the `dev` branch:
```
cd fitchain-app-backend
git checkout -b dev
git pull origin dev
```

## Starting the backend server

### Using Docker

The backend can be started in a Docker container by running:

```
docker compose up -d
```

### On host PC

To run the backend locally without Docker:

Install dependencies:
```
npm install
```

In case of an error relating to `scripts/preinstall-entry.js`, upgrade your node version:
```
npm cache clean -f
npm install -g n
sudo n stable
```

Launch the Prisma docker containers (in detached mode) for the database:

```
docker-compose up -d dev-db test-db
```

Start the database and migrate to apply latest changes:
```
npm run db:dev:restart
npx prisma migrate dev
```

Run the backend server:
```
npm start
```

To visualize the database, run `npx prisma studio`.
