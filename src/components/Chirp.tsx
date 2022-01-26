import { Box, Flex, Text, useToast } from '@chakra-ui/react';
import { Chirp as ChirpProps } from '../utils/types/Chirp';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { Dispatch, SetStateAction, useState } from 'react';

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

  console.log(liked);

  return (
    <Box borderWidth="1px" p="4" mb="2">
      <Flex>
        <Link href={`/u/${author.username}`}>
          <Flex
            _hover={{
              textDecoration: 'underline',
              cursor: 'pointer',
            }}
          >
            <Text>{author.name}</Text>
            <Text color="gray" display="inline-block">
              @{author.username}
            </Text>
          </Flex>
        </Link>
        <Text color="gray" pl="2">
          {date.toLocaleString('en-us', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
          })}
        </Text>
      </Flex>

      {/* by default, content is URI encoded */}
      <ContentDisplay content={content} />

      <Flex>
        <HeartIcon hasUserLiked={liked} chirpId={id} setLikes={setLikes} />
        <Text>{likes}</Text>
      </Flex>
    </Box>
  );
}

const heartIconVariants: Variants = {
  hover: {
    scale: 2,
    cursor: 'pointer',
  },
};

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

  // makes the post request to like / unlike a chirp
  const toggleLike = async () => {
    if (liked === false) {
      setLiked(true);
      setLikes((v) => v + 1);

      const res = await fetch('/api/likeChirp', {
        method: 'POST',
        body: JSON.stringify({ chirpId: chirpId }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok)
        errorToast({
          title: 'An error occured liking the post.',
          duration: 3,
          isClosable: true,
          status: 'error',
        });
    } else if (liked === true) {
      setLiked(false);
      setLikes((v) => v - 1);

      fetch('/api/unlikeChirp', {
        method: 'POST',
        body: JSON.stringify({ chirpId: chirpId }),
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((res) => res.ok)
        .then((ok) => {
          if (!ok)
            errorToast({
              title: 'An error occured unliking the post.',
              duration: 3,
              isClosable: true,
              status: 'error',
            });
        });
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
      <span>
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
