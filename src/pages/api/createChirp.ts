import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { SessionWithUserId } from './auth/[...nextauth]';
import * as Yup from 'yup';
import { formidable, File } from 'formidable';
import { storageBucket } from 'utils/firebaseUtils';
import { v4 as uuid } from 'uuid';
import { readFile } from 'fs/promises';

const prisma = new PrismaClient();

const schema = Yup.object().shape({
  content: Yup.string().required('You need something to chirp about'),
});

const formidableParseData = (req: NextApiRequest) =>
  new Promise<{ fields: any; media: File[] }>((res, rej) =>
    formidable({ multiples: true, maxFileSize: 4 * 1024 * 1024 }).parse(
      req,
      (error, fields, { media }) =>
        error
          ? rej(error)
          : res({
              fields: JSON.parse(fields.chirp as string),
              media: media ? (Array.isArray(media) ? media : [media]) : null,
            })
    )
  );

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

  const { fields: data, media } = (await formidableParseData(req).catch((e) => {
    console.error(e);
    res.status(401).end();
  })) as { fields: any; media: File[] };

  // validate the chirp
  if (!schema.isValid(data)) {
    res.send('Invalid Chirp');
    return;
  }

  // media
  let mediaURLs: string[] = [];
  if (media) {
    mediaURLs = await Promise.all(
      media.map(async (v) => {
        const fileStream = await readFile(v.filepath);
        const file = storageBucket.file(`${uuid()}.png`);
        const stream = file.createWriteStream();
        stream.write(fileStream);
        stream.end();

        return file.publicUrl();
      })
    );
    await storageBucket.makePublic();
  }

  const replyToId = data.replyToId;

  await prisma.$connect();

  const chirp = await prisma.chirp.create({
    data: {
      // replace multiple new lines, max of one empty line
      content: data.content.replace(/[\n]{3,}/g, '\n\n'),
      authorId: session.user.id,
      replyToId,
      chirpMedia: mediaURLs,
    },
    include: {
      author: {
        select: {
          likes: true,
          name: true,
          username: true,
        },
      },
    },
  });

  await prisma.$disconnect();

  res.status(200).json(chirp);
}

export const config = {
  api: {
    bodyParser: false,
  },
};
