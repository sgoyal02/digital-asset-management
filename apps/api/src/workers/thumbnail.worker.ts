import sharp from 'sharp';
import { getChannel } from '../queue/connection';
import { QUEUES } from '../queue/queues';
import { AssetUploadPayload } from '../types';
import { minioClient } from '../lib/minio';
import { streamToBuffer } from './metadata.worker';
import { prisma } from '../lib/prisma';
import path from 'path';
import os from 'os';
import fs from 'fs';
import Ffmpeg from '../lib/ffmpeg';

const BUCKET = 'assets';
const THUMB_BUCKET = 'thumbnails';

const generateVideoThumb=async(fileKey:string,assetId: number, fileBuffer:Buffer):Promise<Buffer|null>=>{
  const ext = path.extname(fileKey);
  const tmpInp = path.join(os.tmpdir(), `asset_${assetId}_input${ext}`);
  const tmpOut = path.join(os.tmpdir(), `asset_${assetId}_thumb.jpg`);
  fs.writeFileSync(tmpInp, fileBuffer);
  await new Promise<void>((resolve, reject) => {
    Ffmpeg(tmpInp)
      .screenshots({timestamps: ['00:00:01'], //1sec
        filename: path.basename(tmpOut),
        folder: os.tmpdir(),
        size: '300x?',
      }).on('end',()=>resolve()).on('error',(err)=> reject(err));
  });
  if (!fs.existsSync(tmpOut))return null;
  const thumbBuffer= fs.readFileSync(tmpOut);

  fs.unlinkSync(tmpInp);
  fs.unlinkSync(tmpOut);
  return thumbBuffer;
}

export const thumbnailWorker=async() => {
  const ch = getChannel();
  ch.prefetch(1);

  ch.consume(QUEUES.THUMBNAIL, async (msg) => {
    console.log("thum msg: ", msg);
    if (!msg) return;
    const {assetId,fileKey,mimeType}:AssetUploadPayload=JSON.parse(msg.content.toString());
    try {
      const isThumbBkt=await minioClient.bucketExists(THUMB_BUCKET);
      if (!isThumbBkt) await minioClient.makeBucket(THUMB_BUCKET);

      const stream= await minioClient.getObject(BUCKET, fileKey);
      const fileBuff = await streamToBuffer(stream);
      let thumbBuffer:Buffer|null = null;

      if (mimeType.startsWith('image/')) {
        thumbBuffer= await sharp(fileBuff).resize(300,300,{fit:'inside'})
                     .jpeg({ quality:80}).toBuffer();
      } else if(mimeType.startsWith('video/')) {
        thumbBuffer = await generateVideoThumb(fileKey,assetId, fileBuff);
      }else { 
        await prisma.asset.update({where:{id:assetId},data:{thumbnailUrl: null}}); //audio,doc
        ch.ack(msg);
        return;
      }

      if(thumbBuffer){
        const thumbKey = `thumb_${assetId}.jpg`;
        await minioClient.putObject(THUMB_BUCKET, thumbKey, thumbBuffer, thumbBuffer.length, {
          'Content-Type': 'image/jpeg',
        });
        const protocol ='http'; //https to do for prod
        const thumbUrl = `${protocol}://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${THUMB_BUCKET}/${thumbKey}`;
        await prisma.asset.update({where:{id: assetId},data:{thumbnailUrl: thumbUrl}});
      }
      ch.ack(msg);
    } catch (err) {
      console.error("thumb worker fail: ", err);
      ch.nack(msg, false, false);
      await prisma.asset.update({where:{id:assetId},data:{status:'FAILED'}});
    }
  });

  console.log('thumb worker listen: ',QUEUES.THUMBNAIL);
};