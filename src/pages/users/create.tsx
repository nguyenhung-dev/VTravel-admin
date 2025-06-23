import { Button, Form, Input, Select, Upload } from 'antd';
import { useState } from 'react';
import axios from 'axios';
import { useNotifier } from '@/hooks/useNotifier';
import { PlusOutlined } from '@ant-design/icons';
import { API } from "@/lib/axios";
import {
  validateFullName,
  validateEmail,
  validatePhone,
  validatePassword,
} from '@/validators/validationRules';

const { Option } = Select;

export default function CreateUser() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { contextHolder, notifySuccess, notifyError } = useNotifier();

  const onFinish = async (values: any) => {
    try {
      setLoading(true);

      const response = await API.post('/register', {
        full_name: values.full_name,
        email: values.email,
        phone: values.phone,
        password: values.password,
        role: values.role || 'customer',
      });

      notifySuccess('Đăng ký thành công!');
      form.resetFields();
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        const { response } = error;
        if (response?.status === 422) {
          const errorData = response.data as {
            message?: string;
            errors?: Record<string, string[]>;
          };
          const firstField = errorData.errors ? Object.keys(errorData.errors)[0] : '';
          const firstMessage = firstField ? errorData.errors?.[firstField]?.[0] : '';

          notifyError(errorData.message || firstMessage || 'Dữ liệu không hợp lệ');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {contextHolder}
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full mx-auto bg-white p-8 shadow-lg rounded-xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-800">Tạo tài khoản mới</h1>
            <span className="mt-2 text-gray-500 text-sm">
              Điền đầy đủ thông tin để tạo tài khoản hệ thống
            </span>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
            className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4"
          >
            <Form.Item
              label="Họ và tên"
              name="full_name"
              rules={[validateFullName]}
              className="col-span-1 md:col-span-2"
            >
              <Input placeholder="Nguyễn Văn A" className='h-[50px]' />
            </Form.Item>

            <Form.Item
              label="Email"
              name="email"
              rules={[validateEmail]}
            >
              <Input placeholder="abc@example.com" className='h-[50px]' />
            </Form.Item>

            <Form.Item
              label="Số điện thoại"
              name="phone"
              rules={[validatePhone]}
            >
              <Input placeholder="0912345678" className='h-[50px]' />
            </Form.Item>

            <Form.Item
              label="Mật khẩu"
              name="password"
              rules={[validatePassword]}
            >
              <Input.Password placeholder="••••••" className='h-[50px]' />
            </Form.Item>

            <Form.Item
              label="Quyền hệ thống"
              name="role"
              className="md:col-span-1"
            >
              <Select placeholder="Chọn quyền (mặc định là customer)" allowClear className="w-full custom-select-height">
                <Option value="customer">Customer</Option>
                <Option value="staff">Staff</Option>
                <Option value="admin">Admin</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Ảnh đại diện (tuỳ chọn)"
              name="avatar"
              valuePropName="fileList"
              getValueFromEvent={(e: any) => (Array.isArray(e) ? e : e?.fileList)}
            >
              <Upload listType="picture-card" beforeUpload={() => false}>
                <button
                  style={{ color: 'inherit', cursor: 'inherit', border: 0, background: 'none' }}
                  type="button"
                >
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </button>
              </Upload>
            </Form.Item>

            <Form.Item className="col-span-1 md:col-span-2">
              <Button type="primary" htmlType="submit" loading={loading} block className="mt-2" size='large'>
                Đăng ký
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </>
  );
}
