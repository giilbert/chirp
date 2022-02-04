import {
  Box,
  Center,
  Container,
  Divider,
  Flex,
  Heading,
} from '@chakra-ui/react';
import { Chirp, Like, PrismaClient } from '@prisma/client';
import { GetServerSideProps } from 'next';
import ChirpCard from '@components/Chirp';
import { getSession } from 'next-auth/react';
import { SessionWithUserId } from 'pages/api/auth/[...nextauth]';
import Navbar from '@components/Navbar';
import Head from 'next/head';
import RecentChirps from '@components/RecentChirps';
import { useEffect } from 'react';

interface User {
  id: string;
  username: string;
  name: string;
  pfpUrl: string;
}

interface PageProps {
  user: User;
}

function UserPage({ user }: PageProps) {
  return (
    <Center>
      <Head>
        <title>
          {user.name} (@{user.username}) on Chirp
        </title>
      </Head>
      <Container maxWidth="600px" mt="75px">
        <Navbar />

        <Flex>
          <Heading>{user.name}</Heading>
          <Heading fontWeight="light" colorScheme="gray" pl="2">
            @{user.username}
          </Heading>
        </Flex>

        <Divider my="10" />

        <Heading>{user.name}'s Recent Chirps</Heading>

        <RecentChirps userId={user.id} />
      </Container>
    </Center>
  );
}

const prisma = new PrismaClient();
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

  let user: {
    id: string;
    username: string;
    name: string;
    pfpUrl: string;
  };
  // handle malformed urls
  try {
    user = (await prisma.user.findUnique({
      where: {
        username: query.username as string,
      },
      select: {
        id: true,
        username: true,
        name: true,
        pfpUrl: true,
      },
    })) as typeof user;
  } catch {
    return {
      notFound: true,
    };
  }

  if (!user) {
    return {
      notFound: true,
    };
  }

  await prisma.$disconnect();

  return {
    props: {
      user,
      session,
    },
  };
};

export default UserPage;
