import NextAuth, { Session, User } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { PrismaClient } from '.prisma/client';
import { compare } from 'bcrypt';

const prisma = new PrismaClient();

export default NextAuth({
  secret: process.env.JWT_SECRET,
  jwt: {
    signingKey: process.env.JWT_SIGNING_KEY,
  },
  callbacks: {
    async jwt({ token, user, profile, account, isNewUser }) {
      // console.log('-----------------');
      // console.log('jwt', token, user, profile, account, isNewUser);
      // console.log('-----------------');

      if (user?.username) token.username = user.username;

      return token;
    },
    async session({ session: defaultSession, token }) {
      const session = defaultSession as SessionWithUserId;
      // console.log('----------------');
      // console.log('session ', session);
      // console.log('token ', token);
      // console.log('user ', user);
      // console.log('----------------');

      // expose user id and username
      if (token && session.user) {
        session.user.username = token.username as string;
        session.user.id = token.id as string;
      }

      return Promise.resolve(session);
    },
  },
  providers: [
    Credentials({
      id: 'credentials',
      authorize: async (credentials: any, res) => {
        if (!credentials.username || !credentials.password) return null;

        prisma.$connect();
        const user = await prisma.user.findFirst({
          where: {
            username: credentials.username,
          },
        });
        if (!user) return null;

        if ((await compare(credentials.password, user.password)) === false) {
          return null;
        }
        prisma.$disconnect();

        // console.log(user);

        if (user) {
          return {
            id: user.id,
            name: user.name,
            username: user.username,
          };
        } else {
          return null;
        }
      },
    }),
  ],
});

interface SessionWithUserId extends Session {
  expires: string;
  user: {
    name: string;
    username: string;
    id: string | undefined;
  };
}

export type { SessionWithUserId };
