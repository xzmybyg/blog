import { useEffect, useState } from 'react'
import { Button, Modal, Space, Upload, message } from 'antd'
import type { UploadProps } from 'antd'
import { InboxOutlined, PictureOutlined } from '@ant-design/icons'
import { getSiteBackgroundInfo, uploadSiteBackground, type SiteBackgroundInfo } from '@/apis'
import { bundledArticleCover, getDefaultArticleCover } from '@/utils/articleCover'
import useUserStore from '@/store/user'

const MAX_COVER_SIZE = 8 * 1024 * 1024
const ACCEPTED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

export default function DefaultCoverManager() {
  const readOnly = useUserStore((state) => state.role === 'viewer')
  const [info, setInfo] = useState<SiteBackgroundInfo>({ exists: false })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    getSiteBackgroundInfo('article')
      .then((response) => setInfo(response.data))
      .catch(() => message.error('默认封面状态加载失败'))
  }, [])

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl('')
      return
    }
    const objectUrl = URL.createObjectURL(selectedFile)
    setPreviewUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [selectedFile])

  const beforeUpload: UploadProps['beforeUpload'] = (file) => {
    if (!ACCEPTED_IMAGE_TYPES.has(file.type)) {
      message.error('仅支持 JPG、PNG 或 WebP 图片')
      return Upload.LIST_IGNORE
    }
    if (file.size === 0 || file.size > MAX_COVER_SIZE) {
      message.error('封面图片不能为空且不能超过 8 MB')
      return Upload.LIST_IGNORE
    }
    setSelectedFile(file)
    return Upload.LIST_IGNORE
  }

  const uploadCover = () => {
    if (!selectedFile) return
    Modal.confirm({
      title: '替换默认文章封面？',
      content: '所有未配置单独封面的文章将立即使用新封面。',
      okText: '确认替换',
      cancelText: '取消',
      onOk: async () => {
        setUploading(true)
        try {
          const response = await uploadSiteBackground('article', selectedFile)
          setInfo(response.data)
          setSelectedFile(null)
          message.success('默认文章封面已更新')
        } catch {
          message.error('默认封面上传失败，请稍后重试')
          throw new Error('Upload failed')
        } finally {
          setUploading(false)
        }
      },
    })
  }

  const currentCover = info.exists ? getDefaultArticleCover(info.updatedAt) : bundledArticleCover

  return (
    <section className="article-cover-manager">
      <header>
        <PictureOutlined aria-hidden="true" />
        <div>
          <span>ARTICLE COVER / 封面管理</span>
          <h2>默认文章封面</h2>
          <p>未设置单独封面的文章会自动使用此图片。</p>
        </div>
      </header>
      <img src={previewUrl || currentCover} alt={previewUrl ? '待上传的默认封面' : '当前默认封面'} />
      <Upload.Dragger
        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
        beforeUpload={beforeUpload}
        maxCount={1}
        showUploadList={false}
        disabled={uploading || readOnly}
      >
        <p className="ant-upload-drag-icon"><InboxOutlined /></p>
        <p className="ant-upload-text">选择新的默认封面</p>
        <p className="ant-upload-hint">JPG、PNG、WebP，最大 8 MB</p>
      </Upload.Dragger>
      <div className="article-cover-manager__actions">
        <span>{selectedFile ? selectedFile.name : info.exists ? '当前使用已上传封面' : '当前使用项目内置封面'}</span>
        <Space>
          {selectedFile && <Button onClick={() => setSelectedFile(null)}>取消选择</Button>}
          <Button type="primary" disabled={readOnly || !selectedFile} loading={uploading} onClick={uploadCover}>上传并替换</Button>
        </Space>
      </div>
    </section>
  )
}
