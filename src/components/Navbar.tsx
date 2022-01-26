import { Box, Button, Flex, Text } from '@chakra-ui/react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { UseSessionReturn } from 'utils/types/Session';

function Navbar() {
  const session = useSession({
    required: true,
  }) as UseSessionReturn;

  return (
    <Flex
      alignItems="center"
      position="fixed"
      top="0"
      backgroundColor="white"
      zIndex="999"
      py="4"
    >
      {session ? (
        <>
          <Text fontSize="xl" mr="3">
            Signed in as <b>{session.data.user.name}</b>
          </Text>
          <Button onClick={() => signOut()}>Sign out</Button>
        </>
      ) : (
        <Link href="/login">
          <Button>Login</Button>
        </Link>
      )}
    </Flex>
  );
}

export default Navbar;
