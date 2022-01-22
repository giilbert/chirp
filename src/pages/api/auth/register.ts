import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '.prisma/client';
import { hash } from 'bcrypt';
import * as Yup from 'yup';

const prisma = new PrismaClient();

const schema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  username: Yup.string()
    .min(4, 'Username must be at least 4 characters long')
    .max(20, 'Username can not be longer than 20 characters')
    .required('Username is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters long')
    .required('Password is required'),
  confirmPassword: Yup.string().oneOf(
    [Yup.ref('password'), null],
    'Passwords do not match'
  ),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const data = req.body;

  console.log(data);

  if (!schema.isValid(data)) {
    res.send('Invalid registration info');
    return;
  }

  await prisma.$connect();

  // check if username already exists, if so, end and return
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

  // if username is not already in use, create the user
  await prisma.user.create({
    data: {
      name: data.name,
      password: await hash(data.password, 10),
      username: data.username,
    },
  });

  res.status(200).end();

  prisma.$disconnect();
}
