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

// TODO: reorder this mess
interface UserAndChirpType {
  username: string;
  name: string;
  // override the createdAt property of Chirp to become a number
  chirps: (Omit<Chirp, 'createdAt'> & {
    createdAt: number;
    liked: boolean;
  })[];
}

interface PageProps {
  user: UserAndChirpType;
}

function UserPage({ user }: PageProps) {
  return (
    <Center>
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

        <UserChirps data={user} />
      </Container>
    </Center>
  );
}

function UserChirps({
  data: { chirps, name, username },
}: {
  data: UserAndChirpType;
}) {
  return (
    <Box mt="10">
      {chirps.map((chirp, i) => {
        return (
          <ChirpCard
            key={i}
            {...{
              id: chirp.id,
              authorId: chirp.authorId,
              content: chirp.content,
              author: {
                name,
                username,
                id: chirp.authorId,
              },
              createdAt: chirp.createdAt as number,
              liked: chirp.liked,
              numLikes: chirp.numLikes,
            }}
          />
        );
      })}
    </Box>
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

  const user = (await prisma.user.findUnique({
    where: {
      username: query.username as string,
    },
    select: {
      username: true,
      name: true,
      chirps: {
        take: 10,
        orderBy: {
          createdAt: 'desc',
        },
        // only include likes if the user is signed in
        include: !!session && {
          likes: {
            where: {
              userId: session.user.id,
            },
          },
        },
      },
    },
  })) as {
    username: string;
    name: string;
    chirps: (Chirp & {
      createdAt: number;
      likes: Like[];
      liked: boolean;
    })[];
  };

  user.chirps.forEach((v) => {
    // nextjs cant serialize Date
    // @ts-ignore
    v.createdAt = v.createdAt.getTime();

    if (!!session) v.liked = v.likes?.length !== 0;
    delete v.likes;
  });

  await prisma.$disconnect();

  return {
    props: {
      user,
      session,
    },
  };
};

export default UserPage;
