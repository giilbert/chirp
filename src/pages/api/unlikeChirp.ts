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

  if (!data.chirpId) {
    res.status(400).end();
    return;
  }

  await prisma.$connect();

  // if the user already liked the post
  const doesLikeExist = await prisma.like.findFirst({
    where: {
      chirpId: data.chirpId,
      userId: session.user.id,
    },
  });

  // the inverse, cant unlike if the like doesnt already exist
  if (!doesLikeExist) {
    await prisma.$disconnect();
    res.status(400).send('Post is not liked.');
    return;
  }

  const like = await prisma.like.findFirst({
    where: {
      chirpId: data.chirpId,
      userId: session.user.id,
    },
    select: {
      id: true,
    },
  });

  const deleteLike = prisma.like.delete({
    where: {
      id: like.id,
    },
  });

  // also increment numLikes
  const decrementLike = prisma.chirp.update({
    where: {
      id: data.chirpId,
    },
    data: {
      numLikes: {
        decrement: 1,
      },
    },
  });

  await Promise.all([deleteLike, decrementLike]);

  await prisma.$disconnect();

  res.status(200).end();
}
