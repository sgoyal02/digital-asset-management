
import dotenv from 'dotenv';
dotenv.config();
import app from "./app";
import { connectRabbitMq } from './queue/connection';
import { thumbnailWorker } from './workers/thumbnail.worker';
import { metadataDataWorker } from './workers/metadata.worker';

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
    await connectRabbitMq();
    await thumbnailWorker();
    await metadataDataWorker();

    app.listen(PORT, () => {
      console.log("server run on PORT: ", PORT);
    });
  } catch (err){
    console.error("server fail run: ", err);
    process.exit(1);
  }
}
bootstrap();