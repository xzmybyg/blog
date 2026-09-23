import { useEffect, useState } from 'react'
import { Alert, Avatar, Button, Card, Form, Input, Skeleton, Upload, message } from 'antd'
import type { UploadProps } from 'antd'
import { DeleteOutlined, SaveOutlined, UploadOutlined, UserOutlined } from '@ant-design/icons'
import { getCurrentUser, updateCurrentUser, uploadUserAvatar } from '@/apis'
import useUserStore from '@/store/user'
import { DEFAULT_USER_AVATAR } from '@/utils/avatar'
import './index.scss'

type ProfileValues = {
  nickname: string
}

const MAX_SOURCE_AVATAR_SIZE = 8 * 1024 * 1024
const ACCEPTED_AVATAR_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

async function compressAvatar(file: File) {
  const image = await createImageBitmap(file)
  const scale = Math.min(1, 512 / Math.max(image.width, image.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(image.width * scale))
  canvas.height = Math.max(1, Math.round(image.height * scale))
  const context = canvas.getContext('2d')
  if (!context) {
    image.close()
    throw new Error('Canvas is unavailable')
  }
  context.drawImage(image, 0, 0, canvas.width, canvas.height)
  image.close()

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((result) => result ? resolve(result) : reject(new Error('Image compression failed')), 'image/webp', 0.82)
  })
  const baseName = file.name.replace(/\.[^.]+$/, '') || 'avatar'
  return new File([blob], `${baseName}.webp`, { type: 'image/webp' })
}

export default function Profile() {
  const [form] = Form.useForm<ProfileValues>()
  const role = useUserStore((state) => state.role)
  const [profile, setProfile] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [previewSrc, setPreviewSrc] = useState(DEFAULT_USER_AVATAR)
  const [selectedAvatar, setSelectedAvatar] = useState<File | null>(null)
  const [resetAvatar, setResetAvatar] = useState(false)
  const readOnly = role === 'viewer'

  useEffect(() => () => {
    if (previewSrc.startsWith('blob:')) URL.revokeObjectURL(previewSrc)
  }, [previewSrc])

  useEffect(() => {
    getCurrentUser()
      .then((response) => {
        setProfile(response.data)
        form.setFieldsValue({
          nickname: response.data.nickname || '',
        })
        setPreviewSrc(response.data.avatar || DEFAULT_USER_AVATAR)
      })
      .catch(() => message.error('个人资料加载失败，请稍后刷新重试'))
      .finally(() => setLoading(false))
  }, [form])

  const saveProfile = async (values: ProfileValues) => {
    if (readOnly) return
    const nickname = values.nickname.trim()
    setSaving(true)
    try {
      await updateCurrentUser({ nickname, ...(resetAvatar ? { avatar: '' } : {}) })
      let avatar = resetAvatar ? '' : profile?.avatar || ''
      if (selectedAvatar) {
        const response = await uploadUserAvatar(selectedAvatar)
        avatar = response.data.avatar
      }
      const nextProfile = { nickname, avatar }
      setProfile((current) => current ? { ...current, ...nextProfile } : current)
      useUserStore.setState(nextProfile)
      form.setFieldsValue({ nickname })
      setSelectedAvatar(null)
      setResetAvatar(false)
      setPreviewSrc(avatar || DEFAULT_USER_AVATAR)
      message.success('个人资料已保存')
    } catch (error: any) {
      message.error(error.response?.data?.message || '个人资料保存失败，请稍后重试')
    } finally {
      setSaving(false)
    }
  }

  const resetProfile = () => {
    if (!profile) return
    form.setFieldsValue({ nickname: profile.nickname || '' })
    setSelectedAvatar(null)
    setResetAvatar(false)
    setPreviewSrc(profile.avatar || DEFAULT_USER_AVATAR)
  }

  const beforeAvatarUpload: UploadProps['beforeUpload'] = async (file) => {
    if (!ACCEPTED_AVATAR_TYPES.has(file.type)) {
      message.error('仅支持 JPG、PNG 或 WebP 图片')
      return Upload.LIST_IGNORE
    }
    if (file.size === 0 || file.size > MAX_SOURCE_AVATAR_SIZE) {
      message.error('头像图片不能为空且不能超过 8 MB')
      return Upload.LIST_IGNORE
    }
    try {
      const compressed = await compressAvatar(file)
      setSelectedAvatar(compressed)
      setResetAvatar(false)
      setPreviewSrc(URL.createObjectURL(compressed))
      message.success(`头像已压缩至 ${(compressed.size / 1024).toFixed(1)} KB，保存后生效`)
    } catch {
      message.error('头像压缩失败，请换一张图片重试')
    }
    return Upload.LIST_IGNORE
  }

  return (
    <main className="profile-page pages">
      <Card className="profile-card">
        <header className="profile-card__header">
          <div>
            <span>MEMBER PROFILE / 个人资料</span>
            <h1>管理你的公开信息</h1>
            <p>昵称和头像会展示在导航、评论与留言中。</p>
          </div>
          <div className="profile-card__avatar-editor">
            <Avatar
              className="profile-card__avatar"
              size={112}
              src={previewSrc}
              alt="头像预览"
              onError={() => {
                if (previewSrc !== DEFAULT_USER_AVATAR) setPreviewSrc(DEFAULT_USER_AVATAR)
                return false
              }}
            />
            <div className="profile-card__avatar-actions">
              <Upload
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                beforeUpload={beforeAvatarUpload}
                maxCount={1}
                showUploadList={false}
                disabled={readOnly || saving}
              >
                <Button icon={<UploadOutlined aria-hidden="true" />}>选择头像</Button>
              </Upload>
              <Button
                icon={<DeleteOutlined aria-hidden="true" />}
                disabled={readOnly || saving}
                onClick={() => {
                  setSelectedAvatar(null)
                  setResetAvatar(true)
                  setPreviewSrc(DEFAULT_USER_AVATAR)
                }}
              >
                恢复默认
              </Button>
            </div>
            <small>{selectedAvatar ? `${selectedAvatar.name} · ${(selectedAvatar.size / 1024).toFixed(1)} KB` : '自动压缩为 512px WebP'}</small>
          </div>
        </header>

        {readOnly && <Alert type="info" showIcon message="当前为只读账号，不能修改个人资料。" />}

        {loading ? (
          <Skeleton active paragraph={{ rows: 5 }} />
        ) : (
          <div className="profile-card__content">
            <section className="profile-account" aria-label="账号信息">
              <span>ACCOUNT</span>
              <dl>
                <div><dt>登录账号</dt><dd>{profile?.username || '—'}</dd></div>
                <div><dt>注册邮箱</dt><dd>{profile?.email || '—'}</dd></div>
              </dl>
            </section>

            <Form form={form} layout="vertical" requiredMark={false} disabled={readOnly} onFinish={saveProfile}>
              <Form.Item
                label="公开昵称"
                name="nickname"
                rules={[{ max: 30, message: '昵称不能超过 30 个字符' }]}
                extra="留空时会显示登录账号。"
              >
                <Input size="large" prefix={<UserOutlined aria-hidden="true" />} maxLength={30} showCount placeholder="输入公开昵称" />
              </Form.Item>
              <div className="profile-card__actions">
                <Button disabled={saving} onClick={resetProfile}>撤销修改</Button>
                <Button type="primary" htmlType="submit" icon={<SaveOutlined aria-hidden="true" />} loading={saving}>保存资料</Button>
              </div>
            </Form>
          </div>
        )}
      </Card>
    </main>
  )
}
