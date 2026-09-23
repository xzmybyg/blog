import { useEffect, useState } from 'react'
import { Alert, Avatar, Button, Card, Form, Input, Skeleton, message } from 'antd'
import { LinkOutlined, SaveOutlined, UserOutlined } from '@ant-design/icons'
import { getCurrentUser, updateCurrentUser } from '@/apis'
import useUserStore from '@/store/user'
import { DEFAULT_USER_AVATAR } from '@/utils/avatar'
import './index.scss'

type ProfileValues = {
  nickname: string
  avatar: string
}

export default function Profile() {
  const [form] = Form.useForm<ProfileValues>()
  const role = useUserStore((state) => state.role)
  const [profile, setProfile] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const avatarValue = Form.useWatch('avatar', form)
  const [previewSrc, setPreviewSrc] = useState(DEFAULT_USER_AVATAR)
  const readOnly = role === 'viewer'

  useEffect(() => {
    getCurrentUser()
      .then((response) => {
        setProfile(response.data)
        form.setFieldsValue({
          nickname: response.data.nickname || '',
          avatar: response.data.avatar || '',
        })
      })
      .catch(() => message.error('个人资料加载失败，请稍后刷新重试'))
      .finally(() => setLoading(false))
  }, [form])

  useEffect(() => {
    setPreviewSrc(avatarValue?.trim() || DEFAULT_USER_AVATAR)
  }, [avatarValue])

  const saveProfile = async (values: ProfileValues) => {
    if (readOnly) return
    const nextProfile = {
      nickname: values.nickname.trim(),
      avatar: values.avatar.trim(),
    }
    setSaving(true)
    try {
      await updateCurrentUser(nextProfile)
      setProfile((current) => current ? { ...current, ...nextProfile } : current)
      useUserStore.setState(nextProfile)
      form.setFieldsValue(nextProfile)
      message.success('个人资料已保存')
    } catch (error: any) {
      message.error(error.response?.data?.message || '个人资料保存失败，请稍后重试')
    } finally {
      setSaving(false)
    }
  }

  const resetProfile = () => {
    if (!profile) return
    form.setFieldsValue({ nickname: profile.nickname || '', avatar: profile.avatar || '' })
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
              <Form.Item
                label="头像地址"
                name="avatar"
                rules={[{
                  validator: (_, value) => !value || /^(https?:\/\/|\/)/i.test(value.trim())
                    ? Promise.resolve()
                    : Promise.reject(new Error('请输入 HTTP(S) 图片地址或站内绝对路径')),
                }]}
                extra="支持 HTTPS 图片地址；留空使用默认头像。后续可迁移到七牛云统一管理。"
              >
                <Input size="large" prefix={<LinkOutlined aria-hidden="true" />} maxLength={2048} placeholder="https://example.com/avatar.webp" />
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
