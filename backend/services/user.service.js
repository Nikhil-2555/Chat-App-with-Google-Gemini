import userModel from '../models/user.model.js';


export const createUser = async ({
    email, password, username
}) => {
    if (!email || !password || !username) {
        throw new Error('Email, password and username are required');
    }

    const hashedPassword = await userModel.hashPassword(password);

    try {
        const user = await userModel.create({
            username,
            email,
            password: hashedPassword
        });
        return user;
    } catch (error) {
        if (error.code === 11000) {
            throw new Error('Email already exists');
        }
        throw error;
    }
}

export const getAllUsers = async ({ userId }) => {
    const users = await userModel.find({
        _id: { $ne: userId }
    });
    return users;
}