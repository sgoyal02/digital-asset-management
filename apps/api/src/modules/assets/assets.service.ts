import { prisma } from "../../lib/prisma";

export class AssetService {
  async uploadAsset(userId: number, role:string, file:Express.Multer.File) {
    const isAdmin = role === 'ADMIN';
    const expDate = new Date();
    expDate.setDate(expDate.getDate()+10);

    return await prisma.asset.create({
      data: {
        fileName:file.originalname,
        fileUrl: '',           // minio -todo
        fileKey: '',           // minio?
        mimeType: file.mimetype,
        size: file.size,
        ownerId: userId,
        expiryDate:expDate,
        status: isAdmin ? 'APPROVED' : 'PENDING',
      },
      include:{
        owner:{select:{name: true}}
      }
    });
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