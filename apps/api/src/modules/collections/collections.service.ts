import { prisma } from "../../lib/prisma";

export class CollectionService{
 async getAllCollections(userId:number,role: string,excludeId?: number) {
    let where:any;
    if (role === "ADMIN") {where = {}} 
    else {
      where = {
        OR:[{ ownerId: userId, isShared: false },{ isShared: true }] //own or teams
      };
    }
    if (excludeId) {
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
    if (!cData) {
      const err: any = new Error("collection not found");
      err.statusCode = 404;
      throw err;
    }
    if (!cData.isShared&& cData.ownerId !== userId && role !== "ADMIN") { 
      const err: any = new Error("collection view-access denied"); //for admin/own only
      err.statusCode = 403;
      throw err;
    }

    //view checksfor asset
    let assetExp: any = {};
    if (role === "ADMIN"){assetExp = {};} 
    else if (role === "USER") {
      assetExp={ownerId: userId};
    }else{
      const team = await prisma.user.findMany({
        where:{managerId:userId },select:{id: true },
      });
      const teamIds = team.map((u) => u.id);
      assetExp = {ownerId:{in:[userId, ...teamIds]}};
    }
 
    const rows= await prisma.assetCollection.findMany({
      where:{collectionId:cId,asset: assetExp,},
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
    if (!cData) {
      const err:any = new Error("collection not found");
      err.statusCode = 404;
      throw err;
    }
    if (cData.ownerId!== userId && role !== "ADMIN") {
      const err:any= new Error("collectoin del denied-access for own, admin");
      err.statusCode= 403;
      throw err;
    }
    await prisma.collection.delete({where:{id:cId}});
    return {deleted:true};
  }

}