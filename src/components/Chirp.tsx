import { Container, Text } from '@chakra-ui/react';
import { User } from '@prisma/client';

interface ChirpProps {
  content: string;
  author: User;
}

function Chirp({ author }: ChirpProps) {
  return (
    <Container>
      <Text>{author.id}</Text>
    </Container>
  );
}

export default Chirp;
