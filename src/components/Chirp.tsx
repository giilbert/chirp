import { Box, Flex, Text } from '@chakra-ui/react';
import { User } from '@prisma/client';

interface ChirpProps {
  content: string;
  author: User;
  createdAt: string;
}

function Chirp({ author, content, createdAt }: ChirpProps) {
  const date = new Date(createdAt);

  return (
    <Box borderWidth="1px" p="4" mb="2">
      <Flex>
        <Flex>
          <Text>{author.name}</Text>
          <Text color="gray" display="inline-block">
            @{author.username}
          </Text>
        </Flex>
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

    console.log(tokens);

    return (
      <span>
        {tokens.map((v, i) => {
          if (v.charAt(0) === '#') {
            return (
              <Text color="cornflowerblue" key={i} display="inline-block">
                {v}
              </Text>
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
