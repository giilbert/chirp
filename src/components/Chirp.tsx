import {
  Box,
  BoxProps,
  Container,
  Flex,
  FlexProps,
  Image,
  Text,
  useToast,
  VStack,
} from '@chakra-ui/react';
import { Chirp as ChirpProps } from '../utils/types/Chirp';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { Dispatch, SetStateAction, useState } from 'react';

const AnimatedFlex = motion<FlexProps>(Flex);

function Chirp({
  author,
  content,
  createdAt,
  liked,
  numLikes,
  id,
}: ChirpProps) {
  const date = new Date(createdAt);
  const [likes, setLikes] = useState(numLikes);

  return (
    <AnimatedFlex
      borderWidth="1px"
      p="4"
      mb="2"
      whileHover={{
        scale: 1.1,
        cursor: 'pointer',
        boxShadow: '5px 5px 5px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Image src={author.pfpUrl} width="10" height="10" borderRadius="999" />
      <Container>
        <Link href={`/c/${id}`}>
          <VStack alignItems="flex-start">
            <Flex alignItems="center">
              <Link href={`/u/${author.username}`}>
                <Flex
                  _hover={{
                    textDecoration: 'underline',
                    cursor: 'pointer',
                  }}
                >
                  <Text>{author.name}</Text>
                  <Text color="gray" display="inline-block" ml="1">
                    @{author.username}
                  </Text>
                </Flex>
              </Link>
              <Text color="gray" pl="2">
                {formatDate(date)}
              </Text>
            </Flex>

            <ContentDisplay content={content} />
          </VStack>
        </Link>

        <Flex mt="2">
          <HeartIcon hasUserLiked={liked} chirpId={id} setLikes={setLikes} />
          <Text ml="2">{likes}</Text>
        </Flex>
      </Container>
    </AnimatedFlex>
  );
}

function dateDiffInDays(a: Date, b: Date) {
  // Discard the time and time-zone information.
  const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

  return Math.floor((utc2 - utc1) / (1000 * 60 * 60 * 24));
}

const formatDate = (date: Date) => {
  const diff = dateDiffInDays(new Date(), date);

  if (diff < -7)
    return date.toLocaleString('en-us', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    });

  // return the date in "x days ago" format
  if (diff === 0)
    return `Today at ${date.toLocaleTimeString('en-us', {
      hour: 'numeric',
      minute: 'numeric',
    })}`;

  return `${Math.abs(diff)} ${diff === -1 ? 'day' : 'days'} ago`;
};

const heartIconVariants: Variants = {
  hover: {
    scale: 2,
    cursor: 'pointer',
  },
};

let isInCooldown = false;

function HeartIcon({
  hasUserLiked,
  chirpId,
  setLikes,
}: {
  hasUserLiked: boolean;
  chirpId: string;
  setLikes: Dispatch<SetStateAction<number>>;
}) {
  const [liked, setLiked] = useState(hasUserLiked);
  const errorToast = useToast();

  const showError = () => {
    errorToast({
      title: 'An error occured liking the post.',
      duration: 2000,
      isClosable: true,
      status: 'error',
    });
  };

  // makes the post request to like / unlike a chirp
  const toggleLike = async () => {
    if (typeof liked === 'undefined') {
      errorToast({
        title: 'Please log in to like Chirps.',
        status: 'info',
        isClosable: true,
        duration: 3000,
      });
    }

    if (isInCooldown) {
      errorToast({
        title: "You're liking too fast!",
        status: 'warning',
        isClosable: true,
        duration: 3000,
      });
      return;
    }

    isInCooldown = true;
    setTimeout(() => (isInCooldown = false), 2000);

    if (liked === false) {
      setLiked(true);
      setLikes((v) => v + 1);

      const res = fetch('/api/likeChirp', {
        method: 'POST',
        body: JSON.stringify({ chirpId: chirpId }),
        headers: {
          'Content-Type': 'application/json',
        },
      }).catch(showError);

      if (!((await res) as Response).ok) showError();
    } else if (liked === true) {
      setLiked(false);
      setLikes((v) => v - 1);

      const res = await fetch('/api/unlikeChirp', {
        method: 'POST',
        body: JSON.stringify({ chirpId: chirpId }),
        headers: {
          'Content-Type': 'application/json',
        },
      }).catch(showError);

      if (!((await res) as Response).ok) showError();
    }
  };

  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6"
      fill={`${liked ? '#FB4D46' : 'none'}`}
      viewBox="0 0 24 24"
      style={{ originX: 0.5, originY: 0.5 }}
      stroke="#FB4D46"
      width="24px"
      height="24px"
      whileHover={'hover'}
      variants={heartIconVariants}
      onClick={toggleLike}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
      />
    </motion.svg>
  );
}

const hashtagRegex = /(#.+?)(?: |\n|$)/gm;
function ContentDisplay({ content }: { content: string }) {
  const parseHashtags = (line: string) => {
    const tokens = line.split(hashtagRegex);

    return (
      <span
        style={{
          overflowWrap: 'anywhere',
          hyphens: 'manual',
        }}
      >
        {tokens.map((v, i) => {
          if (v.charAt(0) === '#') {
            return (
              <span
                style={{
                  color: 'cornflowerblue',
                }}
                key={i}
              >
                {v}
              </span>
            );
          }

          return v;
        })}
      </span>
    );
  };

  const lines = content
    .split('\n')
    .map((v, i) => (
      <Text key={i}>{v.length === 0 ? <br /> : parseHashtags(v)}</Text>
    ));

  return <Box>{lines}</Box>;
}

export default Chirp;
