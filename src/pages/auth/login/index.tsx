import { useNavigate } from 'react-router-dom';
import type { FormProps } from 'antd';
import { Button, Checkbox, Form, Input } from 'antd';
import { useNotifier } from '@/hooks/useNotifier';
import { API, BACKEND } from "@/lib/axios";
import { useAuth } from "@/contexts/AuthContext";
import { validateInfo, validatePassword } from "@/validators/validationRules";
import axios from 'axios';
import { getCsrfToken } from "@/utils/getCsrfToken";

type FieldType = {
  info?: string;
  password?: string;
  remember?: boolean;
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { notifyLoading, notifyError, contextHolder } = useNotifier();

  const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
    const { info, password } = values;
    const payload = { login: info, password };

    try {

      const xsrfToken = await getCsrfToken();

      const res = await API.post(`/login`, payload, {
        headers: {
          'X-XSRF-TOKEN': xsrfToken ?? '',
        },
      });
      const data = res.data;

      if (data && data.user) {
        if (data.user.role === "admin" || data.user.role === "staff") {
          await login();
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
      if (axios.isAxiosError(error)) {
        const { response } = error;
        if (response?.status === 422) {
          notifyError(response.data.message || 'Dữ liệu không hợp lệ');
        } else if (response?.status === 401 || response?.status === 403) {
          notifyError(response.data.message);
        } else {
          notifyError("Lỗi không xác định");
        }
      } else {
        notifyError("Đã xảy ra lỗi bất ngờ.");
      }
    }
  };


  const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

  return (
    <>
      {contextHolder}
      <div className='w-screen h-screen flex justify-center items-center'>
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
              label="Email/Số điện thoại"
              name="info"
              rules={[validateInfo]}
            >
              <Input />
            </Form.Item>

            <Form.Item<FieldType>
              label="Mật khẩu"
              name="password"
              rules={[validatePassword]}
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
      </div>
    </>
  );
}
