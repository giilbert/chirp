import {
  Text,
  TextareaProps,
  Textarea,
  Box,
  Button,
  ButtonGroup,
  useDisclosure,
  Modal,
  UseDisclosureProps,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalOverlay,
  Center,
  Flex,
} from '@chakra-ui/react';
import { Formik, FormikProps, Form } from 'formik';
import { motion } from 'framer-motion';
import { EventEmitter } from 'node:events';
import { Dispatch, SetStateAction, useState } from 'react';
import Dropzone from 'react-dropzone';
import * as Yup from 'yup';

interface FormValues {
  content: string;
}

interface CreateChirpProps {
  listener: EventEmitter;
  replyToId?: string;
}

const schema = Yup.object().shape({
  content: Yup.string().required('You need something to chirp about'),
});

const maxLength = 500;
const AnimatedTextarea = motion<TextareaProps>(Textarea);

function CreateChirp({ listener, replyToId }: CreateChirpProps) {
  const [value, setValue] = useState('');
  const disclosure = useDisclosure();
  const [images, setImages] = useState<File[]>([]);

  return (
    <Box my="10">
      <AddMediaMenu {...disclosure} attachImages={setImages} />
      <Formik
        initialValues={{
          content: '',
        }}
        validationSchema={schema}
        onSubmit={(values, helpers) => {
          const formData = new FormData();
          formData.append(
            'chirp',
            JSON.stringify({
              ...values,
              replyToId,
            })
          );
          images.forEach((v) => formData.append('media', v));

          // TODO: error handling (toast)
          fetch('/api/createChirp', {
            method: 'POST',
            body: formData,
          }).then(async (res) => {
            if (res.ok) {
              listener.emit('add-chirp');

              helpers.resetForm();
              setValue('');
            }
          });
        }}
      >
        {({
          errors,
          isSubmitting,
          setFieldValue,
        }: /* and other goodies */
        FormikProps<FormValues>) => (
          <Form>
            <AnimatedTextarea
              placeholder={
                replyToId ? 'Reply to this Chirp!' : 'Chirp about something!'
              }
              resize="none"
              height="30px"
              whileFocus={{
                height: '200px',
              }}
              value={value}
              isDisabled={isSubmitting}
              onChange={(e) => {
                setFieldValue('content', e.target.value, false);
                // also update the counter
                setValue(e.target.value.substring(0, maxLength));
              }}
            />
            <Text color="gray.400">
              {value.length}/{maxLength}
            </Text>
            <Text color="red.300">{errors.content}</Text>
            {images.length > 0 && (
              <Text>
                {images.length} image{images.length > 1 && 's'} attached
              </Text>
            )}

            <ButtonGroup>
              <Button
                colorScheme="green"
                type="submit"
                isLoading={isSubmitting}
              >
                Chirp
              </Button>

              <Button onClick={disclosure.onOpen}>Add Media</Button>
            </ButtonGroup>
          </Form>
        )}
      </Formik>
    </Box>
  );
}

function AddMediaMenu({
  isOpen,
  onClose,
  attachImages,
}: UseDisclosureProps & {
  attachImages: Dispatch<SetStateAction<File[]>>;
}) {
  const [images, setImages] = useState<{ file: File; url: string }[]>([]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton />

        <ModalBody>
          <Dropzone
            accept="image/*"
            onDrop={(files: File[]) => {
              if (images.length > 4) return;

              const parsed = files.map((file) => {
                const url = URL.createObjectURL(file);

                return {
                  url,
                  file,
                };
              });

              setImages([...parsed, ...images].slice(0, 4));
            }}
          >
            {({ getRootProps }) => (
              <Center
                mt="10"
                width="100%"
                height="200px"
                border="1px solid #aaa"
                {...getRootProps()}
              >
                <Box textAlign="center">
                  <Text>Drop files here</Text>
                  or <Text color="cyan.400">Click to upload</Text>
                </Box>
              </Center>
            )}
          </Dropzone>
          <Text colorScheme="gray">Maximum of 4 allowed, max of 4MBs each</Text>

          <Flex flexWrap="wrap">
            {images.map((image, i) => (
              <Box mt="5" key={i}>
                <Button
                  colorScheme="red"
                  mb="2"
                  onClick={() => {
                    setImages((current) => {
                      const clone = [...current];
                      clone.splice(i, 1);
                      return clone;
                    });
                  }}
                >
                  Remove
                </Button>
                <Text display="inline-block" ml="2">
                  {(image.file.size / 1048576).toFixed(2)}MB
                </Text>
                <img src={image.url} width="200px" height="200px" />
              </Box>
            ))}
          </Flex>
        </ModalBody>

        <ModalFooter>
          <Button
            mr="2"
            onClick={() => {
              onClose();
              attachImages(images.map((v) => v.file));
            }}
            colorScheme="purple"
          >
            Add
          </Button>
          <Button mr={3} onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default CreateChirp;
