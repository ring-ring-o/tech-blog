import sharp from 'sharp'
import { writeFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, parse } from 'node:path'
import crypto from 'node:crypto'
import type {
  BlogDirectory,
  ImageUploadResponse,
} from '../types/index.js'
import { articleService } from './article-service.js'

// 最適化設定
const MAX_WIDTH = 1200
const WEBP_QUALITY = 90

/**
 * @deprecated 古い形式。互換性のために残す
 */
export interface ImageUploadResult {
  filename: string
  path: string
  markdownUrl: string
  width: number
  height: number
  size: number
}

export class ImageService {
  /**
   * 画像を最適化してバッファを返す（共通処理）
   */
  private async optimizeImage(buffer: Buffer): Promise<{
    optimizedBuffer: Buffer
    width: number
    height: number
  }> {
    // 画像のメタデータを取得
    const metadata = await sharp(buffer).metadata()

    // リサイズが必要かどうか判定
    const needsResize = metadata.width && metadata.width > MAX_WIDTH

    // 画像を最適化
    let processedImage = sharp(buffer)

    if (needsResize) {
      processedImage = processedImage.resize(MAX_WIDTH, null, {
        withoutEnlargement: true,
        fit: 'inside',
      })
    }

    // WebPに変換
    const optimizedBuffer = await processedImage
      .webp({ quality: WEBP_QUALITY })
      .toBuffer()

    // 最適化後のメタデータを取得
    const optimizedMetadata = await sharp(optimizedBuffer).metadata()

    return {
      optimizedBuffer,
      width: optimizedMetadata.width || 0,
      height: optimizedMetadata.height || 0,
    }
  }

  /**
   * ユニークなファイル名を生成
   */
  private generateFilename(originalFilename: string, buffer: Buffer): string {
    const timestamp = Date.now()
    const hash = crypto
      .createHash('md5')
      .update(buffer)
      .digest('hex')
      .substring(0, 8)
    const baseName = parse(originalFilename).name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 30)
    return `${timestamp}-${baseName}-${hash}.webp`
  }

  /**
   * 記事のフォルダ内に画像をアップロード
   * Astroの画像最適化に対応した相対パスを返す
   */
  async uploadImageToArticle(
    buffer: Buffer,
    originalFilename: string,
    directory: BlogDirectory,
    slug: string
  ): Promise<ImageUploadResponse> {
    // 記事の画像フォルダを確保
    const imagesDir = await articleService.ensureArticleImagesDir(
      directory,
      slug
    )

    // 画像を最適化
    const { optimizedBuffer, width, height } = await this.optimizeImage(buffer)

    // ファイル名を生成
    const filename = this.generateFilename(originalFilename, buffer)

    // ファイルを保存
    const absolutePath = join(imagesDir, filename)
    await writeFile(absolutePath, optimizedBuffer)

    // Markdown用の相対パス（./images/filename.webp）
    const relativePath = `./images/${filename}`

    return {
      success: true,
      filename,
      absolutePath,
      relativePath,
      markdown: `![](${relativePath})`,
      width,
      height,
      size: optimizedBuffer.length,
    }
  }

  /**
   * 記事のフォルダ内にBase64画像をアップロード
   */
  async uploadBase64ImageToArticle(
    base64Data: string,
    filename: string,
    directory: BlogDirectory,
    slug: string
  ): Promise<ImageUploadResponse> {
    const base64Clean = base64Data.replace(/^data:image\/\w+;base64,/, '')
    const buffer = Buffer.from(base64Clean, 'base64')
    return this.uploadImageToArticle(
      buffer,
      filename || 'pasted-image.png',
      directory,
      slug
    )
  }

  /**
   * @deprecated 古い形式。互換性のために残す。public/images/postsに保存
   */
  async uploadImage(
    buffer: Buffer,
    originalFilename: string
  ): Promise<ImageUploadResult> {
    const IMAGES_DIR = '/workspace/public/images/posts'

    // ディレクトリが存在しない場合は作成
    if (!existsSync(IMAGES_DIR)) {
      await mkdir(IMAGES_DIR, { recursive: true })
    }

    // 画像を最適化
    const { optimizedBuffer, width, height } = await this.optimizeImage(buffer)

    // ファイル名を生成
    const filename = this.generateFilename(originalFilename, buffer)

    // ファイルを保存
    const filePath = join(IMAGES_DIR, filename)
    await writeFile(filePath, optimizedBuffer)

    // Markdownで使用するURL（publicディレクトリからの相対パス）
    const markdownUrl = `/images/posts/${filename}`

    return {
      filename,
      path: filePath,
      markdownUrl,
      width,
      height,
      size: optimizedBuffer.length,
    }
  }

  /**
   * Base64データから画像をアップロード
   */
  async uploadBase64Image(
    base64Data: string,
    filename: string = 'image.png'
  ): Promise<ImageUploadResult> {
    // Base64プレフィックスを除去
    const base64Clean = base64Data.replace(/^data:image\/\w+;base64,/, '')
    const buffer = Buffer.from(base64Clean, 'base64')
    return this.uploadImage(buffer, filename)
  }

  /**
   * 画像のMarkdown記法を生成
   */
  generateMarkdown(result: ImageUploadResult, alt: string = ''): string {
    return `![${alt}](${result.markdownUrl})`
  }
}

export const imageService = new ImageService()
