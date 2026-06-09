
import express from "express";
import { prisma } from "./lib/prisma";
import dotenv from 'dotenv';
import app from "./app";

dotenv.config();
const PORT= process.env.PORT ||4000;

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


app.listen(PORT, () => {
  console.log(`server run on port ${PORT}`);
});