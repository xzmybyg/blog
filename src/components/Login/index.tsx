import { forwardRef, useImperativeHandle } from "react"
// import Style from "./index.module.scss";
import "./index.scss"
import { login, register } from "@/apis"
import useUserStore from "@/store/user"

interface LoginHandle {
  openModal: () => void
}

const Login = forwardRef<LoginHandle>((props, ref) => {
  const [form] = Form.useForm()
  const [haveAccount, setHaveAccount] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const handleCancel = () => {
    setIsModalOpen(false)
  }
  const handleOk = () => {
    let sign = haveAccount ? login : register
    form.validateFields().then(values => {
      console.log(values)
      sign(values).then(res => {
        setUserInfo(res.data)
      })
    })

    setIsModalOpen(false)
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
      onOk={handleOk}
      onCancel={handleCancel}
      okText="确认"
      cancelText="取消"
    >
      <div>
        <h1>{haveAccount ? "登录" : "注册"}</h1>
        <p
          onClick={() => {
            setHaveAccount(!haveAccount)
          }}
        >
          {haveAccount ? "还没有账号？" : "已有账号？"}
        </p>
        <Form form={form} name={haveAccount ? "login" : "register"}>
          <Form.Item label="账号" name="username">
            <Input
              placeholder="账号"
              // value={inputUsername}
              onChange={e => {
                // setInputUsername(e.currentTarget.value);
              }}
            />
          </Form.Item>
          <Form.Item label="密码" name="password">
            <Input
              placeholder="密码"
              // value={inputPassword}
              onChange={e => {
                // setInputPassword(e.currentTarget.value);
              }}
            />
          </Form.Item>
          {!haveAccount && (
            <Form.Item label="邮箱" name="email">
              <Input
                placeholder="邮箱"
                // value={inputEmail}
                onChange={e => {
                  // setInputEmail(e.currentTarget.value);
                }}
              />
            </Form.Item>
          )}
        </Form>
      </div>
      {/* <div id="wx_login_container"></div> */}
    </Modal>
  )
})

export default Login
