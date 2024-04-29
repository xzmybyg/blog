import { setUserInfo } from "@/store/user";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";

export default function Login() {
  //是否已有账号
  const [haveAccount, setHaveAccount] = useState(true);

  const [form] = Form.useForm();

  const handleSubmit = () => {
    const sign = haveAccount ? login : register;
    form.validateFields().then((values) => {
      sign(values)
        .then((res) => {
          console.log(res);

          setUserInfo(res.data);
          message.success(haveAccount ? "登录成功" : "注册成功");
          values = { username: values.username, password: values.password };
          login(values).then((res) => {
            setUserInfo(res.data);
          });
        })
        .catch((err) => {
          message.error(err.response.data.message);
        });
    });
  };

  return (
    <div>
      <div>
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
              iconRender={(visible) =>
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
          <Form.Item>
            <Button onClick={() => handleSubmit()}>
              {haveAccount ? "登录" : "注册"}
            </Button>
          </Form.Item>
        </Form>
        <p
          className="changeLogin"
          onClick={() => {
            setHaveAccount(!haveAccount);
          }}
        >
          {haveAccount ? "还没有账号？去注册-->" : "已有账号？去登录-->"}
        </p>
      </div>
    </div>
  );
}
