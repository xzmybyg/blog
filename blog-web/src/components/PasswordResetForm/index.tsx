import { LockOutlined, MailOutlined, SafetyCertificateOutlined } from '@ant-design/icons'
import { confirmPasswordReset, requestPasswordReset } from '@/apis'
import './index.scss'

interface PasswordResetFormProps {
  onBack: () => void
  onComplete?: () => void
}

export default function PasswordResetForm({ onBack, onComplete }: PasswordResetFormProps) {
  const [form] = Form.useForm()
  const [codeSent, setCodeSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    if (countdown <= 0) return
    const timer = window.setInterval(() => setCountdown((value) => Math.max(value - 1, 0)), 1000)
    return () => window.clearInterval(timer)
  }, [countdown])

  const sendCode = async () => {
    const { email } = await form.validateFields(['email'])
    setSubmitting(true)
    try {
      const response = await requestPasswordReset(email)
      setCodeSent(true)
      setCountdown(60)
      message.success(response.data.message)
    } catch (error: any) {
      message.error(error.response?.data?.message || '验证码发送失败，请稍后重试')
    } finally {
      setSubmitting(false)
    }
  }

  const resetPassword = async () => {
    const values = await form.validateFields()
    setSubmitting(true)
    try {
      const response = await confirmPasswordReset(values)
      message.success(response.data.message)
      form.resetFields()
      onComplete?.()
      onBack()
    } catch (error: any) {
      message.error(error.response?.data?.message || '密码重置失败，请检查验证码')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="passwordReset">
      <p className="passwordReset__help">输入注册邮箱获取验证码，验证码 10 分钟内有效。</p>
      <Form form={form} layout="vertical" requiredMark={false} name="password-reset">
        <Form.Item
          label="注册邮箱"
          name="email"
          rules={[{ required: true, type: 'email', message: '请输入有效的注册邮箱' }]}
        >
          <Input size="large" prefix={<MailOutlined />} placeholder="请输入注册邮箱" autoComplete="email" disabled={codeSent} />
        </Form.Item>
        {codeSent && (
          <>
            <Form.Item
              label="邮箱验证码"
              name="code"
              rules={[{ required: true, pattern: /^\d{6}$/, message: '请输入 6 位数字验证码' }]}
            >
              <Input size="large" prefix={<SafetyCertificateOutlined />} placeholder="6 位验证码" inputMode="numeric" maxLength={6} autoComplete="one-time-code" />
            </Form.Item>
            <Form.Item
              label="新密码"
              name="password"
              rules={[{ required: true, min: 8, max: 72, message: '密码长度应为 8–72 位' }]}
            >
              <Input.Password size="large" prefix={<LockOutlined />} placeholder="设置新密码" autoComplete="new-password" />
            </Form.Item>
            <Form.Item
              label="确认新密码"
              name="confirmPassword"
              dependencies={['password']}
              rules={[
                { required: true, message: '请再次输入新密码' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    return !value || getFieldValue('password') === value
                      ? Promise.resolve()
                      : Promise.reject(new Error('两次输入的密码不一致'))
                  },
                }),
              ]}
            >
              <Input.Password size="large" prefix={<LockOutlined />} placeholder="再次输入新密码" autoComplete="new-password" />
            </Form.Item>
          </>
        )}
      </Form>
      <div className="passwordReset__actions">
        <Button type="primary" loading={submitting} onClick={codeSent ? resetPassword : sendCode}>
          {codeSent ? '重置密码' : '发送验证码'}
        </Button>
        {codeSent && (
          <Button disabled={submitting || countdown > 0} onClick={sendCode}>
            {countdown > 0 ? `${countdown} 秒后可重发` : '重新发送'}
          </Button>
        )}
      </div>
      <button type="button" className="passwordReset__back" disabled={submitting} onClick={onBack}>
        返回登录
      </button>
    </div>
  )
}
