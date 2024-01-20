import { forwardRef, useImperativeHandle } from "react"
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons"
// import Style from "./index.module.scss";
import "./index.scss"
import { login, register } from "@/apis"

interface LoginHandle {
  openModal: () => void
}

const Login = forwardRef<LoginHandle>((_props, ref) => {
  //是否已有账号
  const [haveAccount, setHaveAccount] = useState(true)
  //登录对话框是否打开
  const [isModalOpen, setIsModalOpen] = useState(false)
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
    let sign = haveAccount ? login : register
    form.validateFields().then(values => {
      sign(values)
        .then(res => {
          console.log(res)

          setUserInfo(res.data)
          message.success(haveAccount ? "登录成功" : "注册成功")
          values = { username: values.username, password: values.password }
          login(values).then(res => {
            setUserInfo(res.data)
            setIsModalOpen(false)
          })
        })
        .catch(err => {
          message.error(err.response.data.message)
        })
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
      onOk={handleSubmit}
      onCancel={handleCancel}
      okText="确认"
      cancelText="取消"
    >
      <div>
        <h1>{haveAccount ? "登录" : "注册"}</h1>

        <Form form={form} name={haveAccount ? "login" : "register"}>
          <Form.Item
            label="账号"
            name="username"
            rules={
              !haveAccount
                ? [
                    { required: true, message: "请输入账号!" },
                    { min: 8, max: 16, message: "账号长度在8-16之间" },
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
                    { required: true, message: "请输入密码!" },
                    { min: 8, max: 16, message: "密码长度在8-16之间" },
                  ]
                : []
            }
          >
            <Input.Password
              iconRender={visible =>
                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
              }
              placeholder="密码"
            />
          </Form.Item>
          {!haveAccount && (
            <Form.Item
              label="邮箱"
              name="email"
              rules={[
                { required: true, message: "请输入邮箱!" },
                { type: "email", message: "请输入有效的邮箱地址!" },
              ]}
            >
              <Input placeholder="邮箱" />
            </Form.Item>
          )}
        </Form>
        <p
          className="changeLogin"
          onClick={() => {
            setHaveAccount(!haveAccount)
          }}
        >
          {haveAccount ? "还没有账号？去注册-->" : "已有账号？去登录-->"}
        </p>
      </div>
      {/* <div id="wx_login_container"></div> */}
    </Modal>
  )
})

export default Login
