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
    async session({ session, token }) {
      // expose user id
      return Promise.resolve({
        ...session,
        user: { ...session.user, id: token.sub },
      });
    },
  },
  providers: [
    Credentials({
      id: 'credentials',
      authorize: async (credentials: any, res) => {
        if (!credentials.email || !credentials.password) return null;

        prisma.$connect();
        const user = await prisma.user.findFirst({
          where: {
            email: credentials.email,
          },
        });
        if (!user) return null;

        if ((await compare(credentials.password, user.password)) === false) {
          return null;
        }
        prisma.$disconnect();

        if (user) {
          return {
            name: user.name,
            username: user.username,
            email: user.email,
            id: user.id,
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
    email: string;
    id: string | undefined;
  };
}

export type { SessionWithUserId };
