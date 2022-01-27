import {
  Button,
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
          <ModalBody onClick={toggleColorMode}>
            <Button>Switch color theme</Button>
            <Text mt="5">heheheheh this settings modal is kind of empty</Text>
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
