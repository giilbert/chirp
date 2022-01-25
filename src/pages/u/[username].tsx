import { Box, Center, Container, Flex, Heading } from '@chakra-ui/react';
import { Chirp, PrismaClient } from '@prisma/client';
import { GetServerSideProps } from 'next';
import ChirpCard from '@components/Chirp';
import { ChevronLeftIcon } from '@chakra-ui/icons';
import Link from 'next/link';

// TODO: reorder this mess
interface UserAndChirpType {
  username: string;
  name: string;
  // override the createdAt property of Chirp to become a number
  chirps: (Omit<Chirp, 'createdAt'> & { createdAt: number })[];
}

interface PageProps {
  user: UserAndChirpType;
}

function UserPage({ user }: PageProps) {
  return (
    <Center>
      <Container width="500px" mt="50px">
        <Link href="/">
          <Flex>
            <ChevronLeftIcon />
            Home
          </Flex>
        </Link>
        <Flex>
          <Heading>{user.name}</Heading>
          <Heading fontWeight="light" colorScheme="gray" pl="2">
            @{user.username}
          </Heading>
        </Flex>

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
}) => {
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
      },
    },
  })) as {
    username: string;
    name: string;
    chirps: (Chirp & {
      createdAt: number;
    })[];
  };

  user.chirps.forEach((v) => {
    // nextjs cant serialize Date
    // @ts-ignore
    v.createdAt = v.createdAt.getTime();
  });

  await prisma.$disconnect();

  return {
    props: {
      user,
    },
  };
};

export default UserPage;
