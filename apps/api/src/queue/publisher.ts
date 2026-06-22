import { AssetUploadPayload, ReportPayload } from "../types";
import { getChannel } from "./connection.js";
import { EXCHANGES, QUEUES } from "./queues";

export const publishAssetUpload= (payload:AssetUploadPayload) => {
  const ch = getChannel();
  ch.publish(EXCHANGES.ASSET_UPLOADED,'',Buffer.from(JSON.stringify(payload)),{persistent: true });
};

export const publishReport= (payload:ReportPayload) => {
  const ch= getChannel();
  console.log("payl: ", payload);
  ch.sendToQueue(QUEUES.REPORT,Buffer.from(JSON.stringify(payload)),{persistent: true});
};