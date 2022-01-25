import { Box, Flex, Text } from '@chakra-ui/react';
import { User } from '@prisma/client';
import { Chirp as ChirpProps } from '../utils/types/Chirp';
import Link from 'next/link';

function Chirp({ author, content, createdAt }: ChirpProps) {
  const date = new Date(createdAt);

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
    </Box>
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
