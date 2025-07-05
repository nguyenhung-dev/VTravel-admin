'use client';

import { useEffect, useState } from 'react';
import {
  Modal,
  Form,
  Input,
  Upload,
  Button,
} from 'antd';
import type {
  UploadFile,
} from 'antd';
import {
  UploadOutlined,
  PlusOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { API } from '@/lib/axios';
import TableGeneric from '@/components/TableGeneric';
import type { ColumnsType } from 'antd/es/table';
import type { TableAction } from '@/components/TableGeneric';
import { useNotifier } from '@/hooks/useNotifier';
import { API_URL } from '@/lib/api';
import dayjs from 'dayjs';

interface CategoryType {
  id: number;
  category_name: string;
  thumbnail?: string;
  thumbnail_url?: string;
  created_at?: string;
}

export default function TourCategory() {
  const [data, setData] = useState<CategoryType[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryType | null>(null);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const { contextHolder, notifyError, notifySuccess } = useNotifier();

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await API.get('/categories');
      const updated = res.data.map((item: any) => ({
        id: item.category_id ?? item.id,
        category_name: item.category_name,
        thumbnail: item.thumbnail,
        thumbnail_url: item.thumbnail ? `/storage/${item.thumbnail}` : null,
        created_at: item.created_at,
      }));
      setData(updated);
    } catch {
      notifyError('Không thể tải danh mục');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreateOrUpdate = async () => {
    try {
      const values = await form.validateFields();
      const formData = new FormData();
      formData.append('category_name', values.category_name);
      if (fileList[0]?.originFileObj) {
        formData.append('thumbnail', fileList[0].originFileObj);
      }
      if (editingCategory) {
        // UPDATE
        await API.post(`/categories/${editingCategory.id}?_method=PUT`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        notifySuccess('Cập nhật danh mục thành công');
      } else {
        // CREATE
        await API.post('/categories', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        notifySuccess('Tạo danh mục thành công');
      }

      setModalVisible(false);
      setEditingCategory(null);
      form.resetFields();
      setFileList([]);
      fetchCategories();
    } catch {
      notifyError('Thao tác thất bại');
    }
  };

  const confirmDelete = (id: number) => {
    Modal.confirm({
      title: 'Xác nhận xóa danh mục?',
      icon: <ExclamationCircleOutlined />,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: () => handleDelete(id),
    });
  };

  const handleDelete = async (id: number) => {
    try {
      await API.delete(`/categories/${id}`);
      notifySuccess('Xóa danh mục thành công');
      fetchCategories();
    } catch {
      notifyError('Xóa thất bại');
    }
  };

  const handleEdit = (record: CategoryType) => {
    setEditingCategory(record);
    form.setFieldsValue({
      category_name: record.category_name,
    });
    setFileList(
      record.thumbnail_url
        ? [
          {
            uid: '-1',
            name: 'thumbnail.jpg',
            status: 'done',
            url: API_URL + record.thumbnail_url,
          },
        ]
        : []
    );
    setModalVisible(true);
  };

  const columns: ColumnsType<CategoryType> = [
    {
      title: 'ID',
      dataIndex: 'id',
    },
    {
      title: 'Tên danh mục',
      dataIndex: 'category_name',
    },
    {
      title: 'Hình ảnh',
      dataIndex: 'thumbnail_url',
      render: (url) =>
        url ? (
          <img
            src={API_URL + url}
            alt="thumb"
            className="w-12 h-12 rounded-md object-cover"
          />
        ) : (
          <span>Không có</span>
        ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      render: (date) => dayjs(date).format('DD/MM/YYYY'),
    },
  ];

  const getActions = (record: CategoryType): TableAction[] => [
    {
      key: 'edit',
      label: 'Sửa',
      onClick: () => handleEdit(record),
    },
    {
      key: 'delete',
      label: <span style={{ color: 'red' }}>Xóa</span>,
      danger: true,
      onClick: () => confirmDelete(record.id),
    },
  ];

  return (
    <div className="p-4">
      {contextHolder}

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Danh sách danh mục tour</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingCategory(null);
            form.resetFields();
            setFileList([]);
            setModalVisible(true);
          }}
        >
          Thêm danh mục
        </Button>
      </div>

      <TableGeneric<CategoryType>
        data={data}
        columns={columns}
        loading={loading}
        rowKey="id"
        getActions={getActions}
      />

      <Modal
        title={editingCategory ? 'Cập nhật danh mục' : 'Thêm danh mục mới'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingCategory(null);
        }}
        onOk={handleCreateOrUpdate}
        okText={editingCategory ? 'Cập nhật' : 'Tạo mới'}
        cancelText="Hủy"
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            label="Tên danh mục"
            name="category_name"
            rules={[{ required: true, message: 'Vui lòng nhập tên danh mục' }]}
          >
            <Input placeholder="Nhập tên danh mục" />
          </Form.Item>

          <Form.Item label="Ảnh đại diện">
            <Upload
              listType="picture"
              fileList={fileList}
              beforeUpload={() => false}
              maxCount={1}
              onChange={({ fileList }) => setFileList(fileList)}
              onRemove={() => setFileList([])}
            >
              <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
