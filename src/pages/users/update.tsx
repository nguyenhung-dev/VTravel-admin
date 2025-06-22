import { Button, Form, Input, Select, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import axios from 'axios';
import type { UploadFile } from 'antd/es/upload/interface';
import { useParams } from 'react-router-dom';

const { Option } = Select;

export default function UpdateUser() {
  const [form] = Form.useForm();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('token');

  const { id } = useParams();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/api/users/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const user = res.data;
        form.setFieldsValue(user);
        if (user.avatar_url) setAvatarPreview(user.avatar_url);
      } catch (error) {
        message.error("Không thể tải thông tin người dùng");
        console.error(error);
      }
    };

    if (id) fetchUser();
  }, [id]);

  const onFinish = async (values: any) => {
    const formData = new FormData();
    formData.append('full_name', values.full_name);
    formData.append('email', values.email);
    formData.append('phone', values.phone);
    if (values.password) formData.append('password', values.password);
    if (values.role) formData.append('role', values.role);
    if (fileList.length > 0 && fileList[0].originFileObj) {
      formData.append('avatar', fileList[0].originFileObj);
    }

    try {
      setLoading(true);
      const res = await axios.post(
        `http://localhost:8000/api/users/${id}?_method=PUT`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      message.success('Cập nhật thành công');
    } catch (error: any) {
      message.error('Lỗi cập nhật: ' + (error.response?.data?.message || 'Không xác định'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full mx-auto mt-10 bg-white rounded-xl shadow-md p-6">
      <div className='mb-10'>
        <h2 className="text-2xl font-semibold mb-6 text-center">Cập nhật thông tin</h2>
      </div>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        className="space-y-4"
      >
        <Form.Item label="Họ và tên" name="full_name" rules={[{ required: true }]}>
          <Input className="h-12" />
        </Form.Item>

        <Form.Item label="Email" name="email" rules={[{ type: 'email', required: true }]}>
          <Input className="h-12" />
        </Form.Item>

        <Form.Item label="Số điện thoại" name="phone">
          <Input className="h-12" />
        </Form.Item>

        <Form.Item label="Mật khẩu mới" name="password">
          <Input.Password className="h-12" />
        </Form.Item>

        <Form.Item label="Quyền" name="role">
          <Select placeholder="Chọn quyền" allowClear className="w-full custom-select-height">
            <Option value="customer">Customer</Option>
            <Option value="staff">Staff</Option>
            <Option value="admin">Admin</Option>
          </Select>
        </Form.Item>

        <Form.Item label="Ảnh đại diện">
          <Upload
            beforeUpload={() => false}
            fileList={fileList}
            onChange={({ fileList }) => {
              setFileList(fileList);
              if (fileList[0]?.originFileObj) {
                const url = URL.createObjectURL(fileList[0].originFileObj);
                setAvatarPreview(url);
              }
            }}
            accept="image/*"
            maxCount={1}
          >
            <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
          </Upload>

          {avatarPreview && (
            <img
              src={avatarPreview}
              alt="Avatar preview"
              className="mt-4 w-24 h-24 rounded-full object-cover"
            />
          )}
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block size='large'>
            Cập nhật
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
