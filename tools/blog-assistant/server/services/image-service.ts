import sharp from 'sharp'
import { writeFile, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, parse } from 'node:path'
import crypto from 'node:crypto'

// 画像保存先ディレクトリ
const IMAGES_DIR = '/workspace/public/images/posts'

// 最適化設定
const MAX_WIDTH = 1200
const WEBP_QUALITY = 85

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
   * 画像をアップロードして最適化
   */
  async uploadImage(
    buffer: Buffer,
    originalFilename: string
  ): Promise<ImageUploadResult> {
    // ディレクトリが存在しない場合は作成
    if (!existsSync(IMAGES_DIR)) {
      await mkdir(IMAGES_DIR, { recursive: true })
    }

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

    // ユニークなファイル名を生成
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
    const filename = `${timestamp}-${baseName}-${hash}.webp`

    // ファイルを保存
    const filePath = join(IMAGES_DIR, filename)
    await writeFile(filePath, optimizedBuffer)

    // Markdownで使用するURL（publicディレクトリからの相対パス）
    const markdownUrl = `/images/posts/${filename}`

    return {
      filename,
      path: filePath,
      markdownUrl,
      width: optimizedMetadata.width || 0,
      height: optimizedMetadata.height || 0,
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
