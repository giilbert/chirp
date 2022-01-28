import { ExternalLinkIcon } from '@chakra-ui/icons';
import {
  Button,
  Link,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Text,
  useColorMode,
  useDisclosure,
  VStack,
} from '@chakra-ui/react';
import { useRef } from 'react';

function Settings() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { toggleColorMode } = useColorMode();
  const finalRef = useRef();

  return (
    <>
      <Button onClick={onOpen} colorScheme="purple">
        Settings
      </Button>
      <Modal finalFocusRef={finalRef} isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Settings</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack alignItems="flex-start">
              <Button onClick={toggleColorMode}>Switch color theme</Button>
              <Link
                href="https://github.com/giilbert/chirp"
                color="cyan.700"
                isExternal
              >
                This project's GitHub repository <ExternalLinkIcon mx="3" />
              </Link>

              <Text mt="5">heheheheh this settings modal is kind of empty</Text>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="purple" mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default Settings;
