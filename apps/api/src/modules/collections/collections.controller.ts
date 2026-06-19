import { Response } from "express";
import { AuthReq } from "../../middleware/auth.middleware";
import { CollectionService } from "./collections.service";
import { sendError, sendSuccess } from "../../response";

const collectionService= new CollectionService();
export class CollectionController{
    async getCollections(req:AuthReq, res:Response){
     try {
      const userId= req.user!.id;
      const role= req.user!.role;
      const excludeId= req.query.exclude?Number(req.query.exclude) : undefined; //curr col not include
      const collections= await collectionService.getAllCollections(userId,role, excludeId);
      sendSuccess(res, collections, "Collections fetched successfully");
    } catch (err: any) {
      const code= err.statusCode || 500;
      return sendError(res,err.message, code);
    }
  }
 
  async createCollection(req:AuthReq, res:Response) {
        console.log("req post: ", req.body)
    try {
      const userId= req.user!.id;
      const role= req.user!.role;
      const {name,desc,isShared}= req.body;
      if (!name||!name.trim()) {
        return sendError(res,"collection name required", 400);
      }
      const data = await collectionService.createCollection(userId,role,name,desc,isShared);
      sendSuccess(res,data,"collection created success", 201);
    } catch (err: any) {
      const code = err.statusCode || 500;
      return sendError(res, err.message, code);
    }
  }

  async getCollectionDetail(req:AuthReq, res:Response) {
    try {
      const userId= req.user!.id;
      const role= req.user!.role;
      const cId = Number(req.params.id);
    if (isNaN(cId)) {
        return sendError(res, "invalid collection id", 400);
    }
    const data = await collectionService.getCollectionDetail(cId,userId,role);
    console.log("data detail collect: ", data);
    sendSuccess(res, data, "collection detail fetch success");
    } catch(err:any) {
    const code= err.statusCode || 500;
    return sendError(res, err.message, code);
    }
  }

  async delCollection(req:AuthReq, res:Response) {
    try {
      const userId= req.user!.id;
      const role= req.user!.role;
      const cId = Number(req.params.id);
    if (isNaN(cId)) {
     return sendError(res,"invalid collection id", 400);
    }
    const result = await collectionService.delCollectoin(cId,userId, role);
    sendSuccess(res, result, "collection del success");
    } catch(err:any) {
      const code= err.statusCode|| 500;
      return sendError(res, err.message, code);
    }
  }

  async addAssetToCollection(req:AuthReq, res:Response) {
    try {
      const userId= req.user!.id;
      const role= req.user!.role;
      const cId= Number(req.params.id);
      const {assetIds} = req.body;
      console.log('aIds:', assetIds, typeof assetIds[0]);
      if (!Array.isArray(assetIds)||!assetIds.length) {
        return sendError(res,"asset ids not avail", 400);
      }
      const result = await collectionService.addAssets(cId,assetIds, userId, role);
      sendSuccess(res,result, "asset add in collection success");
    } catch (err:any) {
      const code= err.statusCode || 500;
      return sendError(res,err.message, code);
    }
  }
 
  async delAssetInCollection(req:AuthReq,res:Response) {
    try {
      const userId= req.user!.id;
      const role= req.user!.role;
      const cId= Number(req.params.id);
      const aId= Number(req.params.assetId);
 
      const result = await collectionService.delAsset(cId,aId,userId, role);
      sendSuccess(res,result, "asset rmeove success");
    } catch (err:any) {
      const code= err.statusCode|| 500;
      return sendError(res,err.message, code);
    }
  }
 
  async moveAsset(req:AuthReq, res:Response) {
    try {
      const userId= req.user!.id;
      const role= req.user!.role;
      const cId= Number(req.params.id);
      const aId= Number(req.params.assetId);
      const {destId} = req.body;
      if (!destId){
        return sendError(res,"invalid req",400);
      }
      const result= await collectionService.moveAsset(cId, aId, Number(destId), userId, role);
      sendSuccess(res,result, "asset move success");
    } catch(err:any) {
      const code= err.statusCode|| 500;
      return sendError(res,err.message,code);
    }
  }
 
}