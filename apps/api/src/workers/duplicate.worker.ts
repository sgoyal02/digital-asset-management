import { prisma } from "../lib/prisma";
import { getChannel } from "../queue/connection";
import { QUEUES } from "../queue/queues";
import { AssetUploadPayload } from "../types";

export const duplicateWorker = async () => {
  const ch = getChannel();
  ch.prefetch(1);

  ch.consume(QUEUES.DUPLICATE, async (msg) => {
    console.log("dupe msg start: ", msg);
    if (!msg) return;
    const {assetId}:AssetUploadPayload= JSON.parse(msg.content.toString());
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
    } catch (err) {
      console.error("dupe worker fai err: ", err);
      ch.nack(msg, false, false);
    }
  });
};