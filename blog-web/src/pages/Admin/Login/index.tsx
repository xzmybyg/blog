import { setUserInfo } from '@/store/user'
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons'
import { Alert } from 'antd'
import { getSafeAdminRedirect } from '@/utils/auth'
import { canAccessAdmin } from '@/utils/adminPermission'

import './index.scss'

export default function Login() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const sessionExpired = searchParams.get('reason') === 'expired'
  //是否已有账号
  const [haveAccount, setHaveAccount] = useState(true)

  const [form] = Form.useForm()

  const handleSubmit = () => {
    form.validateFields().then(async (values) => {
      try {
        if (!haveAccount) {
          await register(values)
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
      }
    })
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
        <Card title={haveAccount ? '登录后台' : '注册账号'}>
          {sessionExpired && (
            <Alert
              className="loginPage__session-alert"
              type="warning"
              showIcon
              message="登录状态已失效"
              description="请重新登录，完成后将返回之前的管理页面。"
            />
          )}
          <Form form={form} name={haveAccount ? 'login' : 'register'}>
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
                      { min: 8, max: 16, message: '密码长度在8-16之间' },
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
              <Button type="primary" htmlType="submit" onClick={() => handleSubmit()}>
                {haveAccount ? '登录' : '注册'}
              </Button>
            </Form.Item>
          </Form>
          <button
            type="button"
            className="changeLogin"
            onClick={() => {
              setHaveAccount(!haveAccount)
            }}
          >
            {haveAccount ? '还没有账号？去注册' : '已有账号？去登录'}
          </button>
        </Card>
      </div>
    </div>
  )
}
