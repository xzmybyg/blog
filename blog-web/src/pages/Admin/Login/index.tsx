import { setUserInfo } from '@/store/user'
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons'
import { Alert } from 'antd'
import { getSafeAdminRedirect } from '@/utils/auth'
import { canAccessAdmin } from '@/utils/adminPermission'
import PasswordResetForm from '@/components/PasswordResetForm'

import './index.scss'

export default function Login() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const sessionExpired = searchParams.get('reason') === 'expired'
  //是否已有账号
  const [haveAccount, setHaveAccount] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [resettingPassword, setResettingPassword] = useState(false)

  const [form] = Form.useForm()

  const handleSubmit = async (values: { username: string; password: string; email?: string }) => {
    if (submitting) return
    setSubmitting(true)
    try {
      if (!haveAccount) {
        await register({ ...values, email: values.email! })
        message.success('注册成功')
      }

      const response = await login({ username: values.username, password: values.password })
      if (!canAccessAdmin(response.data.role)) {
        message.error('当前账号没有后台访问权限')
        return
      }

      setUserInfo(response.data)
      if (haveAccount) message.success('登录成功')
      navigate(getSafeAdminRedirect(searchParams.get('redirect')), { replace: true })
    } catch (error: any) {
      message.error(error.response?.data?.message || '登录失败，请检查账号和密码')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="loginPage">
      <div className="loginPage__intro">
        <span className="loginPage__mark">&lt;/&gt;</span>
        <p>BLOG CONSOLE</p>
        <h1>内容管理工作台</h1>
        <span>管理文章、评论与站点内容。</span>
      </div>
      <div className="CardWrap">
        <Card title={resettingPassword ? '找回密码' : haveAccount ? '登录后台' : '注册账号'}>
          {sessionExpired && (
            <Alert
              className="loginPage__session-alert"
              type="warning"
              showIcon
              message="登录状态已失效"
              description="请重新登录，完成后将返回之前的管理页面。"
            />
          )}
          {resettingPassword ? (
            <PasswordResetForm onBack={() => setResettingPassword(false)} />
          ) : <Form form={form} name={haveAccount ? 'login' : 'register'} onFinish={handleSubmit}>
            <Form.Item
              label="账号"
              name="username"
              rules={
                !haveAccount
                  ? [
                      { required: true, message: '请输入账号!' },
                      { min: 8, max: 16, message: '账号长度在8-16之间' },
                    ]
                  : []
              }
              // hasFeedback={!haveAccount}
              // validateStatus="success"
            >
              <Input placeholder="账号" />
            </Form.Item>
            <Form.Item
              label="密码"
              name="password"
              rules={
                !haveAccount
                  ? [
                      { required: true, message: '请输入密码!' },
                      { min: 8, max: 72, message: '密码长度在8-72之间' },
                    ]
                  : []
              }
            >
              <Input.Password
                iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                placeholder="密码"
              />
            </Form.Item>
            {!haveAccount && (
              <Form.Item
                label="邮箱"
                name="email"
                rules={[
                  { required: true, message: '请输入邮箱!' },
                  { type: 'email', message: '请输入有效的邮箱地址!' },
                ]}
              >
                <Input placeholder="邮箱" />
              </Form.Item>
            )}
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={submitting}>
                {haveAccount ? '登录' : '注册'}
              </Button>
            </Form.Item>
          </Form>}
          {!resettingPassword && <button
            type="button"
            className="changeLogin"
            disabled={submitting}
            onClick={() => {
              setHaveAccount(!haveAccount)
            }}
          >
            {haveAccount ? '还没有账号？去注册' : '已有账号？去登录'}
          </button>}
          {haveAccount && !resettingPassword && (
            <button type="button" className="changeLogin" disabled={submitting} onClick={() => setResettingPassword(true)}>
              忘记密码？通过邮箱找回
            </button>
          )}
        </Card>
      </div>
    </div>
  )
}
