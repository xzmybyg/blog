import { forwardRef, useImperativeHandle } from "react";
// import Style from "./index.module.scss";
import "./index.scss";
import { login, register } from "@/apis";
import useStore from "@/store";

interface LoginHandle {
  openModal: () => void;
}

const Login = forwardRef<LoginHandle>((props, ref) => {
  const { user, setUser, token, setToken } = useStore();
  const [haveAccount, setHaveAccount] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleCancel = () => {
    setUsername("");
    setPassword("");
    setIsModalOpen(false);
  };
  const handleOk = () => {
    let sign = haveAccount ? login : register;
    let parmas = haveAccount
      ? { username, password }
      : { username, password, email };
    sign(parmas as Parameters<typeof sign>[0]).then(res => {
      setUser(res.data.user);
      setToken(res.data.token);
    });

    setIsModalOpen(false);
  };
  useImperativeHandle(ref, () => ({
    openModal: () => {
      setIsModalOpen(true);
    },
  }));
  // const { loginWrap, title } = Style;
  return (
    <Modal
      className="loginWrap"
      open={isModalOpen}
      onOk={handleOk}
      onCancel={handleCancel}
      okText="确认"
      cancelText="取消"
    >
      {haveAccount ? (
        <div>
          <h1>登录</h1>
          <p
            onClick={() => {
              setHaveAccount(false);
            }}
          >
            还没有账号？
          </p>
          <Form>
            <Form.Item label="账号" name="username">
              <Input
                placeholder="账号"
                value={username}
                onChange={e => {
                  setUsername(e.currentTarget.value);
                }}
              />
            </Form.Item>
            <Form.Item label="密码" name="password">
              <Input
                placeholder="密码"
                value={password}
                onChange={e => {
                  setPassword(e.currentTarget.value);
                }}
              />
            </Form.Item>
          </Form>
        </div>
      ) : (
        <div>
          <h1>注册</h1>
          <p
            onClick={() => {
              setHaveAccount(true);
            }}
          >
            已有账号？
          </p>
          <Form>
            <Form.Item label="账号" name="username">
              <Input
                placeholder="账号"
                value={username}
                onChange={e => {
                  setUsername(e.currentTarget.value);
                }}
              />
            </Form.Item>
            <Form.Item label="密码" name="password">
              <Input
                placeholder="密码"
                value={password}
                onChange={e => {
                  setPassword(e.currentTarget.value);
                }}
              />
            </Form.Item>
            <Form.Item label="邮箱" name="email">
              <Input
                placeholder="邮箱"
                value={email}
                onChange={e => {
                  setEmail(e.currentTarget.value);
                }}
              />
            </Form.Item>
          </Form>
        </div>
      )}
    </Modal>
  );
});

export default Login;
