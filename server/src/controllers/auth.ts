import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "../config/config";
import User, { IUser } from "../models/user";

const generateToken = (userId: string): string => {
  return jwt.sign({ id: userId }, config.jwtSecret, {
    expiresIn: "7d",
  });
};

export const register = async (req: Request, res: Response): Promise<any> => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ error: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser: IUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    return res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Registration error:", error);

    return res
      .status(500)
      .json({ error: "Registration failed due to an internal server error" });
  }
};

export const login = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const token = generateToken(user.id.toString());

    return res.json({ token });
  } catch (error) {
    console.error("Login error:", error);

    return res
      .status(500)
      .json({ error: "Login failed due to an internal server error" });
  }
};
