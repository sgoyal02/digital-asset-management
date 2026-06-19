import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { CollectionController } from "./collections.controller";

const router = Router();
const collectionController= new CollectionController();
router.get('/', authMiddleware, collectionController.getCollections);
router.post('/', authMiddleware, collectionController.createCollection);
router.get('/:id', authMiddleware, collectionController.getCollectionDetail);
router.delete('/:id', authMiddleware, collectionController.delCollection);
router.post('/:id/assets', authMiddleware, collectionController.addAssetToCollection);
router.delete('/:id/assets/:assetId', authMiddleware, collectionController.delAssetInCollection);
router.patch('/:id/assets/:assetId/move', authMiddleware, collectionController.moveAsset);

export {router as collectionRouter};