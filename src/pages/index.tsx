import { Center, Container, Heading } from '@chakra-ui/react';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import { SessionWithUserId } from './api/auth/[...nextauth]';
import Navbar from '@components/Navbar';
import Head from 'next/head';
import { EventEmitter } from 'events';
import RecentChirps from '@components/RecentChirps';
import CreateChirp from '@components/CreateChirp';

interface PageProps {
  session: SessionWithUserId;
}

const chirpDisplayListener = new EventEmitter();

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function IndexPage({ session }: PageProps) {
  // user signed in
  return (
    <Center>
      <Head>
        <title>Chirp</title>
        <meta name="description" content="Not a Twitter clone" />
      </Head>
      <Container maxWidth="600px" mt="50px">
        <Navbar />

        {session && <CreateChirp listener={chirpDisplayListener} />}

        <Heading mt={!session && '10'}>Recent Chirps</Heading>

        <RecentChirps />
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
export { chirpDisplayListener };
