import type { Blog, BlogResponse, TagResponse } from "./types";

/**
 * ブログの情報を取得するためのインターフェース
 */
export interface BlogRepository {
  /**
   * ブログのメタ情報一覧を取得する関数
   * @param queries
   */
  getBlogMetaDatas(offset?: number, limit?: number): Promise<Blog[]>;

  /**
   * 全てのブログ記事を取得する関数
   */
  getAllBlogs(): Promise<Blog[]>;

  /**
   * タグを含むブログのメタ情報一覧を取得する関数
   * @param tagId
   * @param offset
   * @param limit
   */
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
