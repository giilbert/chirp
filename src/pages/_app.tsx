import { ChakraProvider } from '@chakra-ui/react';
import { SessionProvider } from 'next-auth/react';
import { AppProps } from 'next/app';
import { AnimatePresence, motion } from 'framer-motion';
import '../utils/global.css';

function App({ Component, pageProps, router }: AppProps) {
  return (
    <AnimatePresence exitBeforeEnter>
      <motion.div
        initial="pageInitial"
        animate="pageAnimate"
        variants={{
          pageInitial: {
            x: -50,
            opacity: 0,
          },
          pageAnimate: {
            x: 0,
            opacity: 1,
            transition: {
              ease: 'easeOut',
            },
          },
        }}
        exit={{
          x: 50,
          opacity: 0,
          transition: {
            ease: 'easeOut',
          },
        }}
        key={router.route}
      >
        <SessionProvider session={pageProps.session}>
          <ChakraProvider>
            <Component {...pageProps}></Component>
          </ChakraProvider>
        </SessionProvider>
      </motion.div>
    </AnimatePresence>
  );
}

export default App;
