export type ThemeAnimationSettings = {
  durationMs: number
}

export function getThemeAnimation() {
  return axiosInstance.get<ThemeAnimationSettings>('/theme-animation')
}

export function updateThemeAnimation(settings: ThemeAnimationSettings) {
  return axiosInstance.put<ThemeAnimationSettings>('/theme-animation', settings)
}
