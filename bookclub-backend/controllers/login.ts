import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { prisma } from '../db.ts';
import dotenv from 'dotenv';
import express, { type Request, type Response } from 'express';

const loginRouter = express.Router();
dotenv.config();

interface User {
	id?: string;
	email: string;
	name: string;
	password?: string;
	password_hash?: string;
}

interface LogIn {
	username?: string;
	password?: string;
}

loginRouter.post('/', async (req: Request, res: Response) => {
	const { username, password } = req.body as LogIn;
	if (!password) {
		return res.status(401).end();
	}

	const user: User | null = await prisma.user.findUnique({
		where: {
			name: username,
		},
	});

	const passwordCorrect: boolean =
		user === null ? false : await bcrypt.compare(password, user.password_hash!);

	if (!(user && passwordCorrect)) {
		return res.status(401).json({
			error: 'Invalid username or password.',
		});
	}

	const userForToken = {
		username: user.name,
		id: user.id,
	};
	if (!process.env.SECRET) {
		throw new Error('Error with authentication.');
	}
	const token = jwt.sign(userForToken, process.env.SECRET, {
		expiresIn: 2629800,
	});

	res.status(200).send({ token, email: user.email, name: user.name });
	return;
});

export default loginRouter;
