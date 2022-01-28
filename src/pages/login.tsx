import {
  Button,
  Center,
  Container,
  Divider,
  Heading,
  Input,
  InputGroup,
  Text,
  Link,
} from '@chakra-ui/react';
import { Form, Formik, FormikProps } from 'formik';
import { GetServerSideProps } from 'next';
import { getSession, signIn } from 'next-auth/react';
import { useState } from 'react';
import NextLink from 'next/link';
import * as Yup from 'yup';

function LoginPage() {
  return (
    <Center>
      <Container width="600px" mt="50px">
        <Heading>Login</Heading>
        <Divider my="20px" />
        <LoginForm />
      </Container>
    </Center>
  );
}

const schema = Yup.object().shape({
  username: Yup.string().required('Username is required'),
  password: Yup.string().required('Password is required'),
});

interface FormValues {
  username: string;
  password: string;
}

const LoginForm = () => {
  const [formError, setFormError] = useState('');

  return (
    <Formik
      initialValues={{
        username: '',
        password: '',
      }}
      validationSchema={schema}
      onSubmit={async (values, { setErrors }) => {
        await signIn('credentials', {
          username: values.username,
          password: values.password,
          redirect: false,
        }).then((result) => {
          if (result.ok) window.location.href = '/';
          else if (result.status === 401)
            setFormError('Invalid email or password');
          else if (result.status !== 401) setFormError('An error occured');
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
          <InputGroup flexDirection="column" mb="20px">
            <Text>Username</Text>
            <Input
              placeholder="johnd"
              onChange={(e) => setFieldValue('username', e.target.value)}
            />
            <Text color="red.300">{errors.username}</Text>
          </InputGroup>

          <InputGroup flexDirection="column" mb="20px">
            <Text>Password</Text>
            <Input
              placeholder="**********"
              type="password"
              onChange={(e) => setFieldValue('password', e.target.value)}
            />
            <Text color="red.300">{errors.password}</Text>
          </InputGroup>

          <Text colorScheme="red">{formError}</Text>

          <Button
            type="submit"
            colorScheme="blue"
            isLoading={isSubmitting}
            mb="2"
          >
            Login
          </Button>

          <br />

          <NextLink href="/register" passHref>
            <Link color="cyan.400">Don't have an account? Register</Link>
          </NextLink>
        </Form>
      )}
    </Formik>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getSession({ ctx });
  if (session)
    return {
      redirect: {
        destination: '/',
        statusCode: 303,
      },
    };

  return {
    props: {},
  };
};

export default LoginPage;
