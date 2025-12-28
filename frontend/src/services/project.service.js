import axios from '../config/axios';

export const createProject = async (name) => {
    try {
        const res = await axios.post('/projects/create', { name });
        return res.data;
    } catch (err) {
        throw err;
    }
}

export const getAllProjects = async () => {
    try {
        const res = await axios.get('/projects/all');
        return res.data.projects;
    } catch (err) {
        throw err;
    }
}

export const addUserToProject = async (projectId, users) => {
    try {
        const res = await axios.put('/projects/add-user', {
            projectId,
            users
        });
        return res.data;
    } catch (err) {
        throw err;
    }
}

export const getProjectById = async (projectId) => {
    try {
        const res = await axios.get(`/projects/get-project/${projectId}`);
        return res.data.project;
    } catch (err) {
        throw err;
    }
}
