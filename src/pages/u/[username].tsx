import {
  Center,
  Container,
  Divider,
  Flex,
  Heading,
  Image,
} from '@chakra-ui/react';
import { PrismaClient } from '@prisma/client';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import { SessionWithUserId } from 'pages/api/auth/[...nextauth]';
import Navbar from '@components/Navbar';
import Head from 'next/head';
import RecentChirps from '@components/RecentChirps';

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
      <Container maxWidth="600px" mt="90px">
        <Navbar />

        <Flex alignItems="center">
          <Image
            src={user.pfpUrl}
            width="64px"
            height="64px"
            borderRadius="999px"
            mr="6"
          />

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
