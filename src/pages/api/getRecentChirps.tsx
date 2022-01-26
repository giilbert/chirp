import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { SessionWithUserId } from './auth/[...nextauth]';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;

  await prisma.$connect();

  const chirps = await prisma.chirp.findMany({
    take: 10,
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      content: true,
      createdAt: true,
      id: true,
      author: {
        select: {
          name: true,
          username: true,
          id: true,
        },
      },
      authorId: true,
    },
    skip: offset,
  });

  if (chirps.length < 10) {
    res.json({
      chirps,
      theEnd: true,
    });
    return;
  }

  res.json(chirps);

  await prisma.$disconnect();
}
