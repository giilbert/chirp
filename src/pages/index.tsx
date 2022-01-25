import {
  Button,
  Center,
  Container,
  Text,
  Textarea,
  Box,
  TextareaProps,
  SkeletonText,
} from '@chakra-ui/react';
import { Form, Formik, FormikProps } from 'formik';
import { motion } from 'framer-motion';
import { GetServerSideProps } from 'next';
import { getSession, signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useState } from 'react';
import { SessionWithUserId } from './api/auth/[...nextauth]';
import * as Yup from 'yup';
import { PrismaClient } from '@prisma/client';
import ChirpCard from '@components/Chirp';
import { Chirp } from '../utils/types/Chirp';
import useSwr from 'swr';
import { UseSessionReturn } from 'utils/types/Session';

interface PageProps {
  session: SessionWithUserId;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function IndexPage({ session }: PageProps) {
  const { data: recentChirps, error } = useSwr<Chirp[]>(
    '/api/getRecentChirps',
    fetcher
  );

  // user signed in
  return (
    <Center>
      <Container width="500px" mt="50px">
        {session ? (
          <>
            <Text fontSize="xl">
              Signed in as <b>{session.user.name}</b>
            </Text>
            <Button onClick={() => signOut()}>Sign out</Button>
            <CreateChirp />
          </>
        ) : (
          <Link href="/login">
            <Button>Login</Button>
          </Link>
        )}

        {error && <Text>An error occured.</Text>}

        {!recentChirps ? (
          <Box padding="4" bg="white">
            <SkeletonText mt="4" noOfLines={5} spacing="4" />
          </Box>
        ) : (
          <RecentChirps data={recentChirps} />
        )}
      </Container>
    </Center>
  );
}

interface FormValues {
  content: string;
}

const schema = Yup.object().shape({
  content: Yup.string().required('You need something to chirp about'),
});

const maxLength = 500;
const AnimatedTextarea = motion<TextareaProps>(Textarea);

function CreateChirp() {
  const [value, setValue] = useState('');

  return (
    <Box my="10">
      <Formik
        initialValues={{
          content: '',
        }}
        validationSchema={schema}
        onSubmit={(values, helpers) => {
          fetch('/api/createChirp', {
            method: 'POST',
            body: JSON.stringify(values),
            headers: {
              'Content-Type': 'application/json',
            },
          }).then((res) => {
            if (res.ok) {
              helpers.resetForm();
              setValue('');
            }
          });
        }}
      >
        {({
          errors,
          isSubmitting,
          setFieldValue,
        }: /* and other goodies */
        FormikProps<FormValues>) => (
          <Form>
            <AnimatedTextarea
              placeholder="Chirp about something!"
              resize="none"
              height="30px"
              whileFocus={{
                height: '200px',
              }}
              value={value}
              isDisabled={isSubmitting}
              onChange={(e) => {
                setFieldValue('content', e.target.value, false);
                // also update the counter
                setValue(e.target.value);
              }}
            />
            <Text color="gray.400">
              {value.length}/{maxLength}
            </Text>
            <Text color="red.300">{errors.content}</Text>

            <Button colorScheme="green" type="submit" isLoading={isSubmitting}>
              Chirp
            </Button>
          </Form>
        )}
      </Formik>
    </Box>
  );
}

function RecentChirps({ data }: { data: Chirp[] }) {
  return (
    <Box mt="10">
      {data.map((chirp, i) => {
        return <ChirpCard key={i} {...chirp} />;
      })}
    </Box>
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
