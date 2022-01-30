import { ChakraProvider } from '@chakra-ui/react';
import { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { SessionProvider } from 'next-auth/react';
import NProgress from 'nprogress';
import { useEffect } from 'react';

import '../utils/global.css';
import '../utils/nprogress.css';

function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    const NPStart = () => {
      NProgress.start();
    };
    const NPEnd = () => {
      NProgress.done();
    };

    router.events.on('routeChangeStart', NPStart);
    router.events.on('routeChangeComplete', NPEnd);
    router.events.on('routeChangeError', NPEnd);

    return () => {
      router.events.off('routeChangeStart', NPStart);
      router.events.off('routeChangeComplete', NPEnd);
      router.events.off('routeChangeError', NPEnd);
    };
  }, [router]);

  return (
    <SessionProvider session={pageProps.session}>
      <ChakraProvider>
        <Component {...pageProps}></Component>
      </ChakraProvider>
    </SessionProvider>
  );
}

export default App;
