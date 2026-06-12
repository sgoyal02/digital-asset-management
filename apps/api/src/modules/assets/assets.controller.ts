import { Response } from "express";
import { AuthReq } from "../../middleware/auth.middleware";
import { sendError, sendSuccess } from "../../response";
import { AssetService } from "./assets.service";

const assetService = new AssetService();
export class AssetController{
async getAssets(req:AuthReq, res:Response){
    try {
      const userId = req.user!.id;
      const role = req.user!.role;
      const search = req.query.search as string;
      const assets = await assetService.getAssets(userId, role, search);
      sendSuccess(res, assets, "assets listing fetch success");
    } catch (err:any) {
        const code= err.statusCode || 500;
        return sendError(res, err.message, code);
    }
}

async uploadAsset(req: AuthReq, res:Response) {
  try {
    if (!req.file) return sendError(res, "No file attached", 400);
    const user = req.user!;
    const role= req.user!.role;
    const newAsset = await assetService.uploadAsset(user, req.file,);
    const msg= role==='ADMIN' ? 'asset uploaded and approved' : 'asset upload success-pending review)'
    sendSuccess(res, newAsset, msg, 201);
  } catch (err: any) {
    console.log("err catch: ", err);
    const code= err.statusCode || 500;
    return sendError(res, err.message, code);
  }
}
}