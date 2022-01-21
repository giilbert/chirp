import { Center, Container, Input, InputGroup, Text } from '@chakra-ui/react';
import { Form, Formik, FormikProps } from 'formik';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';

function RegisterPage() {
  return (
    <Center>
      <Container width="500px">
        <RegisterForm />
      </Container>
    </Center>
  );
}

const RegisterForm = () => (
  <Formik
    initialValues={{
      username: '',
    }}
    onSubmit={(values) => {
      console.log(values);
    }}
  >
    {({
      values,
      errors,
      touched,
      handleChange,
      handleBlur,
      handleSubmit,
      isSubmitting,
    }: /* and other goodies */
    FormikProps<{}>) => (
      <Form>
        <InputGroup flexDirection="column">
          <Text>Username</Text>
          <Input placeholder="John Doe" />
        </InputGroup>

        <InputGroup flexDirection="column">
          <Text>Password</Text>
          <Input placeholder="**********" />
        </InputGroup>

        <InputGroup flexDirection="column">
          <Text>Confirm Password</Text>
          <Input placeholder="**********" />
        </InputGroup>
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
