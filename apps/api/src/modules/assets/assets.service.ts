import { User } from "../../generated/prisma/client.js";
import { minioClient } from "../../lib/minio";
import { prisma } from "../../lib/prisma";

const BUCKET = "assets";

export class AssetService {
  async uploadAsset(user:User, file:Express.Multer.File) {
    const isAdmin = user.role === 'ADMIN';
    const expDate = new Date();
    expDate.setDate(expDate.getDate()+10);

    const userName = user.name.replace(/[^a-zA-Z0-9-_]/g, '');
    const originalName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '');
    const mimeType = file.mimetype;
    const fileSize = BigInt(file.size); 

    let asset = await prisma.asset.findFirst({
      where: {
        fileName: originalName,
        ownerId: (user.id),
      },
      include: {
        versions: {
          orderBy: { versionNumber: 'desc' },
          take: 1,
        },
      },
    });
    let versionNumber = 1;
    if (asset && asset.versions.length > 0) {
      versionNumber = asset.versions[0].versionNumber + 1;
    }
    
    const isBucket= await minioClient.bucketExists(BUCKET);
    if(!isBucket) await minioClient.makeBucket(BUCKET);

    const userFolder= `${userName}-${(user.id)}`;
    const objName= `${userFolder}/v${versionNumber}_${originalName}`;
    let useSSL=false; //prod-todo
    const protocol = useSSL? 'https': 'http';
    const fileUrl = `${protocol}://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${BUCKET}/${objName}`;
    const metaData = {'Content-Type': mimeType };
    await minioClient.putObject(BUCKET, objName, file.buffer, file.size, metaData);

    //queries seq
   const res = await prisma.$transaction(async(tx:any) => {
      if (!asset) {
        asset = await tx.asset.create({
        data: {
            fileName: originalName,
            fileUrl: fileUrl,
            fileKey: objName,
            mimeType: mimeType,
            size: fileSize,
            ownerId: (user.id),
            departmentId: null,
            status: isAdmin ? 'APPROVED' : 'PENDING',
          versions: {
              create: {
                versionNumber: versionNumber,
                fileUrl: fileUrl,
                fileKey: objName,
                size: fileSize,
              },
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
            versionNumber: versionNumber,
            fileUrl: fileUrl,
            fileKey: objName,
            size: fileSize,
          },
        });
        asset = await tx.asset.update({
          where:{id: asset.id},
          data: {
            fileUrl: fileUrl,
            fileKey: objName,
            size: fileSize,
          },
          include:{versions:true},
        });
      }
      await tx.usageLog.create({
        data: {
          assetId: asset.id,
          userId: (user.id),
          action: versionNumber=== 1? 'UPLOAD' : 'EDIT',
        },
      });
      return asset;
    });

    const jsonRes = JSON.parse(
      JSON.stringify(res,(key, value) =>
        typeof value === 'bigint' ? value.toString(): value
      )
    );
    return jsonRes;
  }

  async getAssets(userId: number, role: string) {
    return await prisma.asset.findMany({
      where: role === 'ADMIN' ? {} : { ownerId: userId },
      include: {
        owner: {select:{name:true }}, 
        // department:{select:{name:true}}
      },
      orderBy: {createdAt: 'desc'},
    });
  }
}