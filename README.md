# BookClubApp

### Introduction

BookClubApp helps book clubs propose, rank, and vote on books together.

### Technologies

#### Backend

- [Node.js](https://nodejs.org/en/learn/getting-started/introduction-to-nodejs)
- [Express.js](https://expressjs.com/en/5x/api.html)
- [Prisma](https://www.prisma.io/docs)
- [Postgres](https://www.postgresql.org/)

#### Frontend

- [React](https://react.dev/learn)
- [Vite](https://vite.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)

#### Testing

- [Jest](https://jestjs.io/)
- [Vitest](https://vitest.dev/)

## Development

1. **Install Required Tools**
	- [Node.js and npm](https://nodejs.org/)
	- [Docker and Docker Compose](https://www.docker.com/)

2. **Install Dependencies**

	Backend:

	```bash
	cd bookclub-backend
	npm install
	```

	Frontend:

	```bash
	cd bookclub-front
	npm install
	```

3. **Set Up Environment Variables**

	For local development put this in a `.env` file in bookclub-backend:

	```
	DATABASE_URL=postgresql://username:password@localhost:5432/clubdb
	POSTGRES_HOST=localhost
	POSTGRES_PASSWORD=password
	REQUEST_ORIGIN=localhost:3003
	```

4. **Run the Application with Docker**

    ```bash
    docker compose up --build
    ```

    The application should be available at http://localhost:13000


### Tests and Linting

Backend (bookclub-backend):

```bash
npm test
npm run coverage
npm run lint
```

Frontend (bookclub-front):

```bash
npm test
npm run coverage
npm run lint
```
