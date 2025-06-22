
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import type { FormProps } from 'antd';
import { Button, Checkbox, Form, Input } from 'antd';
import { useNotifier } from '@/hooks/useNotifier';
import { API_URL } from "@/config/api";
import { API, BACKEND } from "@/lib/axios";

type FieldType = {
  username?: string;
  password?: string;
  remember?: boolean;
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { notifyLoading, notifyError, contextHolder } = useNotifier();

  const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
    const { username, password } = values;
    const payload = { login: username, password };

    try {
      await BACKEND.get(`/sanctum/csrf-cookie`);
      const res = await API.post(`/login`, payload);
      const data = res.data;
      console.log("Login response:", data);
      if (data && data.user) {
        if (data.user.role === "admin" || data.user.role === "staff") {
          sessionStorage.setItem('user', JSON.stringify(data.user));
          notifyLoading("Đang đăng nhập...", () => {
            navigate('/');
          });
        } else {
          notifyError("Không có quyền truy cập.");
        }
      } else {
        notifyError("Đăng nhập không thành công.");
      }
    } catch (error) {
      console.error("Login error:", error);
      notifyError("Đăng nhập không thành công hoặc lỗi máy chủ.");
    }
  };

  const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

  return (
    <>
      {contextHolder}
      < div className='w-screen h-screen flex justify-center items-center' >
        <div className='border-1 py-8 px-8'>
          <Form
            name="basic"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            style={{ maxWidth: 600 }}
            initialValues={{ remember: true }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
          >
            <Form.Item<FieldType>
              label="Username"
              name="username"
              rules={[{ required: true, message: 'Please input your username!' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item<FieldType>
              label="Password"
              name="password"
              rules={[{ required: true, message: 'Please input your password!' }]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item<FieldType> name="remember" valuePropName="checked" label={null}>
              <Checkbox>Nhớ mật khẩu</Checkbox>
            </Form.Item>

            <Form.Item label={null}>
              <Button type="primary" htmlType="submit">
                Đăng nhập
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div >
    </>
  );
}
