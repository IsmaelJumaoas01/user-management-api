import { Repository } from "typeorm";
import { AppDataSource } from "./src/_helpers/database";
import { User } from "./src/users/user.entity";
import { StatusCodes } from "http-status-codes";
import bcrypt from "bcryptjs";
import { Request, Response } from "express";

const userRepository = AppDataSource.getRepository(User);

export const createUser = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message:
          "All fields are required: firstName, lastName, email, and password",
      });
    }

    // Check if user already exists
    const existingUser = await userRepository.findOneBy({ email });
    if (existingUser) {
      return res.status(StatusCodes.CONFLICT).json({
        message: "User with this email already exists",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = userRepository.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    // Save user to database
    await userRepository.save(user);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return res.status(StatusCodes.CREATED).json({
      message: "User created successfully",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Error creating user",
    });
  }
};
