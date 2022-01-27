import {
  Box,
  Button,
  Flex,
  Text,
  useColorMode,
  useColorModeValue,
} from '@chakra-ui/react';
import { signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { UseSessionReturn } from 'utils/types/Session';
import Settings from './Settings';

function Navbar() {
  const { data: session } = useSession({
    required: false,
  }) as UseSessionReturn;
  const { colorMode } = useColorMode();
  const color = useColorModeValue('white', 'gray.800');

  return (
    <Flex
      alignItems="center"
      position="fixed"
      top="0"
      left="0"
      width="100vw"
      backgroundColor={color}
      justifyContent="center"
      zIndex="999"
      py="3"
      px="3"
      flexWrap="wrap"
    >
      {colorMode === 'light' ? (
        <Image src="/chirp_logo_black.svg" width="96.75" height="46.25" />
      ) : (
        <Image src="/chirp_logo_white.svg" width="96.75" height="46.25" />
      )}

      <Flex ml="5" alignItems="center">
        {session ? (
          <>
            <Text fontSize="xl" mx="3">
              Signed in as <b>{session.user.name}</b>
            </Text>
            <Button mr="3" onClick={() => signOut()}>
              Sign out
            </Button>
          </>
        ) : (
          <Link href="/login">
            <Button mx="3">Login</Button>
          </Link>
        )}

        <Settings />
      </Flex>
    </Flex>
  );
}

export default Navbar;
