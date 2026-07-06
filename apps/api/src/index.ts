
import dotenv from 'dotenv';
dotenv.config();

import app from "./app";
import { connectRabbitMq } from './queue/connection';
import { thumbnailWorker } from './workers/thumbnail.worker';
import { metadataDataWorker } from './workers/metadata.worker';
import { duplicateWorker } from './workers/duplicate.worker';
import { expiryWorker } from './workers/expiry.worker';
import {setPublicBuckets } from './lib/minio';
import { reportWorker } from './workers/report.worker';

const PORT = process.env.PORT || 4000;

const bootstrap=async()=>{
  try {
    await setPublicBuckets();  
    await connectRabbitMq();
    await thumbnailWorker();
    await metadataDataWorker();
    await duplicateWorker();
    await expiryWorker();
    await reportWorker();
    
    app.listen(PORT, () => {
      console.log("server run on PORT: ", PORT);
    });
  } catch (err){
    console.error("server fail run: ", err);
    process.exit(1);
  }
}
bootstrap();
