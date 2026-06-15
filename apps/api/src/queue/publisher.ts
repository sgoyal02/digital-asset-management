import { AssetUploadPayload } from "../types";
import { getChannel } from "./connection.js";
import { EXCHANGES } from "./queues";

export const publishAssetUpload= (payload:AssetUploadPayload) => {
  const ch = getChannel();
  ch.publish(EXCHANGES.ASSET_UPLOADED,'',Buffer.from(JSON.stringify(payload)),{persistent: true });
};