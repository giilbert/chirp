import { HamburgerIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Flex,
  HStack,
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
import styles from './Navbar.module.css';

function Navbar() {
  const { colorMode } = useColorMode();
  const color = useColorModeValue('white', 'gray.800');
  let [smallerThan600] = useMediaQuery('(max-width: 600px)');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const borderColor = useColorModeValue('blackAlpha.400', 'whiteAlpha.400');

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
      <Flex alignItems="center" top="0" px="3" className={styles.container}>
        {smallerThan600 && (
          <Button
            onClick={isOpen ? onClose : onOpen}
            mr="4"
            as={HamburgerIcon}
          ></Button>
        )}
        <HStack width="568px">
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
                  alt="Chirp logo"
                  priority
                />
              ) : (
                <Image
                  src="/chirp_logo_white.svg"
                  width="96.75"
                  height="46.25"
                  alt="Chirp logo"
                  priority
                />
              )}
            </motion.div>
          </Link>

          <Box px="2">{!smallerThan600 && <AccountMenu />}</Box>
        </HStack>
      </Flex>
      {isOpen && smallerThan600 && (
        <Box mt="2" borderBottom="1px" pb="5" borderColor={borderColor}>
          <AccountMenu />
        </Box>
      )}
    </Box>
  );
}

function AccountMenu() {
  const [smallerThan600] = useMediaQuery('(max-width: 600px)');
  const { data: session } = useSession({
    required: false,
  }) as UseSessionReturn;

  return (
    <Flex
      alignItems="flex-start"
      flexDirection={smallerThan600 ? 'column' : 'row'}
    >
      {session ? (
        <Text fontSize="xl" ml={!smallerThan600 && '5'}>
          Signed in as{' '}
          <b
            style={{
              marginRight: '10px',
            }}
          >
            {session.user.name}
          </b>
          <Button mr="3" mb="1" onClick={() => signOut()}>
            Sign out
          </Button>
        </Text>
      ) : (
        <Link href="/login">
          <Button mr="3" mb="2">
            Login
          </Button>
        </Link>
      )}

      <Settings />
    </Flex>
  );
}

export default Navbar;
