import { Prisma } from "../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { HttpError } from "../../types/helper";

export class CollectionService{
 async getAllCollections(userId:number,role: string,excludeId?: number) {
    let where:Prisma.CollectionWhereInput;
    if(role === "ADMIN") {where = {}} 
    else {
      where = {
        OR:[{ ownerId: userId, isShared: false },{ isShared: true }] //own or teams
      };
    }
    if(excludeId) {
      where= {AND:[where,{id:{not:excludeId}}]};
    }
    const listData= await prisma.collection.findMany({
      where, include:{
        owner:{select:{name: true}},
        _count:{select:{assets: true}},
      },
      orderBy:{createdAt:"desc"},
    });

    return JSON.parse(JSON.stringify(listData,(_,v) => 
        (typeof v=== "bigint"?v.toString(): v)));
  }
 
  
  async createCollection(userId: number,role: string,name: string,description?: string,isShared?: boolean) {
    const allowShare= role=== "ADMIN"|| role=== "MANAGER";
    const isShare= allowShare? !!isShared: false;
    const newData= await prisma.collection.create({
      data:{
        name:name.trim(),
        description:description?.trim()|| null,
        isShared:isShare,
        ownerId:userId,
      },
      include: {
        owner:{select:{name: true}},
        _count: {select:{assets: true}},
      },
    });
 
    return JSON.parse(JSON.stringify(newData, (_, v) => 
        (typeof v=== "bigint"? v.toString(): v)));
  }

  async getCollectionDetail(cId: number,userId: number,role: string) {
    const cData = await prisma.collection.findUnique({
      where:{id:cId},
    });
    if(!cData) {
      throw new HttpError("collection not found", 404);
    }
    if(!cData.isShared&& cData.ownerId !== userId && role !== "ADMIN") {
      throw new HttpError("collection view-access denied", 403); //for admin/own only
    }
 
    const rows= await prisma.assetCollection.findMany({
      where:{collectionId:cId,
        // asset: assetExp,
      },
      include:{
        asset:{select:{
            id: true,
            fileName: true,
            mimeType: true,
            size: true,
            status: true,
            thumbnailUrl: true,
          },
        },
      },
    });
    const assetsData = rows.map((row) => row.asset);
    return JSON.parse(JSON.stringify({cData,assetsData}, (_, v) => 
        (typeof v=== "bigint"? v.toString(): v)));
  }

  async delCollectoin(cId: number,userId: number,role: string) {
    const cData = await prisma.collection.findUnique({where:{id:cId}});
    if(!cData) {
      throw new HttpError("collection not found", 404);
    }
    if(cData.ownerId!== userId && role !== "ADMIN") {
      throw new HttpError("collectoin del denied-access for own-admin", 403);
    }
    await prisma.collection.delete({where:{id:cId}});
    return {deleted:true};
  }

  async addAssets(cId:number,aIds: number[],userId: number,role: string) {
    const c= await prisma.collection.findUnique({where:{id:cId}});
    if(!c) {
      throw new HttpError("collection not exist", 404);
    }
    if(!c.isShared && c.ownerId!== userId && role!== "ADMIN") {
      throw new HttpError("collection access denied", 403);
    }
    const data=aIds.map((aId)=>({assetId:aId, collectionId:cId}));
    const result = await prisma.assetCollection.createMany({data, skipDuplicates: true,}); //skip-file in collectio already-check??
    return {count:result.count};
  }

  //del from c1 only-not del all
  async delAsset(cId: number,aId: number,userId: number, role: string) {
    const c = await prisma.collection.findUnique({ where:{id:cId} });
    if(!c){
      throw new HttpError("collection not found", 404);
    }
    if(!c.isShared && c.ownerId!== userId && role !== "ADMIN") {
      throw new HttpError("collection access denied", 403);
    }
    
    await prisma.assetCollection.delete({
      where: {assetId_collectionId:{assetId:aId, collectionId:cId}},
    });
    return{del:true};
  }
 
  //del from c1-add to c2
  async moveAsset(currId: number,aId: number,destId: number,userId: number,role: string){
    if(currId=== destId) {
      throw new HttpError("curr and dest collecion same", 400);
    }
    const [curr,dest]=await Promise.all([
      prisma.collection.findUnique({ where: { id: currId } }),
      prisma.collection.findUnique({ where: { id: destId } }),
    ]);
    if(!curr || !dest) {
      throw new HttpError("collection not found", 404);
    }
    const allowShare= (c:typeof curr)=>c!.isShared|| c!.ownerId=== userId|| role === "ADMIN";
    if(!allowShare(curr)|| !allowShare(dest)) {
      throw new HttpError("collection access denied", 403);
    }

    await prisma.$transaction([prisma.assetCollection.deleteMany({
        where:{assetId:aId, collectionId:currId },
      }),
      prisma.assetCollection.upsert({
        where:{assetId_collectionId:{assetId:aId, collectionId: destId}},  //check--if link curr pr
        create:{assetId:aId, collectionId: destId },
        update:{}, //-any to do
      }),
    ]);
    return{move:true};
  }

}