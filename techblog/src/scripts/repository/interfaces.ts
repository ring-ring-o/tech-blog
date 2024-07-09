import type { Blog, BlogResponse, TagResponse } from "./types";

/**
 * ブログの情報を取得するためのインターフェース
 */
export interface BlogRepository {
  /**
   * ブログ一覧を取得する関数
   * @param queries
   */
  getBlogs(offset?: number, limit?: number): Promise<BlogResponse>;

  getTagFilteredBlogs(
    tagId: string,
    offset?: number,
    limit?: number,
  ): Promise<BlogResponse>;

  /**
   * ブログの記事詳細を取得する関数
   * @param contentId
   * @param queries
   */
  getBlogDetail(contentId: string): Promise<Blog>;

  /**
   * カテゴリーを取得する関数
   */
  getTags(): Promise<TagResponse>;
}
