import { getChannel } from '../queue/connection';
import { QUEUES } from '../queue/queues';
import { AssetUploadPayload } from '../types';
import { minioClient } from '../lib/minio';
import { prisma } from '../lib/prisma';
import fs from 'fs';
import os from 'os';
import path from 'path';
import Ffmpeg from '../lib/ffmpeg';

const BUCKET = 'assets';

export const streamToBuffer=async(stream:NodeJS.ReadableStream):Promise<Buffer> =>{
  const chunks:Buffer[] = [];
  for await(const chunk of stream){
    chunks.push(chunk as Buffer)};
  return Buffer.concat(chunks);
}

const getDuration=(filePath:string):Promise<number>=> {
  return new Promise((resolve, reject) => {
    Ffmpeg.ffprobe(filePath,(err, metadata) => {
      if (err) reject(err);
      else resolve(metadata.format.duration?? 0);
    });
  });
}

export const metadataDataWorker = async () => {
  const ch = getChannel();
  ch.prefetch(1);
  ch.consume(QUEUES.METADATA, async (msg) => {
    console.log("msg meta: ", msg);
    if (!msg) return;
    const {assetId,fileKey,mimeType}:AssetUploadPayload=JSON.parse(msg.content.toString());
    try {
     let duration:number|null= null;
      if (mimeType.startsWith('video/')|| mimeType.startsWith('audio/')) {
        const stream = await minioClient.getObject(BUCKET, fileKey);
        const buffer = await streamToBuffer(stream);
        const tmpPath = path.join(os.tmpdir(), `asset_${assetId}`); //c:/user/appdata/local/temp folder --windows
        fs.writeFileSync(tmpPath, buffer);
        duration= await getDuration(tmpPath);
        fs.unlinkSync(tmpPath);
      }
       await prisma.asset.update({
          where:{id:assetId},
          data: {...(duration!== null &&{duration}),status: 'UPLOADED'}
        });
    console.log("worker meta tym: ",assetId,duration);
    ch.ack(msg);
    } catch (err) {
      console.error('worker meta fail:',err);
      ch.nack(msg, false, false);
    }
  });
};