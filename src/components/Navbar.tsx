import { HamburgerIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Flex,
  Text,
  useColorMode,
  useColorModeValue,
  useDisclosure,
  useMediaQuery,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { UseSessionReturn } from 'utils/types/Session';
import Settings from './Settings';

function Navbar() {
  const { colorMode } = useColorMode();
  const color = useColorModeValue('white', 'gray.800');
  let [smallerThan600] = useMediaQuery('(max-width: 600px)');
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      width="100vw"
      zIndex="999"
      backgroundColor={color}
      py="3"
    >
      <Flex alignItems="center" justifyContent="center" top="0" px="3">
        {smallerThan600 && (
          <Button
            onClick={isOpen ? onClose : onOpen}
            mr="4"
            as={HamburgerIcon}
          ></Button>
        )}

        <Link href="/">
          <motion.div
            whileHover={{
              scale: 1.2,
              cursor: 'pointer',
            }}
          >
            {colorMode === 'light' ? (
              <Image
                src="/chirp_logo_black.svg"
                width="96.75"
                height="46.25"
                priority
              />
            ) : (
              <Image
                src="/chirp_logo_white.svg"
                width="96.75"
                height="46.25"
                priority
              />
            )}
          </motion.div>
        </Link>

        {!smallerThan600 && <AccountMenu />}
      </Flex>
      {isOpen && smallerThan600 && (
        <Box mt="8">
          <AccountMenu />
        </Box>
      )}
    </Box>
  );
}

function AccountMenu() {
  const { data: session } = useSession({
    required: false,
  }) as UseSessionReturn;

  return (
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
  );
}

export default Navbar;
