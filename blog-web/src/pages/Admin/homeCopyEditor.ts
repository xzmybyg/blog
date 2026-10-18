import { DEFAULT_HOME_CONTENT_ORDER, type HomeContent, type HomeContentSection } from '@/apis/lib/homeContent'

const markers = {
  眉题: 'eyebrow',
  主标题: 'title',
  作者名: 'authorName',
  简介: 'description',
  轮播: 'typedTexts',
} as const

type StaticField = Exclude<HomeContentSection, 'typedTexts'>
const labels: Record<StaticField, string> = { eyebrow: '眉题', title: '主标题', authorName: '作者名', description: '简介' }

export function formatHomeCopy(content: HomeContent): string {
  return (content.sectionOrder || DEFAULT_HOME_CONTENT_ORDER).flatMap((field) => field === 'typedTexts'
    ? [`[轮播]\n${content.typedTexts.join('\n')}`]
    : [`[${labels[field]}]\n${content[field]}`]).join('\n\n')
}

export function parseHomeCopy(input: string): HomeContent {
  const content: HomeContent = { eyebrow: '', title: '', authorName: '', description: '', typedTexts: [], sectionOrder: [] }
  const limits: Record<StaticField, number> = { eyebrow: 80, title: 120, authorName: 40, description: 300 }
  const seen = new Set<StaticField>()
  let current: HomeContentSection | null = null
  let lines: string[] = []

  const saveSection = () => {
    if (!current) return
    if (current === 'typedTexts') {
      const texts = lines.map((line) => line.trim()).filter(Boolean)
      if (!texts.length) throw new Error('[轮播] 后至少填写一条文案')
      if (texts.some((text) => text.length > 80)) throw new Error('每条轮播文案不能超过 80 字')
      content.typedTexts.push(...texts)
    } else {
      const value = lines.join('\n').trim()
      if (!value) throw new Error('每个标记后都需要填写内容')
      if (value.length > limits[current]) throw new Error(`${labels[current]}不能超过 ${limits[current]} 字`)
      content[current] = value
    }
    lines = []
  }

  for (const line of input.replace(/\r\n/g, '\n').split('\n')) {
    const marker = /^\[(.+)\]$/.exec(line.trim())
    if (marker) {
      const field = markers[marker[1] as keyof typeof markers]
      if (!field) throw new Error(`未知标记：[${marker[1]}]`)
      saveSection()
      if (field === 'typedTexts') {
        if (content.sectionOrder.includes(field) && current !== field) throw new Error('[轮播] 标记需要连续填写')
        if (!content.sectionOrder.includes(field)) content.sectionOrder.push(field)
      } else {
        if (seen.has(field)) throw new Error(`[${marker[1]}] 只能出现一次`)
        seen.add(field)
        content.sectionOrder.push(field)
      }
      current = field
    } else if (current) {
      lines.push(line)
    } else if (line.trim()) {
      throw new Error('文案须从 [眉题] 等标记开始')
    }
  }
  saveSection()

  for (const field of Object.keys(limits) as StaticField[]) {
    if (!content[field]) throw new Error(`缺少 [${labels[field]}] 内容`)
  }
  if (content.typedTexts.length < 1 || content.typedTexts.length > 8) {
    throw new Error('请填写 1–8 条 [轮播] 文案')
  }
  return content
}
