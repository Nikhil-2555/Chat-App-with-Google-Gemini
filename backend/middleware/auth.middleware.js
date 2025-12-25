
import jwt from "jsonwebtoken";
import redisClient from "../services/redis.service.js";

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
        req.user = decoded;
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