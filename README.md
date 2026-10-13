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

2. **Clone The Repository**

	```bash
	git clone git@github.com:Lukutoukat/BookClub.git
 	```

3. **Install Dependencies**

	Backend:

	```bash
	cd bookclub-front
	npm install
	```

	Frontend:

	```bash
	cd ../bookclub-backend
	npm install
	```

4. **Generate Prisma Client**

	In bookclub-backend run:
	```bash
	npx prisma generate
	```

5. **Set Up Environment Variables**

	For local development put this in a `.env` file in bookclub-backend:

	```
	DATABASE_URL="DATABASE_URL=postgresql://username:password@localhost:5432/clubdb"
	SECRET=putsomekindapasswordhere
	```

6. **Run the Application with Docker**

    ```bash
    docker compose up --build
    ```

    The application should be available at http://localhost:13000

<hr>

### Localization
The application uses the `react-i18next` library for its localization. English translation is the base of other translations.

#### How to use
1. Add new key/value translation to appropriate JSON file in `boocklub-front/src/locales/` <br>
Example in common.json:
```json
{
	"component": {
		"title": "Component"
	}
}
```

2. Use the t() function to reference translations and replace hardcoded strings. <br>
Example in Component.tsx:
```tsx
import { useTranslation } from 'react-i18next'
const Component = () => {
    const { t } = useTranslation() // no parameters uses default 'common' namespace

    return <h1>{t('component.title')}</h1> // nested key access to value
}
```

For more information, visit https://react.i18next.com/

#### Adding additional languages
1. Duplicate and rename the _en_ (english) directory.
2. Translate all of the needed values inside into the target language.
3. Import the new translation files in `bookclub-front/src/utils/i18n.ts` and add them to the resources according to the rest. The app handles the language switching.

<hr>

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
