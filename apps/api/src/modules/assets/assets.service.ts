import { User } from "../../generated/prisma/client";
import { minioClient } from "../../lib/minio";
import { prisma } from "../../lib/prisma";
import crypto from 'node:crypto';
import { publishAssetUpload } from "../../queue/publisher";

const BUCKET = "assets";

export class AssetService {
  async uploadAsset(user:User, file:Express.Multer.File) {
    const dbUser = await prisma.user.findUnique({where:{id:user.id}});
    if (!dbUser) {
      throw new Error("User not found in db.");
    }

    const isAdmin = dbUser.role === 'ADMIN';
    const expDate = new Date();
    expDate.setDate(expDate.getDate()+10);
    console.log("user: ", dbUser);
    const fileHash   = crypto.createHash('sha256').update(file.buffer).digest('hex');
    const userName = dbUser.name?.replace(/[^a-zA-Z0-9-_]/g, '')||'noName';
    const originalName = file.originalname?.replace(/[^a-zA-Z0-9._-]/g, '')|| 'fileUnknown';
    const mimeType = file.mimetype;
    const fileSize = BigInt(file.size); 

    let asset = await prisma.asset.findFirst({
      where: {fileName: originalName, ownerId: (dbUser.id),},
      include: {
        versions: {
          orderBy: { versionNumber: 'desc' },
          take: 1,
        },
      },
    });
    const versionNumber= asset ?(asset.versions[0]?.versionNumber ?? 0) + 1 : 1;
    
    const isDupe = await prisma.asset.findFirst({
      where:{fileHash, id: asset? {not:asset.id} : undefined},
    })!== null;

    const isBucket= await minioClient.bucketExists(BUCKET);
    if(!isBucket) await minioClient.makeBucket(BUCKET);

    const userFolder= `${userName}-${(dbUser.id)}`;
    const objName= `${userFolder}/v${versionNumber}_${originalName}`;
    let useSSL=false; //prod-todo
    const protocol = useSSL? 'https': 'http';
    const metaData = {'Content-Type': mimeType,'x-amz-meta-hash': fileHash};
    const fileUrl = `${protocol}://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${BUCKET}/${objName}`;
    // await minioClient.putObject(BUCKET, objName, file.buffer, file.size, metaData);
    try {
  await minioClient.putObject(BUCKET, objName, file.buffer, file.size, metaData);
} catch (minioErr: any) {
  throw new Error(`minio upload fail: ${minioErr.message || minioErr}`);
}
    //queries seq
   const res = await prisma.$transaction(async(tx:any) => {
    let newAsset;
      if (!asset) {
        newAsset = await tx.asset.create({
        data: {
            fileName: originalName,
            fileUrl,
            fileHash,
            fileKey: objName,
            mimeType, isDupe,
            size: fileSize,
            ownerId: (dbUser.id),
            expiryDate: expDate,
            departmentId:dbUser.departmentId ?? null,
            status: isAdmin ? 'APPROVED' : 'PENDING',
            versions: {
              create: {versionNumber,fileUrl,fileKey: objName,size: fileSize}
            },
          },
          include: {
            versions:true,
            owner:{select:{name: true}}
          },
        });
      } else {
        await tx.assetVersion.create({
          data: {
            assetId: asset.id,
            versionNumber,fileUrl,
            fileKey: objName,
            size: fileSize,
          },
        });
        newAsset = await tx.asset.update({
          where:{id: asset.id},
          data: {
            fileUrl, fileHash, isDupe,
            fileKey: objName,
            size: fileSize,
          },
          include:{versions:true},
        });
      }
      await tx.usageLog.create({
        data: {
          assetId: newAsset?.id,
          userId: (dbUser.id),
          action: versionNumber=== 1? 'UPLOAD' : 'EDIT',
        },
      });
      return newAsset;
    });

    //queue call- file data, owner id
    console.log("ass: ", res);

    publishAssetUpload({
      assetId:res?.id,
      fileKey:objName,
      fileUrl,
      mimeType,
      ownerId:user.id,
      versionNumber
    });

    const jsonRes = JSON.parse(
      JSON.stringify(res,(_, value) =>
        typeof value === 'bigint' ? value.toString(): value
      )
    );
    return jsonRes;
  }

