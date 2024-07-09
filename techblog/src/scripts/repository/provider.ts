import type { BlogRepository } from "./interfaces";
import { MicroCmsReqository } from "./microcms";

/**
 * CMSの差異を吸収するために使用。各リポジトリは直接利用するのではなくてこちらを基本的に使用する
 */
export const blogRepository: BlogRepository = new MicroCmsReqository();
