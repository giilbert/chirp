import {
  Box,
  Center,
  Flex,
  Skeleton,
  SkeletonText,
  Spinner,
  Text,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { InView } from 'react-intersection-observer';
import ChirpCard from './Chirp';
import { Chirp } from '../utils/types/Chirp';
import useSWR from 'swr/infinite';
import { chirpDisplayListener } from 'pages';
import ChirpSkeleton from './ChirpSkeleton';

const RECENT_CHIRPS_ENDPOINT = '/api/getRecentChirps';
const CHIRP_CHUNK_SIZE = 10;
const fetcher = (url: string) => fetch(url).then((res) => res.json());

function RecentChirps() {
  const { data, error, setSize, mutate } = useSWR<Chirp[]>(
    (i) => `${RECENT_CHIRPS_ENDPOINT}?offset=${i * CHIRP_CHUNK_SIZE}`,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  // by default useSwr/infinite returns Chirp[][]
  const chirps = data ? [].concat(...data) : [];
  const isEmpty = data?.[0]?.length === 0;
  const isLoadingInitialData = !data && !error;
  const isReachedEnd =
    isEmpty || (data && data[data.length - 1]?.length < CHIRP_CHUNK_SIZE);

  useEffect(() => {
    chirpDisplayListener.on('add-chirp', mutate);
    return () => {
      chirpDisplayListener.off('add-chirp', mutate);
    };
  }, []);

  if (!data && isLoadingInitialData) {
    return <ChirpSkeleton />;
  }

  if (error) {
    return <p>An error occured.</p>;
  }

  // fetch more chirps

  return (
    <Box mt="10">
      {chirps.map((chirp, i) => {
        return <ChirpCard key={i} {...chirp} />;
      })}

      {!isReachedEnd ? (
        <InView
          onChange={(inView) => {
            console.log('inView: ' + inView);
            if (inView) setSize((s) => s + 1);
          }}
        >
          {({ ref }) => <Spinner ref={ref} my="5" />}
        </InView>
      ) : (
        <Text>You reached the end.</Text>
      )}
    </Box>
  );
}

export default RecentChirps;
