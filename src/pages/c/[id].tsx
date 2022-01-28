import { Box, Center, Container } from '@chakra-ui/react';
import { Chirp, Like, PrismaClient } from '@prisma/client';
import { GetServerSideProps } from 'next';
import ChirpCard from '@components/Chirp';
import { getSession } from 'next-auth/react';
import { SessionWithUserId } from 'pages/api/auth/[...nextauth]';
import Navbar from '@components/Navbar';
import Head from 'next/head';

// TODO: not found error handling

interface PageProps {
  chirp: Chirp & {
    author: {
      id: string;
      name: string;
      username: string;
    };
    likes: Like[];
    liked: boolean;
    createdAt: number;
  };
}

function UserPage({ chirp }: PageProps) {
  return (
    <Center>
      {/* meta tags for web scrapers */}
      <Head>
        <title>
          {chirp.author.name} (@{chirp.author.username}) on Chirp
        </title>
        <meta
          name="description"
          content={`${chirp.content}\n\n${chirp.numLikes} ${
            chirp.numLikes === 1 ? 'Like' : 'Likes'
          }\nPosted ${new Date(chirp.createdAt).toLocaleString('en-us', {
            day: 'numeric',
            month: 'short',
            hour: 'numeric',
            minute: 'numeric',
          })}`}
        />
      </Head>
      <Container maxWidth="600px" mt="75px">
        <Navbar />

        <Box mt="10">
          <ChirpCard
            {...chirp}
            createdAt={chirp.createdAt}
            author={chirp.author}
          />
        </Box>
      </Container>
    </Center>
  );
}

const prisma = new PrismaClient();
// @ts-ignore
export const getServerSideProps: GetServerSideProps<PageProps> = async ({
  query,
  res,
  req,
}) => {
  const session = (await getSession({ req })) as SessionWithUserId;
  res.setHeader(
    'Cache-Control',
    'public, s-maxage=10, stale-while-revalidate=59'
  );

  await prisma.$connect();

  let chirp: Chirp & {
    author: { id: string; name: string; username: string };
    likes: Like[];
    liked: boolean;
  };
  // handle malformed urls
  try {
    chirp = (await prisma.chirp.findFirst({
      where: {
        id: query.id as string,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
        likes: !!session && {
          where: {
            userId: session.user.id,
          },
        },
      },
    })) as typeof chirp;
  } catch {
    return {
      notFound: true,
    };
  }

  if (!chirp) {
    return {
      notFound: true,
    };
  }

  // nextjs cant serialize json
  // @ts-ignore
  chirp.createdAt = chirp.createdAt.getTime();
  // @ts-ignore
  if (session) chirp.liked = chirp.likes?.length !== 0;

  delete chirp.likes;

  await prisma.$disconnect();

  return {
    props: {
      chirp,
      session,
    },
  };
};

export default UserPage;
