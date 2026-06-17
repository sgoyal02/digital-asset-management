import { Router } from 'express';
import multer from 'multer';
import { AssetController } from './assets.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();
const assetsController = new AssetController();
const upload = multer({ storage: multer.memoryStorage() });
router.get('/', authMiddleware, assetsController.getAssets);
router.get('/:id', authMiddleware, assetsController.getAssetById);
router.post('/upload', authMiddleware, upload.single('file'), assetsController.uploadAsset);
router.patch('/:id/review',authMiddleware, assetsController.reviewAsset);


export { router as assetsRouter };