  async getAssets(userId: number, role: string,search?:string, managerId?:number) {
    let where:any= {};
    if(role==="ADMIN") where={}
    else if(role ==="USER"){
      where={ownerId: userId};
    }else{
      const team = await prisma.user.findMany({
        where:{managerId:userId },select:{id:true}});
      const teamIds = team.map((u) => u.id);
      where={ownerId:{in:[userId, ...teamIds]}};
    }
    if (search?.trim()) {
      where = {
        ...where,
        fileName: {
          contains: search,
          mode: "insensitive",
        },
      }};
    const assets= await prisma.asset.findMany({
      where,
      include:{
        owner: {select:{name:true,department:{select:{name: true}}}}, 
        versions:{orderBy:{versionNumber: 'desc'},take: 1},
      },
      orderBy: {createdAt: 'desc'},
    });

    return JSON.parse(JSON.stringify(assets,(_, value) =>
        typeof value === 'bigint' ? value.toString(): value
      ));
  }

  async getAssetById(assetId:number, userId: number, role:string) {
  const asset = await prisma.asset.findUnique({
    where:{id:assetId },
    include: {
      owner:{select:{name: true, department:{select:{name: true}}}},
      versions:{ orderBy: { versionNumber: 'desc' } },
      usageLogs: {
        include:{user:{select:{name: true}}},
        orderBy:{createdAt: 'desc'},
        take: 10,
      },
    },
  });
  if (!asset) {
    const err:any= new Error('asset not found');
    err.statusCode = 404;
    throw err;
  }
  if (role=== 'USER' && asset.ownerId!== userId) {
    const err: any = new Error('access denied to this asset');
    err.statusCode = 403;
    throw err;
  }
  //for manager
  if (role=== 'MANAGER' && asset.ownerId !== userId) {
    const team = await prisma.user.findMany({
      where:{managerId: userId},
      select:{id: true},
    });
    const teamIds = team.map((u) => u.id);
    if (!teamIds.includes(asset.ownerId)) {
      const err: any = new Error('access denie- not team asset');
      err.statusCode = 403;
      throw err;
    }
  }
  //admin
  return JSON.parse(JSON.stringify(asset,(_,val) =>
    typeof val==='bigint'? val.toString(): val
  ));
}

  async reviewAsset(assetId:number,reviewerId: number,role: string, action:'APPROVED'|'REJECTED') {
    const asset= await prisma.asset.findUnique({where:{id:assetId}});
    if (!asset) {
      const err:any = new Error('asset not found');
      err.statusCode = 404;
      throw err;
    }
    if (role=== 'USER') {
      const err: any = new Error('user can not review:access denied');
      err.statusCode = 403;
      throw err;
    }
    if (asset.ownerId=== reviewerId) { //own file not review
      const err: any = new Error('cannot review own asset');
      err.statusCode = 403;
      throw err;
    }
    
    //mangaer-team review
    if (role=== 'MANAGER') {
      const owner= await prisma.user.findUnique({ where:{id:asset.ownerId}});
      if (owner?.managerId!== reviewerId) {
        const err: any = new Error('not team asset:access denied');
        err.statusCode = 403;
        throw err;
      }
    }
    //status basis
    if (['APPROVED','REJECTED','ARCHIVED'].includes(asset.status)) {
      const err:any= new Error('based on asset status- can not review');
      err.statusCode = 400;
      throw err;
    }

    const updated = await prisma.asset.update({
      where:{id:assetId},
      data:{status:action},
    });
    await prisma.usageLog.create({
      data:{assetId,userId: reviewerId,action: 'EDIT'},
    });
    return JSON.parse(JSON.stringify(updated,(_,v) =>
      typeof v=== 'bigint'? v.toString(): v
    ));
  }
}