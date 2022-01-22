import {
  Button,
  Center,
  Container,
  Text,
  Link as StyledLink,
} from '@chakra-ui/react';
import { GetServerSideProps } from 'next';
import { getSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { SessionWithUserId } from './api/auth/[...nextauth]';

interface PageProps {
  session: SessionWithUserId;
}

function IndexPage({ session }: PageProps) {
  // user signed in
  if (session)
    return (
      <Center>
        <Container width="500px" mt="50px">
          <Text>
            Signed in as <b>{session.user.username}</b>
          </Text>
          <Button onClick={() => signOut()}>Sign out</Button>
        </Container>
      </Center>
    );

  // user is NOT signed in
  return (
    <Center>
      <Container width="500px" mt="50px">
        <Link href="/login">
          <Button>Login</Button>
        </Link>
      </Container>
    </Center>
  );
}

export const getServerSideProps: GetServerSideProps<PageProps> = async (
  ctx
) => {
  return {
    props: {
      session: (await getSession({ ctx })) as SessionWithUserId,
    },
  };
};

export default IndexPage;
