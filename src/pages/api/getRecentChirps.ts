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
  const authorId = req.query.user ? (req.query.user as string) : undefined;

  const session = (await getSession({ req })) as SessionWithUserId;

  await prisma.$connect();

  const chirps = (
    await prisma.chirp.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc',
      },
      where: {
        authorId: authorId,
      },
      select: {
        content: true,
        createdAt: true,
        id: true,
        chirpMedia: true,
        author: {
          select: {
            name: true,
            username: true,
            id: true,
            pfpUrl: true,
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
        replyTo: {
          select: {
            id: true,
            author: {
              select: {
                id: true,
                name: true,
                username: true,
              },
            },
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

  res.json(chirps);

  await prisma.$disconnect();
}
