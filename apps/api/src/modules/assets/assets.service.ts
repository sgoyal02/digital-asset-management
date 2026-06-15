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
  console.error("minio err: ", minioErr);
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
}