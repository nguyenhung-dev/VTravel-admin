import { useState } from 'react';
import { Button, Form, Input, Upload } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNotifier } from '@/hooks/useNotifier';
import { API } from '@/lib/axios';
import type { UploadFile } from 'antd/es/upload/interface';
import type { RcFile } from 'antd/es/upload';

const { TextArea } = Input;

export default function CreateDestination() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const { contextHolder, notifySuccess, notifyError } = useNotifier();

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('location', values.location);
      formData.append('description', values.description);

      if (fileList.length > 0) {
        formData.append('image', fileList[0].originFileObj as RcFile);
      }

      const res = await API.post('/destinations', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      notifySuccess(res.data.message || 'Tạo điểm đến thành công!');
      form.resetFields();
      setFileList([]);
    } catch (error: any) {
      notifyError(error?.response?.data?.message || 'Tạo điểm đến thất bại!');
      console.log('Error creating destination:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {contextHolder}
      <div className="w-full mx-auto bg-white p-8 shadow-lg rounded-[8px]">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800">Thêm điểm đến mới</h1>
          <span className="mt-2 text-gray-500 text-sm">
            Điền đầy đủ thông tin để tạo điểm đến
          </span>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4"
        >
          <Form.Item
            label="Tên điểm đến"
            name="name"
            rules={[{ required: true, message: 'Vui lòng nhập tên điểm đến' }]}
          >
            <Input placeholder="Nhập tên điểm đến" className="h-[50px]" />
          </Form.Item>

          <Form.Item
            label="Vị trí"
            name="location"
            rules={[{ required: true, message: 'Vui lòng nhập địa điểm' }]}
          >
            <Input placeholder="Nhập địa điểm" className="h-[50px]" />
          </Form.Item>
          <Form.Item
            label="Hình ảnh"
            name="image"
            rules={[
              {
                validator: () =>
                  fileList.length > 0
                    ? Promise.resolve()
                    : Promise.reject('Vui lòng tải lên hình ảnh'),
              },
            ]}
          >
            <Upload
              listType="picture-card"
              fileList={fileList}
              beforeUpload={() => false}
              onChange={({ fileList }) => setFileList(fileList)}
              maxCount={1}
            >
              {fileList.length === 0 && (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          <Form.Item
            label="Mô tả"
            name="description"
            className="md:col-span-2"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
          >
            <TextArea rows={6} placeholder="Nhập mô tả chi tiết" />
          </Form.Item>

          <Form.Item className="md:col-span-2">
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
            >
              Tạo điểm đến
            </Button>
          </Form.Item>
        </Form>
      </div>
    </>
  );
}
