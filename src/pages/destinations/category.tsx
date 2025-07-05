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
} from '@ant-design/icons';
import { API } from '@/lib/axios';
import TableGeneric from '@/components/TableGeneric';
import type { ColumnsType } from 'antd/es/table';
import type { TableAction } from '@/components/TableGeneric';
import { useNotifier } from '@/hooks/useNotifier';
import dayjs from 'dayjs';
import CustomButton from '@/components/CustomButton';
import { useSelector } from "react-redux";
import type { RootState } from "@/store";

interface CategoryType {
  id: number;
  category_name: string;
  thumbnail?: string;
  thumbnail_url?: string;
  created_at?: string;
  is_deleted: 'active' | 'inactive';
}


export default function DestinationCategory() {
  const [data, setData] = useState<CategoryType[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryType | null>(null);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const role = useSelector((state: RootState) => state.auth.user?.role);


  const { contextHolder, notifyError, notifySuccess } = useNotifier();

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await API.get("/destination-categories");

      const updated = res.data
        .filter((item: any) => role !== 'staff' || item.is_deleted === 'active')
        .map((item: any) => ({
          id: item.category_id ?? item.id,
          category_name: item.category_name,
          thumbnail: item.thumbnail,
          thumbnail_url: item.thumbnail_url,
          created_at: item.created_at,
          is_deleted: item.is_deleted,
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
        await API.post(`/destination-categories/${editingCategory.id}?_method=PUT`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        notifySuccess('Cập nhật danh mục thành công');
      } else {
        // CREATE
        await API.post('/destination-categories', formData, {
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
    setDeletingId(id);
    setConfirmDeleteVisible(true);
  };

  const handleDelete = async (id: number) => {
    console.log('Deleting ID:', id);
    try {
      await API.delete(`/destination-categories/${id}`);
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
            url: record.thumbnail_url,
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
            src={url}
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
  if (role === 'admin') {
    columns.push({
      title: 'Trạng thái',
      dataIndex: 'is_deleted',
      render: (val: 'active' | 'inactive') =>
        val === 'active' ? (
          <span className="active">Đang hoạt động</span>
        ) : (
          <span className="inactive">Ngưng hoạt động</span>
        ),
    });
  }


  const getActions = (record: CategoryType): TableAction[] => {
    const actions: TableAction[] = [
      {
        key: 'edit',
        label: 'Sửa',
        onClick: () => handleEdit(record),
      },
    ];

    if (role === 'admin') {
      actions.push({
        key: record.is_deleted === 'active' ? 'disable' : 'enable',
        label: record.is_deleted === 'active' ? 'Vô hiệu hóa' : 'Kích hoạt',
        onClick: async () => {
          try {
            await API.post(`/destination-categories/${record.id}/soft-delete`, {
              is_deleted: record.is_deleted === 'active' ? 'inactive' : 'active',
            });
            notifySuccess('Cập nhật trạng thái thành công');
            fetchCategories();
          } catch {
            notifyError('Thao tác thất bại');
          }
        },
      });

      actions.push({
        key: 'force-delete',
        label: <span style={{ color: 'red' }}>Xóa vĩnh viễn</span>,
        danger: true,
        onClick: () => confirmDelete(record.id),
      });
    }

    if (role === 'staff') {
      actions.push({
        key: 'soft-delete',
        label: <span style={{ color: 'red' }}>Xóa</span>,
        danger: true,
        onClick: async () => {
          try {
            await API.post(`/destination-categories/${record.id}/soft-delete`, {
              is_deleted: 'inactive',
            });
            notifySuccess('Xóa danh mục (mềm) thành công');
            fetchCategories();
          } catch {
            notifyError('Thao tác thất bại');
          }
        },
      });
    }

    return actions;
  };


  return (
    <>
      {contextHolder}
      <div className='mb-2'>
        < Button
          type="primary"
          icon={< PlusOutlined />}
          onClick={() => {
            setEditingCategory(null);
            form.resetFields();
            setFileList([]);
            setModalVisible(true);
          }}
        >
          Thêm danh mục
        </ Button>
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
      <Modal
        open={confirmDeleteVisible}
        title="Xác nhận xóa danh mục"
        footer={[
          <CustomButton
            key="cancel"
            text="Hủy"
            customType="cancel"
            onClick={() => setConfirmDeleteVisible(false)}
          />,
          <CustomButton
            key="delete"
            text={"Xóa"}
            customType="delete"
            onClick={() => {
              if (deletingId !== null) handleDelete(deletingId);
              setConfirmDeleteVisible(false);
            }}
            loading={loading}
          />,
        ]}
      >
        <p>Bạn chắc chắn muốn xóa danh mục này?</p>
      </Modal >

    </>
  );
}
