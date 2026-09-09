export function getInfo() {
  return axiosInstance.get('/bloginfo')
}

export type CertificateStatus = {
  domain: string
  validTo: string
  remainingDays: number
  issuer: string
}

export function getCertificateStatus() {
  return axiosInstance.get<CertificateStatus>('/certificate')
}

export function triggerCertificateUpdate() {
  return axiosInstance.post<{ message: string; queueUrl: string }>('/certificate/update')
}
