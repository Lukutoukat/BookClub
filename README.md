[![codecov](https://codecov.io/gh/Lukutoukat/BookClub/branch/main/graph/badge.svg?token=QA8RYX5HZM)](https://codecov.io/gh/Lukutoukat/BookClub)

# BookClubApp

### Introduction
<img align="right" width="" height="150" src="./bookclub-front/src/assets/logo.png">
BookClubApp is developed for all readers, who are looking for a way to manage their book clubs. BookClubApp makes it possible for book clubs to save, suggest and vote books. Users can create their own clubs or join existing ones with an invite code, that the admin of the club can share. The idea of the application is to make managing book clubs easier, so that people are more encouraged to make reading a hobby they can enjoy together with others.
<br>
<br>

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
