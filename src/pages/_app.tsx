import { ChakraProvider } from '@chakra-ui/react';
import { AppProps } from 'next/app';

function App({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider>
      <Component {...pageProps}></Component>
    </ChakraProvider>
  );
}

export default App;
