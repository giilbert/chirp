import {
  Button,
  Center,
  Container,
  Divider,
  Heading,
  Input,
  InputGroup,
  Text,
} from '@chakra-ui/react';
import { Form, Formik, FormikProps } from 'formik';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import * as Yup from 'yup';

function RegisterPage() {
  return (
    <Center>
      <Container width="600px" mt="50px">
        <Heading>Register</Heading>
        <Divider my="20px" />
        <RegisterForm />
      </Container>
    </Center>
  );
}

const schema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  username: Yup.string()
    .min(4, 'Username must be at least 4 characters long')
    .max(20, 'Username can not be longer than 20 characters')
    .required('Username is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters long')
    .required('Password is required'),
  confirmPassword: Yup.string().oneOf(
    [Yup.ref('password'), null],
    'Passwords do not match'
  ),
});

interface FormValues {
  name: string;
  username: string;
  password: string;
  confirmPassword: string;
}

const RegisterForm = () => (
  <Formik
    initialValues={{
      name: '',
      username: '',
      password: '',
      confirmPassword: '',
    }}
    validationSchema={schema}
    onSubmit={async (values, { setErrors }) => {
      const res = await fetch('/api/auth/register', {
        body: JSON.stringify(values),
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      try {
        const errors = await res.json();
        if (errors) setErrors(errors);
      } catch {
        window.location.href = '/login';
      }
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
          <Text>Name</Text>
          <Input
            placeholder="John Doe"
            onChange={(e) => setFieldValue('name', e.target.value)}
          />
          <Text color="red.300">{errors.name}</Text>
        </InputGroup>

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

        <InputGroup flexDirection="column" mb="20px">
          <Text>Confirm Password</Text>
          <Input
            placeholder="**********"
            type="password"
            onChange={(e) => setFieldValue('confirmPassword', e.target.value)}
          />
          <Text color="red.300">{errors.confirmPassword}</Text>
        </InputGroup>

        <Button type="submit" colorScheme="blue" isLoading={isSubmitting}>
          Register
        </Button>
      </Form>
    )}
  </Formik>
);

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

export default RegisterPage;
