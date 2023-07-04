# Fitchain App NestJS Backend

## How to Install Locally

Clone the repository then add the hidden .env file:
```
git clone https://github.com/VIRA-LAU/fitchain-app-backend.git
```

Switch to the dev branch:
```
cd fitchain-app-backend
git checkout -b dev
git pull origin dev
```

Install dependencies:
```
npm install
```

In the case of an error relating to *scripts/preinstall-entry.js*, upgrade your node version:
```
npm cache clean -f
npm install -g n
sudo n stable
```

Launch the docker containers (in detached mode) for the database:
```
docker-compose up -d
```

Start the database and migrate to apply latest changes:
```
npm run db:dev:restart
npx prisma migrate dev
```

Run the server:
```
npm start
```

To visualize the database, run `npx prisma studio`.
