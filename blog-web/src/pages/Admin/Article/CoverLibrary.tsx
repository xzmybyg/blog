import { useEffect, useState } from 'react'
import { Button, Empty, Modal, Space, Upload, message } from 'antd'
import type { UploadProps } from 'antd'
import { InboxOutlined, PictureOutlined } from '@ant-design/icons'
import {
  getArticleCoverList,
  replaceArticleCover,
  uploadArticleCover,
  type ArticleCoverInfo,
} from '@/apis'

type CoverLibraryProps = {
  value?: string
  disabled?: boolean
  onChange: (value: string) => void
}

const MAX_COVER_SIZE = 8 * 1024 * 1024
const ACCEPTED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

function getManagedCoverName(value?: string) {
  const match = value?.match(/^\/api\/article-cover\/([^?]+)(?:\?.*)?$/)
  if (!match) return ''
  try {
    return decodeURIComponent(match[1])
  } catch {
    return ''
  }
}

export default function CoverLibrary({ value, disabled, onChange }: CoverLibraryProps) {
  const [open, setOpen] = useState(false)
  const [covers, setCovers] = useState<ArticleCoverInfo[]>([])
  const [selectedName, setSelectedName] = useState(getManagedCoverName(value))
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  const loadCovers = () => {
    setLoading(true)
    getArticleCoverList()
      .then((response) => setCovers(Array.isArray(response.data) ? response.data : []))
      .catch(() => message.error('封面图片列表加载失败'))
      .finally(() => setLoading(false))
  }

  useEffect(() => setSelectedName(getManagedCoverName(value)), [value])
  useEffect(() => {
    if (open) loadCovers()
  }, [open])

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

  const uploadNewCover = async () => {
    if (!selectedFile) return
    setUploading(true)
    try {
      const response = await uploadArticleCover(selectedFile)
      setCovers((current) => [response.data, ...current])
      setSelectedName(response.data.name)
      setSelectedFile(null)
      onChange(response.data.url)
      message.success('封面已上传并选用')
    } catch {
      message.error('封面上传失败，请稍后重试')
    } finally {
      setUploading(false)
    }
  }

  const replaceSelectedCover = async () => {
    if (!selectedFile || !selectedName) return
    setUploading(true)
    try {
      const response = await replaceArticleCover(selectedName, selectedFile)
      setCovers((current) => current.map((cover) => cover.name === selectedName ? response.data : cover))
      setSelectedFile(null)
      onChange(response.data.url)
      message.success('所选封面已替换')
    } catch {
      message.error('封面替换失败，请稍后重试')
    } finally {
      setUploading(false)
    }
  }

  const useSelectedCover = () => {
    const cover = covers.find((item) => item.name === selectedName)
    if (!cover) return
    onChange(cover.url)
    setOpen(false)
  }

  return (
    <>
      <Button icon={<PictureOutlined />} disabled={disabled} onClick={() => setOpen(true)}>上传或从图片库选择</Button>
      <Modal title="文章封面图片库" open={open} width={880} footer={null} onCancel={() => setOpen(false)}>
        <div className="article-cover-library">
          <Upload.Dragger
            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
            beforeUpload={beforeUpload}
            maxCount={1}
            showUploadList={false}
            disabled={uploading}
          >
            <p className="ant-upload-drag-icon"><InboxOutlined /></p>
            <p className="ant-upload-text">选择要上传或替换的图片</p>
            <p className="ant-upload-hint">JPG、PNG、WebP，最大 8 MB</p>
          </Upload.Dragger>
          <div className="article-cover-library__upload-actions">
            <span>{selectedFile?.name || '尚未选择新图片'}</span>
            <Space>
              <Button disabled={!selectedFile || uploading} loading={uploading} onClick={uploadNewCover}>上传为新封面</Button>
              <Button disabled={!selectedFile || !selectedName || uploading} loading={uploading} onClick={replaceSelectedCover}>替换所选图片</Button>
            </Space>
          </div>
          {covers.length > 0 ? (
            <div className="article-cover-library__grid" aria-busy={loading}>
              {covers.map((cover) => (
                <button
                  type="button"
                  key={cover.name}
                  className={selectedName === cover.name ? 'is-selected' : ''}
                  onClick={() => setSelectedName(cover.name)}
                >
                  <img src={`${cover.url}?v=${encodeURIComponent(cover.updatedAt)}`} alt={cover.name} />
                  <span>{cover.name}</span>
                </button>
              ))}
            </div>
          ) : (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={loading ? '正在加载图片…' : '暂无已上传封面'} />
          )}
          <div className="article-cover-library__footer">
            <Button onClick={() => setOpen(false)}>取消</Button>
            <Button type="primary" disabled={!selectedName} onClick={useSelectedCover}>使用所选图片</Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
