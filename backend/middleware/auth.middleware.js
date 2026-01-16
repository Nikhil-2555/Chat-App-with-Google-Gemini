
import jwt from "jsonwebtoken";
import redisClient from "../services/redis.service.js";
import userModel from "../models/user.model.js";

export const authUser = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).send({ error: 'unauthorized user' });
        }

        const isBlacklisted = await redisClient.get(token);

        if (isBlacklisted) {
            return res.status(401).send({ error: 'unauthorized access' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await redisClient.get(`user:${decoded.email}`);
        if (user) {
            req.user = JSON.parse(user);
        } else {
            const dbUser = await userModel.findOne({ email: decoded.email });
            if (!dbUser) {
                return res.status(401).send({ error: 'unauthorized user' });
            }
            req.user = dbUser;
        }

        next();
    } catch (error) {
        console.log(error);

        if (error.name === 'TokenExpiredError') {
            return res.status(401).send({ error: 'Token has expired. Please login again.' });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).send({ error: 'Invalid token. Please login again.' });
        }

        res.status(401).send({ error: 'Authentication failed.' });
    }
}