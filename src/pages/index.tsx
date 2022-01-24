import {
  Button,
  Center,
  Container,
  Text,
  Textarea,
  Box,
  TextareaProps,
} from '@chakra-ui/react';
import { Form, Formik, FormikProps } from 'formik';
import { motion } from 'framer-motion';
import { GetServerSideProps } from 'next';
import { getSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { SessionWithUserId } from './api/auth/[...nextauth]';
import * as Yup from 'yup';
import { Chirp, PrismaClient, User } from '@prisma/client';
import ChirpCard from '@components/Chirp';

interface PageProps {
  session: SessionWithUserId;
  recentChirps: ChirpWithAuthor[];
}

function IndexPage({ session, recentChirps }: PageProps) {
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

        <RecentChirps data={recentChirps} />
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

type ChirpWithAuthor = Chirp & {
  // JSON.stringify doesnt work with Date for some reason
  // The timestamp
  createdAt: string;
  author: User;
};

function RecentChirps({ data }: { data: ChirpWithAuthor[] }) {
  return (
    <Box mt="10">
      {data.map((chirp, i) => {
        return <ChirpCard key={i} {...chirp} />;
      })}
    </Box>
  );
}

const prisma = new PrismaClient();
export const getServerSideProps: GetServerSideProps<PageProps> = async (
  ctx
) => {
  // query recent chirps
  await prisma.$connect();

  const recentChirps = (
    await prisma.chirp.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        content: true,
        createdAt: true,
        id: true,
        author: {
          select: {
            name: true,
            username: true,
            id: true,
          },
        },
        authorId: true,
      },
    })
  ).map((v) => {
    // JSON cant serialize Date
    // @ts-ignore
    return {
      ...v,
      createdAt: v.createdAt.getTime(),
    };
  });

  await prisma.$disconnect();

  return {
    props: {
      session: (await getSession({ ctx })) as SessionWithUserId,
      // @ts-ignore
      recentChirps: recentChirps as ChirpWithAuthor[],
    },
  };
};

export default IndexPage;
