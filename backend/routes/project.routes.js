import { Router } from 'express';
import { body } from 'express-validator';
import * as projectController from '../controllers/project.controller.js';
import { authUser } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/create',
    authUser,
    body('name').isString().withMessage('name is required'),
    projectController.createProject
)

router.get('/all',
    authUser,
    projectController.getAllProject
)

router.put('/add-user',
    authUser,
    body('projectId').isString().withMessage('Project ID is required'),
    body('users').isArray({ min: 1 }).withMessage('Users must be an array').custom((users) => users.every(user => typeof user === 'string')).withMessage('Each user must be a string'),
    projectController.addUserToProject
)

router.get('/get-project/:projectId',
    authUser,
    projectController.getProjectById
)

export default router;

// trusen gay
// loda lusan