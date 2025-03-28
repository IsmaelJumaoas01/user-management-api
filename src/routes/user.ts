import { Router } from 'express';
import { Repository } from 'typeorm';
import { AppDataSource } from '../_helpers/database';
import { User } from '../users/user.entity';
import { StatusCodes } from 'http-status-codes';

const router = Router();
const userRepository = AppDataSource.getRepository(User);

// Get user by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const user = await userRepository.findOneBy({ id });

        if (!user) {
            res.status(StatusCodes.NOT_FOUND).json({ message: 'User not found' });
            return;
        }

        res.status(StatusCodes.OK).json(user);
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error retrieving user' });
    }
});

// Get user by email
router.get('/search/email', async (req, res) => {
    try {
        const { email } = req.query;
        if (!email || typeof email !== 'string') {
            res.status(StatusCodes.BAD_REQUEST).json({ message: 'Email is required' });
            return;
        }

        const user = await userRepository.findOneBy({ email });

        if (!user) {
            res.status(StatusCodes.NOT_FOUND).json({ message: 'User not found' });
            return;
        }

        res.status(StatusCodes.OK).json(user);
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error retrieving user' });
    }
});

export default router;
