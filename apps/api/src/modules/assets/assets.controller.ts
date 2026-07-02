import { Response } from "express";
import { AuthReq } from "../../middleware/auth.middleware";
import { sendError, sendSuccess } from "../../response";
import { AssetService } from "./assets.service";
import { prisma } from "../../lib/prisma";
import { markAssetStatus } from "../../types/helper";

const assetService = new AssetService();
export class AssetController{
async getAssets(req:AuthReq, res:Response){
    try {
      const userId = req.user!.id;
      const role = req.user!.role;
      const search = req.query.search as string;
      const assets = await assetService.getAssets(userId, role, search);
      sendSuccess(res, assets, "assets listing fetch success");
    } catch (err:unknown) {
      const errMsg = err as { data: {message:string, statusCode?:number}};
        const code= errMsg.data.statusCode || 500;
        return sendError(res, errMsg.data.message, code);
    }
}

async getAssetById(req:AuthReq, res:Response) {
  try {
    const userId= req.user!.id;
    const role= req.user!.role;
    const assetId= Number(req.params.id);
    if (isNaN(assetId)) {
      return sendError(res, 'Invalid asset id', 400);
    }
    const asset = await assetService.getAssetById(assetId, userId, role);
    sendSuccess(res, asset, 'asset detail fetch success');
  } catch (err: unknown) {
    const errMsg = err as { data: {message:string, statusCode?:number}};
    const code = errMsg.data.statusCode || 500;
    return sendError(res, errMsg.data.message, code);
  }
}

async uploadAsset(req: AuthReq, res:Response) {
  try {
    if (!req.file) return sendError(res, "No file attached", 400);
    const user = req.user!;
    const role= req.user!.role;
    const newAsset = await assetService.uploadAsset(user, req.file);
    const msg= role==='ADMIN' ? 'asset uploaded and approved' : 'asset upload success'
    sendSuccess(res, newAsset, msg, 201);
  } catch (err: unknown) {
    console.log("err catch: ", err);
    const errMsg = err as { data: {message:string, statusCode?:number}};
    const code= errMsg.data.statusCode || 500;
    return sendError(res, errMsg.data.message, code);
  }
}

async reqReview(req:AuthReq, res:Response) {
  try {
    const assetId= Number(req.params.id);
    const userId= req.user!.id;
    const role= req.user!.role;
    const asset= await prisma.asset.findUnique({where:{id:Number(assetId)}});
    if (!asset)return sendError(res, "asset not found", 404);
    if (asset.ownerId!== userId)return sendError(res, "own asset review allowed", 403);
    if (asset.status !== 'UPLOADED') return sendError(res, "review for uploaded status asset only", 400);

    await markAssetStatus(Number(assetId), role==='ADMIN' ? "APPROVED": 'UNDER_REVIEW');
    sendSuccess(res, null, "asset sent for review", 201);
  } catch (err: unknown) {
    console.log("err catch: ", err);
    const errMsg = err as { data: {message:string, statusCode?:number}};
    const code= errMsg.data.statusCode || 500;
    return sendError(res, errMsg.data.message, code);
  }
}

async reviewAsset(req:AuthReq, res: Response) {
    try {
      const reviewerId= req.user!.id;
      const role= req.user!.role;
      const assetId= Number(req.params.id);
      const {action}= req.body;
      if (!['APPROVED', 'REJECTED'].includes(action)) {
        return sendError(res, 'action not valid', 400);
      }
      const updated = await assetService.reviewAsset(assetId,reviewerId, role, action);
      console.log("updated: ", updated);
      sendSuccess(res,updated,`asset ${action.toLowerCase()} success`);
    } catch(err:unknown) {
      const errMsg = err as { data: {message:string, statusCode?:number}};
      const code= errMsg.data.statusCode || 500;
      return sendError(res, errMsg.data.message, code);
    }
  }
}