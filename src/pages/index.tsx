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

interface PageProps {
  session: SessionWithUserId;
}

const chirpDisplayListener = new EventEmitter();

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function IndexPage({ session }: PageProps) {
  const { data: recentChirps, error } = useSwr<
    { theEnd: boolean; chirps: Chirp[] } & Chirp[]
  >('/api/getRecentChirps', fetcher);

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

        {error && <Text>An error occured.</Text>}

        {!recentChirps ? (
          <Center mt="10">
            <Spinner />
          </Center>
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
          // TODO: error handling (toast)
          fetch('/api/createChirp', {
            method: 'POST',
            body: JSON.stringify(values),
            headers: {
              'Content-Type': 'application/json',
            },
          }).then(async (res) => {
            if (res.ok) {
              const newChirp = (await res.json()) as Chirp;
              chirpDisplayListener.emit('add-chirp', newChirp);

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

let offset = 0;
function RecentChirps({
  data,
}: {
  data: { theEnd: boolean; chirps: Chirp[] } & Chirp[];
}) {
  // the chirps, PLUS all the chirps fetched after
  const [persistantData, setPersistantData] = useState(
    data.theEnd ? data.chirps : data
  );
  const [ref, inView] = useInView({ threshold: 0.5, delay: 10 });
  const [theEnd, setTheEnd] = useState(!!data.theEnd);

  useEffect(() => {
    chirpDisplayListener.on('add-chirp', (chirp) => {
      // add the just-created chirp to the beginning of the existing data
      setPersistantData((existingData) => {
        return [chirp, ...existingData];
      });
    });
  }, []);

  if (inView) {
    fetcher(`/api/getRecentChirps?offset=${(offset + 1) * 10}`).then((data) => {
      // when every recent post is grabbed
      if (data.theEnd) {
        setPersistantData([...persistantData, ...data.chirps]);
        setTheEnd(true);
        return;
      }

      setPersistantData([...persistantData, ...data]);
    });
    offset += 1;
  }

  return (
    <Box mt="10">
      {persistantData.map((chirp, i) => {
        return <ChirpCard key={i} {...chirp} />;
      })}

      {!theEnd && (
        <Center>
          <Spinner ref={ref} />
        </Center>
      )}
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
