import { Router } from 'express';
import { AppDataSource } from '../_helpers/database';
import { User } from '../entities/User';
import bcrypt from 'bcryptjs';
import { StatusCodes } from 'http-status-codes';
import Joi from 'joi';

const router = Router();

// Validation schema for user creation
const userSchema = Joi.object({
    username: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
});

// Create user
router.post('/', async (req, res) => {
    try {
        // Validate request body
        const { error } = userSchema.validate(req.body);
        if (error) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                error: error.details[0].message
            });
        }

        const { username, email, password } = req.body;

        // Check if user already exists
        const userRepository = AppDataSource.getRepository(User);
        const existingUser = await userRepository.findOne({
            where: [{ email }, { username }]
        });

        if (existingUser) {
            return res.status(StatusCodes.CONFLICT).json({
                error: 'User with this email or username already exists'
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const user = new User();
        user.username = username;
        user.email = email;
        user.password = hashedPassword;

        // Save user to database
        await userRepository.save(user);

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;

        return res.status(StatusCodes.CREATED).json({
            message: 'User created successfully',
            user: userWithoutPassword
        });

    } catch (error) {
        console.error('Error creating user:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: 'Internal server error'
        });
    }
});

export default router;
