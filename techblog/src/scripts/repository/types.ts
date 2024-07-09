/**
 * ブログ詳細
 */
export type Blog = {
  id: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  revisedAt: string;
  title: string;
  content: string;
  eyecatch: string;
  tags?: string[];
};

/**
 * ブログ記事一覧
 */
export type BlogResponse = {
  totalCount: number;
  offset: number;
  limit: number;
  contents: Blog[];
};

export type Tag = {
  id: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  revisedAt: string;
  name: string;
};

export type TagResponse = {
  totalCount: number;
  offset: number;
  limit: number;
  contents: Tag[];
};
