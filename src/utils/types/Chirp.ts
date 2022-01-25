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
}

export type { Chirp };
