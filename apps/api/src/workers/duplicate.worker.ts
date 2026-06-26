import { prisma } from "../lib/prisma";
import { getChannel } from "../queue/connection";
import { QUEUES } from "../queue/queues";
import { AssetUploadPayload } from "../types";
import { jobDone, jobFailed, jobStart } from "../types/helper";

export const duplicateWorker = async () => {
  const ch = getChannel();
  ch.prefetch(1);

  ch.consume(QUEUES.DUPLICATE, async (msg) => {
    console.log("dupe msg start: ", msg);
    if (!msg) return;
    const {assetId}:AssetUploadPayload= JSON.parse(msg.content.toString());
    const logId= await jobStart('DUPLICATE', assetId);
    try {
      const asset = await prisma.asset.findUnique({where:{id: assetId}});
      if (!asset?.fileHash) { 
        ch.ack(msg); 
        return; 
      }
      const dupe= await prisma.asset.findFirst({
        where:{fileHash: asset.fileHash, id:{not:assetId}},
      });
      if (dupe) {
        await prisma.asset.update({where: { id: assetId }, data:{isDupe: true }});
        if (!dupe.isDupe) {
          await prisma.asset.update({where: { id: dupe.id },data:{isDupe:true}}); //flag old asset
        }
      }
      ch.ack(msg);
      await jobDone(logId);
    } catch (err:any) {
      console.error("dupe worker fai err: ", err);
      await jobFailed(logId, err.message);
      ch.nack(msg, false, false);
    }
  });
};