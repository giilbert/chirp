import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { SessionWithUserId } from './auth/[...nextauth]';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // get and validate session
  const session = (await getSession({ req })) as SessionWithUserId;
  if (!session) {
    res.status(401).end();
    return;
  }

  const data = req.body as {
    chirpId: string;
  };

  console.log(data);

  if (!data.chirpId) {
    res.status(400).end();
    return;
  }

  await prisma.$connect();

  const createLike = prisma.like.create({
    data: {
      chirpId: data.chirpId,
      userId: session.user.id,
    },
  });

  // also increment numLikes
  const incrementLike = prisma.chirp.update({
    where: {
      id: data.chirpId,
    },
    data: {
      numLikes: {
        increment: 1,
      },
    },
  });

  await Promise.all([createLike, incrementLike]);

  await prisma.$disconnect();

  res.status(200).end();
}
