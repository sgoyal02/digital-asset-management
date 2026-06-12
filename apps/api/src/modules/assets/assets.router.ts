import { Router } from 'express';
import multer from 'multer';
import { AssetController } from './assets.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();
const assetsController = new AssetController();
const upload = multer({ storage: multer.memoryStorage() });
router.get('/', authMiddleware, assetsController.getAssets);
router.post('/upload', authMiddleware, upload.single('file'), assetsController.uploadAsset);

export { router as assetsRouter };