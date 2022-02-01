import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  useDisclosure,
  Text,
} from '@chakra-ui/react';
import ReactAvatarEditor, { AvatarEditorProps } from 'react-avatar-editor';
import React, {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useRef,
  useState,
} from 'react';

const AvatarEditorData = createContext<{
  image: string;
  setImage: Dispatch<SetStateAction<string>>;
}>(null);

function ProfilePictureModal() {
  const [image, setImage] = useState<string>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const finalRef = useRef();

  return (
    <>
      <Button onClick={onOpen}>Change profile picture</Button>
      <Modal
        finalFocusRef={finalRef}
        isOpen={isOpen}
        onClose={() => {
          onClose();
        }}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Settings</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <AvatarEditorData.Provider
              value={{
                image,
                setImage,
              }}
            >
              {image ? <AvatarEditor /> : <ImageUploadPrompt />}
            </AvatarEditorData.Provider>
          </ModalBody>

          <ModalFooter>
            <Button mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

function AvatarEditor() {
  const [zoom, setZoom] = useState(1);
  const ctx = useContext(AvatarEditorData);
  const avatarEditorRef = useRef();

  return (
    <>
      <ReactAvatarEditor
        image={ctx.image}
        width={256}
        height={256}
        ref={avatarEditorRef}
        scale={zoom}
        borderRadius={1000}
      />
      <Text>Scale</Text>
      <Slider
        onChange={(v) => {
          setZoom((v + 50) / 100);
        }}
      >
        <SliderTrack>
          <SliderFilledTrack />
        </SliderTrack>
        <SliderThumb />
      </Slider>
      <Button
        colorScheme="purple"
        onClick={() => {
          uploadProfilePicture(
            // @ts-ignore no types for this library yet
            avatarEditorRef.current.getImageScaledToCanvas()
          );
        }}
      >
        Update profile picture
      </Button>
    </>
  );
}

function ImageUploadPrompt() {
  const { setImage } = useContext(AvatarEditorData);

  return (
    <>
      <Text>Upload a image</Text>
      <Input
        appearance="none"
        type="file"
        accept="image/*"
        onChange={async (e) => {
          const file = e.target.files[0];
          const blob = new Blob([await file.arrayBuffer()], {
            type: 'image/png',
          });
          const url = URL.createObjectURL(blob);
          setImage(url);
        }}
      />
    </>
  );
}

const toBlob = (canvas: HTMLCanvasElement) =>
  new Promise<Blob>((res) => canvas.toBlob(res));
async function uploadProfilePicture(canvas: HTMLCanvasElement) {
  const image = canvas.toDataURL();

  const formData = new FormData();
  formData.append('file', new File([image], 'avatar.png'));

  const res = await fetch('/api/updateProfilePicture', {
    method: 'POST',
    body: image,
  });
}

export default ProfilePictureModal;
