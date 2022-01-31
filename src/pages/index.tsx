import {
  Button,
  Center,
  Container,
  Text,
  Textarea,
  Box,
  TextareaProps,
  Spinner,
  Heading,
} from '@chakra-ui/react';
import { Form, Formik, FormikProps } from 'formik';
import { motion } from 'framer-motion';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { SessionWithUserId } from './api/auth/[...nextauth]';
import * as Yup from 'yup';
import ChirpCard from '@components/Chirp';
import { Chirp } from '../utils/types/Chirp';
import useSwr, { useSWRConfig } from 'swr';
import { useInView } from 'react-intersection-observer';
import Navbar from '@components/Navbar';
import Head from 'next/head';
import { EventEmitter } from 'events';
import RecentChirps from '@components/RecentChirps';

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
        <meta
          name="description"
          content="Chirp Chirp Chirp Chirp Chirp Chirp"
        />
      </Head>
      <Container maxWidth="600px" mt="50px">
        <Navbar />

        {session && <CreateChirp />}

        <Heading mt={!session && '10'}>Recent Chirps</Heading>

        <RecentChirps />
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
          // TODO: error handling (toast)
          fetch('/api/createChirp', {
            method: 'POST',
            body: JSON.stringify(values),
            headers: {
              'Content-Type': 'application/json',
            },
          }).then(async (res) => {
            if (res.ok) {
              chirpDisplayListener.emit('add-chirp');

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
                setValue(e.target.value.substring(0, maxLength));
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
