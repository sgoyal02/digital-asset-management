
import dotenv from 'dotenv';
dotenv.config();
import app from "./app";
import { connectRabbitMq } from './queue/connection';
import { thumbnailWorker } from './workers/thumbnail.worker';
import { metadataDataWorker } from './workers/metadata.worker';
import { duplicateWorker } from './workers/duplicate.worker';
import { expiryWorker } from './workers/expiry.worker';
import { minioClient, setPublicBuckets } from './lib/minio';

const PORT = process.env.PORT || 4000;

//--to check prisma- test
// app.get('/api/users', async (req, res) => {
//   try {
//     const users = await prisma.user.findMany({
//       select: {
//         id: true,
//         email: true,
//         password: true,
//         createdAt: true,
//       },
//       orderBy: {
//         createdAt: 'desc',
//       },
//     });

//     res.json({
//       success: true,
//       count: users.length,
//       users,
//     });
//   } catch (error) {
//     console.error('Error fetching users:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Failed to fetch users',
//     });
//   }
// });

const bootstrap=async()=>{
  try {
    await setPublicBuckets();  
    await connectRabbitMq();
    await thumbnailWorker();
    await metadataDataWorker();
    await duplicateWorker();
    await expiryWorker();
    
    app.listen(PORT, () => {
      console.log("server run on PORT: ", PORT);
    });
    const policy = await minioClient.getBucketPolicy('thumbnails');
  } catch (err){
    console.error("server fail run: ", err);
    process.exit(1);
  }
}
bootstrap();