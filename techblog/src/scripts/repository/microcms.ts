import { type MicroCMSQueries, createClient } from "microcms-js-sdk";
import type { BlogRepository } from "./interfaces";
import type { Blog, BlogResponse, Tag, TagResponse } from "./types";

/**
 * MicroCMSを記事のリポジトリとした場合のデータ取得実装
 */
export class MicroCmsReqository implements BlogRepository {
  client;
  constructor() {
    this.client = createClient({
      serviceDomain: import.meta.env.MICROCMS_SERVICE_DOMAIN,
      apiKey: import.meta.env.MICROCMS_API_KEY,
    });
  }

  async getBlogs(offset = 1, limit?: number): Promise<BlogResponse> {
    return await this.client.get<BlogResponse>({
      endpoint: "blogs",
      queries: {
        fields: ["id", "title"],
      },
    });
  }

  async getTagFilteredBlogs(
    tagId: string,
    offset?: number,
    limit?: number,
  ): Promise<BlogResponse> {
    return await this.client.get<BlogResponse>({
      endpoint: "blogs",
      queries: {
        fields: ["id", "title"],
        filters: `tags[contains]${tagId}`,
      },
    });
  }

  async getBlogDetail(contentId: string): Promise<Blog> {
    return await this.client.getListDetail<Blog>({
      endpoint: "blogs",
      contentId,
    });
  }

  async getTags(): Promise<TagResponse> {
    return await this.client.get<TagResponse>({
      endpoint: "tags",
      queries: {
        fields: ["id", "name"],
      },
    });
  }
}
