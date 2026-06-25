import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { JobsController } from './jobs.controller';

const router = Router();
const jobsController = new JobsController();
router.get('/', authMiddleware, jobsController.getJobs);



export { router as jobRouter };