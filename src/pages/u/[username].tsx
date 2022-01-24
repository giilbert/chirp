import {
  Box,
  BoxProps,
  Center,
  CenterProps,
  Container,
  ContainerProps,
  Flex,
  Heading,
} from '@chakra-ui/react';
import { Chirp, PrismaClient, User } from '@prisma/client';
import { GetServerSideProps } from 'next';
import ChirpCard from '@components/Chirp';
import { ChevronLeftIcon } from '@chakra-ui/icons';
import Link from 'next/link';

interface PageProps {
  user: {
    username: string;
    name: string;
    chirps: (Chirp & {
      createdAt: string;
    })[];
  };
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

        <UserChirps data={user.chirps} author={user} />
      </Container>
    </Center>
  );
}

function UserChirps({
  data,
  author,
}: {
  data: (Chirp & {
    createdAt: string;
  })[];
  author: {
    username: string;
    name: string;
  };
}) {
  return (
    <Box mt="10">
      {data.map((chirp, i) => {
        return (
          <ChirpCard
            key={i}
            {...{
              content: chirp.content,
              author: author as User,
              createdAt: chirp.createdAt,
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
      createdAt: string;
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
