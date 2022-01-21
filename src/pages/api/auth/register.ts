import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '.prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const data = req.body;

  if (!data.username || !data.name || !data.password) {
    res.send('invalid sign up information');
    return;
  }

  await prisma.$connect();

  // check if email or username already exists, if so, end and return
  if (
    await prisma.user.findUnique({
      where: {
        email: data.email,
      },
    })
  ) {
    res.json({
      email: `Email "${data.email}" is already in use`,
    });
    return;
  }

  if (
    await prisma.user.findUnique({
      where: {
        username: data.username,
      },
    })
  ) {
    res.json({
      username: `Username "${data.username}" is taken`,
    });
    return;
  }

  // if email or username is not already in use, create the user
  await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: await hash(data.password, 10),
      username: data.username,
    },
  });

  res.status(200).end();

  prisma.$disconnect();
}
