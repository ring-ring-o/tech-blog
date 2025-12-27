/**
 * @fileoverview UI関連の設定値
 * @description アニメーション時間や表示用マッピングなどのUI定数
 */

export const UI_TIMING = {
  /** コピー成功表示の持続時間（ミリ秒） */
  COPY_SUCCESS_DURATION: 2000,
} as const

/**
 * 言語名の表示用マッピング
 * @description コードフェンスで指定される言語識別子を読みやすい表示名に変換
 */
export const LANGUAGE_DISPLAY_NAMES: Record<string, string> = {
  js: 'JavaScript',
  javascript: 'JavaScript',
  ts: 'TypeScript',
  typescript: 'TypeScript',
  jsx: 'JSX',
  tsx: 'TSX',
  html: 'HTML',
  css: 'CSS',
  scss: 'SCSS',
  sass: 'Sass',
  less: 'Less',
  json: 'JSON',
  yaml: 'YAML',
  yml: 'YAML',
  xml: 'XML',
  md: 'Markdown',
  markdown: 'Markdown',
  mdx: 'MDX',
  py: 'Python',
  python: 'Python',
  rb: 'Ruby',
  ruby: 'Ruby',
  go: 'Go',
  rust: 'Rust',
  rs: 'Rust',
  java: 'Java',
  kotlin: 'Kotlin',
  kt: 'Kotlin',
  swift: 'Swift',
  c: 'C',
  cpp: 'C++',
  'c++': 'C++',
  cs: 'C#',
  csharp: 'C#',
  php: 'PHP',
  sql: 'SQL',
  graphql: 'GraphQL',
  gql: 'GraphQL',
  bash: 'Bash',
  sh: 'Shell',
  shell: 'Shell',
  zsh: 'Zsh',
  powershell: 'PowerShell',
  ps1: 'PowerShell',
  dockerfile: 'Dockerfile',
  docker: 'Docker',
  nginx: 'Nginx',
  apache: 'Apache',
  astro: 'Astro',
  vue: 'Vue',
  svelte: 'Svelte',
  diff: 'Diff',
  text: 'Text',
  txt: 'Text',
  plaintext: 'Plain Text',
} as const
