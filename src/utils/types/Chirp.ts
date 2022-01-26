interface Chirp {
  createdAt: number;
  author: {
    id: string;
    name: string;
    username: string;
  };
  content: string;
  id: string;
  authorId: string;
  numLikes: number;
  // whether the signed-in user has liked the chirp
  liked: boolean;
}

export type { Chirp };
