import axios from '../config/axios';

export const getAllUsers = async () => {
    try {
        const res = await axios.get('/users/all');
        return res.data.users;
    } catch (err) {
        throw err;
    }
}
