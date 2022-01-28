import { Box, Center, Code, Heading, Text, Link } from '@chakra-ui/react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';

function FourOhFour() {
  const router = useRouter();

  return (
    <Center h="100vh">
      <Box textAlign="center">
        <Heading size="4xl" mb="4">
          404
        </Heading>

        <Text mb="2">
          Page <Code>{router.asPath}</Code> not found.
        </Text>

        <NextLink href="/" passHref>
          <Link color="cyan.500" fontSize="large">
            Go home
          </Link>
        </NextLink>
      </Box>
    </Center>
  );
}

export default FourOhFour;
