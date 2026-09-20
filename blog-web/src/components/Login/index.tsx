import { forwardRef, useImperativeHandle } from 'react'
import { EyeInvisibleOutlined, EyeTwoTone, LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons'
import './index.scss'
import { login, register } from '@/apis'
import PasswordResetForm from '@/components/PasswordResetForm'

interface LoginHandle {
  openModal: () => void
}

const Login = forwardRef<LoginHandle>((_props, ref) => {
  //是否已有账号
  const [haveAccount, setHaveAccount] = useState(true)
  //登录对话框是否打开
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [resettingPassword, setResettingPassword] = useState(false)
  const handleCancel = () => {
    setIsModalOpen(false)
  }

  const [form] = Form.useForm()
  //表单验证规则
  // const usernameRegex = /^[a-zA-Z0-9_]{3,15}$/
  // const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,20}$/
  // const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  /**
   * 处理表单提交
   */
  const handleSubmit = () => {
    form.validateFields().then(async (values) => {
      if (submitting) return
      setSubmitting(true)
      try {
        if (!haveAccount) await register(values)

        const response = await login({ username: values.username, password: values.password })
        setUserInfo(response.data)
        message.success(haveAccount ? '登录成功' : '注册成功并已登录')
        form.resetFields()
        setIsModalOpen(false)
      } catch (error: any) {
        message.error(error.response?.data?.message || '操作失败，请稍后重试')
      } finally {
        setSubmitting(false)
      }
    })
  }

  useImperativeHandle(ref, () => ({
    openModal: () => {
      setIsModalOpen(true)
    },
  }))

  // useEffect(() => {
  //   const script = document.createElement("script")
  //   script.src = "https://res.wx.qq.com/connect/zh_CN/htmledition/js/wxLogin.js"
  //   script.onload = () => {
  //     new window.WxLogin({
  //       id: "wx_login_container",
  //       appid: "YOUR_APPID",
  //       scope: "snsapi_login",
  //       redirect_uri: encodeURIComponent("YOUR_REDIRECT_URI"),
  //       state: "STATE",
  //       style: "",
  //       href: "",
  //     })
  //   }
  //   document.body.appendChild(script)
  // }, [])

  return (
    <Modal
      className="loginWrap"
      open={isModalOpen}
      onOk={resettingPassword ? undefined : handleSubmit}
      onCancel={handleCancel}
      okText={haveAccount ? '登录' : '创建账号'}
      cancelText="取消"
      confirmLoading={submitting}
      footer={resettingPassword ? null : undefined}
      width={460}
      centered
    >
      <div className="loginPanel">
        <header className="loginPanel__header">
          <span>MEMBER ACCESS / 用户入口</span>
          <h1>{resettingPassword ? '找回密码' : haveAccount ? '欢迎回来' : '创建账号'}</h1>
          <p>{resettingPassword ? '通过注册邮箱验证身份并设置新密码。' : haveAccount ? '登录后参与评论与留言互动。' : '注册后即可参与博客内容交流。'}</p>
        </header>
        {resettingPassword ? (
          <PasswordResetForm onBack={() => setResettingPassword(false)} />
        ) : <Form form={form} layout="vertical" requiredMark={false} name={haveAccount ? 'login' : 'register'}>
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
            <Input size="large" prefix={<UserOutlined />} placeholder="请输入账号" autoComplete="username" />
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
                size="large"
                prefix={<LockOutlined />}
                iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                placeholder="请输入密码"
                autoComplete={haveAccount ? 'current-password' : 'new-password'}
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
              <Input size="large" prefix={<MailOutlined />} placeholder="请输入邮箱" autoComplete="email" />
            </Form.Item>
          )}
        </Form>}
        {!resettingPassword && (
          <div className="loginPanel__actions">
            <button
              type="button"
              className="changeLogin"
              disabled={submitting}
              onClick={() => {
                setHaveAccount(!haveAccount)
              }}
            >
              <span>{haveAccount ? '还没有账号？创建一个' : '已有账号？返回登录'}</span>
              <span aria-hidden="true">→</span>
            </button>
            {haveAccount && (
              <button
                type="button"
                className="changeLogin changeLogin--recovery"
                disabled={submitting}
                onClick={() => setResettingPassword(true)}
              >
                <span>忘记密码？</span>
                <span>通过邮箱找回</span>
              </button>
            )}
          </div>
        )}
      </div>
      {/* <div id="wx_login_container"></div> */}
    </Modal>
  )
})

export default Login
