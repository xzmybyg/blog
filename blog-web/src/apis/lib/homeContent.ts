export type HomeContentSection = 'eyebrow' | 'title' | 'authorName' | 'typedTexts' | 'description'

export const DEFAULT_HOME_CONTENT_ORDER: HomeContentSection[] = ['eyebrow', 'title', 'authorName', 'typedTexts', 'description']

export type HomeContent = {
  eyebrow: string
  title: string
  authorName: string
  description: string
  typedTexts: string[]
  sectionOrder: HomeContentSection[]
}

export const DEFAULT_HOME_CONTENT: HomeContent = {
  eyebrow: 'FRONTEND FIELD NOTES · BEIJING',
  title: '把复杂的问题，\n写成清晰的答案。',
  authorName: '心中没有白月光',
  description: '这里记录前端工程、产品体验和持续学习中的真实解法。',
  typedTexts: ['一名前端开发工程师', 'A Web <Developer />'],
  sectionOrder: DEFAULT_HOME_CONTENT_ORDER,
}

export function getHomeContent() {
  return axiosInstance.get<HomeContent>('/home-content')
}

export function updateHomeContent(content: HomeContent) {
  return axiosInstance.put<HomeContent>('/home-content', content)
}
