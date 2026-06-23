import { Router } from 'express';
import { ReportController } from './reports.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router= Router();
const reportController= new ReportController();
router.get('/usage',authMiddleware, reportController.getUsageTrends);
router.get('/duplication',authMiddleware, reportController.getDuplicates);

export {router as reportRouter};