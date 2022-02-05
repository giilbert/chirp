import { Text, TextareaProps, Textarea, Box, Button } from '@chakra-ui/react';
import { Formik, FormikProps, Form } from 'formik';
import { motion } from 'framer-motion';
import { EventEmitter } from 'node:events';
import { useState } from 'react';
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

  return (
    <Box my="10">
      <Formik
        initialValues={{
          content: '',
        }}
        validationSchema={schema}
        onSubmit={(values, helpers) => {
          // TODO: error handling (toast)
          fetch('/api/createChirp', {
            method: 'POST',
            body: JSON.stringify({
              ...values,
              replyToId,
            }),
            headers: {
              'Content-Type': 'application/json',
            },
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

            <Button colorScheme="green" type="submit" isLoading={isSubmitting}>
              Chirp
            </Button>
          </Form>
        )}
      </Formik>
    </Box>
  );
}

export default CreateChirp;
