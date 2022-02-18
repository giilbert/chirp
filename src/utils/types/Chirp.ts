interface Chirp {
  createdAt: number;
  author: {
    id: string;
    name: string;
    username: string;
    pfpUrl: string;
  };
  content: string;
  id: string;
  authorId: string;
  numLikes: number;
  // whether the signed-in user has liked the chirp
  liked: boolean;

  replyTo?: {
    // chirp id
    id: string;
    author: {
      id: string;
      name: string;
      username: string;
    };
  };

  // array of urls to the media
  chirpMedia: string[];
}

export type { Chirp };
