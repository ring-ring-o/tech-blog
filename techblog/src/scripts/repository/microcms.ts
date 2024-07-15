import { type MicroCMSQueries, createClient } from "microcms-js-sdk";
import type { BlogRepository } from "./interfaces";
import type { Blog, BlogResponse, Tag, TagResponse } from "./types";

/**
 * MicroCMSを記事のリポジトリとした場合のデータ取得実装
 */
export class MicroCmsReqository implements BlogRepository {
  private blogApiEndpoint = "blogs";
  private tagsApiEndpoint = "tags";
  client;

  constructor() {
    this.client = createClient({
      serviceDomain: import.meta.env.MICROCMS_SERVICE_DOMAIN,
      apiKey: import.meta.env.MICROCMS_API_KEY,
    });
  }

  async getBlogMetaDatas(offset = 1, limit?: number): Promise<Blog[]> {
    return await this.client.getAllContents<Blog>({
      endpoint: this.blogApiEndpoint,
      queries: {
        fields: ["id", "title", "updatedAt", "tags.id", "tags.name"],
      },
    });
  }

  async getAllBlogs(): Promise<Blog[]> {
    return await this.client.getAllContents<Blog>({
      endpoint: this.blogApiEndpoint,
    });
  }

  async getTagFilteredBlogs(
    tagId: string,
    offset?: number,
    limit?: number,
  ): Promise<BlogResponse> {
    return await this.client.get<BlogResponse>({
      endpoint: this.blogApiEndpoint,
      queries: {
        fields: ["id", "title"],
        filters: `tags[contains]${tagId}`,
      },
    });
  }

  async getBlogDetail(contentId: string): Promise<Blog> {
    return await this.client.getListDetail<Blog>({
      endpoint: this.blogApiEndpoint,
      contentId,
    });
  }

  async getTags(): Promise<TagResponse> {
    return await this.client.get<TagResponse>({
      endpoint: this.tagsApiEndpoint,
      queries: {
        fields: ["id", "name"],
      },
    });
  }
}
