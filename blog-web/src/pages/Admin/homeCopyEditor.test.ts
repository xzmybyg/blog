import { describe, expect, it } from 'vitest'
import { DEFAULT_HOME_CONTENT } from '@/apis/lib/homeContent'
import { formatHomeCopy, parseHomeCopy } from './homeCopyEditor'

describe('home copy editor', () => {
  it('preserves existing content through the combined editor', () => {
    const text = formatHomeCopy(DEFAULT_HOME_CONTENT)
    expect(text.match(/\[轮播\]/g)).toHaveLength(1)
    expect(text).toContain('[轮播]\n一名前端开发工程师\nA Web <Developer />')
    expect(parseHomeCopy(text)).toEqual(DEFAULT_HOME_CONTENT)
  })

  it('saves and reloads the order chosen in the editor', () => {
    const reordered = {
      ...DEFAULT_HOME_CONTENT,
      sectionOrder: ['description', 'title', 'eyebrow', 'typedTexts', 'authorName'] as typeof DEFAULT_HOME_CONTENT.sectionOrder,
    }
    expect(parseHomeCopy(formatHomeCopy(reordered))).toEqual(reordered)
  })

  it('orders the editor sections like the homepage', () => {
    const text = formatHomeCopy(DEFAULT_HOME_CONTENT)
    expect(text.indexOf('[眉题]')).toBeLessThan(text.indexOf('[主标题]'))
    expect(text.indexOf('[主标题]')).toBeLessThan(text.indexOf('[作者名]'))
    expect(text.indexOf('[作者名]')).toBeLessThan(text.indexOf('[轮播]'))
    expect(text.lastIndexOf('[轮播]')).toBeLessThan(text.indexOf('[简介]'))
  })

  it('only treats marked sections as rotating copy', () => {
    const text = formatHomeCopy(DEFAULT_HOME_CONTENT).replace('[轮播]\n一名前端开发工程师', '[轮播]\n第一条轮播\n\n')
    expect(parseHomeCopy(text).typedTexts).toEqual(['第一条轮播', 'A Web <Developer />'])
    expect(parseHomeCopy(text).title).toBe('把复杂的问题，\n写成清晰的答案。')
  })

  it('accepts the previous consecutive marker format', () => {
    const oldText = formatHomeCopy(DEFAULT_HOME_CONTENT).replace('一名前端开发工程师\nA Web <Developer />', '一名前端开发工程师\n\n[轮播]\nA Web <Developer />')
    expect(parseHomeCopy(oldText).typedTexts).toEqual(DEFAULT_HOME_CONTENT.typedTexts)
  })

  it('limits the number of newline-separated rotating lines', () => {
    const text = formatHomeCopy(DEFAULT_HOME_CONTENT).replace('一名前端开发工程师\nA Web <Developer />', Array.from({ length: 9 }, (_, index) => `第 ${index + 1} 条`).join('\n'))
    expect(() => parseHomeCopy(text)).toThrow('1–8 条')
  })

  it('rejects unknown or duplicate markers and empty sections', () => {
    const text = formatHomeCopy(DEFAULT_HOME_CONTENT)
    expect(() => parseHomeCopy(text.replace('[轮播]', '[动态]'))).toThrow('未知标记')
    expect(() => parseHomeCopy(`${text}\n\n[眉题]\n重复`)).toThrow('只能出现一次')
    expect(() => parseHomeCopy(text.replace('[作者名]\n心中没有白月光', '[作者名]\n'))).toThrow('需要填写内容')
    expect(() => parseHomeCopy(`${text}\n\n[轮播]\n另一条`)).toThrow('需要连续填写')
  })
})
