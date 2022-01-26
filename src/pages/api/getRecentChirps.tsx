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
  const session = (await getSession({ req })) as SessionWithUserId;

  await prisma.$connect();

  const chirps = (
    await prisma.chirp.findMany({
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
        numLikes: true,

        // query likes which come from the user on the post,
        // if it does not exist, it means the user has not liked it
        // only works if the user is logged in
        likes: !!session && {
          where: {
            userId: session.user.id,
          },
        },
      },
      skip: offset,
    })
  ).map((v) => {
    const liked = v.likes?.length !== 0;
    delete v.likes;

    if (!!session)
      return {
        ...v,
        liked,
      };

    // dont add a `liked` property if the user is not signed in
    return v;
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
