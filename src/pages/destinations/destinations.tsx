import { useEffect, useState } from 'react';
import {
  Modal,
  Form,
  Input,
  Upload,
  Button,
} from 'antd';
import type { UploadFile } from 'antd';
import { UploadOutlined, PlusOutlined } from '@ant-design/icons';
import { API } from '@/lib/axios';
import TableGeneric from '@/components/TableGeneric';
import type { ColumnsType } from 'antd/es/table';
import type { TableAction } from '@/components/TableGeneric';
import { useNotifier } from '@/hooks/useNotifier';
import CustomButton from '@/components/CustomButton';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { useNavigate } from 'react-router-dom';
import { Dropdown } from 'antd';
import type { MenuProps } from 'antd';

interface DestinationType {
  id: number;
  name: string;
  location: string;
  image: string;
  image_url: string;
  is_deleted: 'active' | 'inactive';
}

export default function Destinations() {
  const [data, setData] = useState<DestinationType[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<DestinationType | null>(null);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const role = useSelector((state: RootState) => state.auth.user?.role);
  const { contextHolder, notifyError, notifySuccess } = useNotifier();
  const navigate = useNavigate();

  const fetchDestinations = async () => {
    setLoading(true);
    try {
      const res = await API.get('/destinations');
      const filtered = res.data
        .filter((item: DestinationType) => role !== 'staff' || item.is_deleted === 'active');
      setData(filtered);
    } catch {
      notifyError('Không thể tải danh sách địa điểm');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDestinations();
  }, []);

  const handleCreateOrUpdate = async () => {
    try {
      const values = await form.validateFields();
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('location', values.location);
      if (fileList[0]?.originFileObj) {
        formData.append('image', fileList[0].originFileObj);
      }

      if (editing) {
        await API.post(`/destinations/${editing.id}?_method=PUT`, formData);
        notifySuccess('Cập nhật địa điểm thành công');
      } else {
        await API.post('/destinations', formData);
        notifySuccess('Tạo địa điểm thành công');
      }

      setModalVisible(false);
      setEditing(null);
      form.resetFields();
      setFileList([]);
      fetchDestinations();
    } catch {
      notifyError('Thao tác thất bại');
    }
  };

  const handleEdit = (record: DestinationType) => {
    if (record.is_deleted === 'inactive') {
      notifyError('Không thể chỉnh sửa địa điểm đã bị vô hiệu hóa');
      return;
    }
    setEditing(record);
    form.setFieldsValue({ name: record.name, location: record.location });
    setFileList(
      record.image
        ? [
          {
            uid: '-1',
            name: 'image.jpg',
            status: 'done',
            url: record.image_url,
          },
        ]
        : []
    );
    setModalVisible(true);
  };

  const handleSoftDelete = async (id: number) => {
    try {
      await API.post(`/destinations/${id}/soft-delete`);
      notifySuccess('Cập nhật trạng thái thành công');
      fetchDestinations();
    } catch {
      notifyError('Thao tác thất bại');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await API.delete(`/destinations/${id}`);
      notifySuccess('Xóa vĩnh viễn thành công');
      fetchDestinations();
    } catch {
      notifyError('Xóa thất bại');
    }
  };

  const confirmDelete = (id: number) => {
    setDeletingId(id);
    setConfirmDeleteVisible(true);
  };

  const columns: ColumnsType<DestinationType> = [
    { title: 'ID', dataIndex: 'id' },
    { title: 'Tên địa điểm', dataIndex: 'name' },
    {
      title: 'Hình ảnh',
      render: (_, record) =>
        record.image_url ? (
          <img src={record.image_url} className="w-12 h-12 rounded-md object-cover" />
        ) : (
          'Không có'
        ),
    },
    { title: 'Địa điểm', dataIndex: 'location' },
  ];

  if (role === 'admin') {
    columns.push({
      title: 'Trạng thái',
      dataIndex: 'is_deleted',
      render: (val) => val === 'active' ? (<span className="active">Đang hoạt động</span>) : (<span className="active">Ngưng hoạt động</span>),
    });
  }

  columns.push({
    title: 'Thao tác',
    render: (_, record) => getActions(record),
  });

  const getActions = (record: DestinationType): React.ReactNode => {
    const items: MenuProps['items'] = [
      { key: 'edit', label: 'Sửa' },
    ];

    if (role === 'admin') {
      items.push(
        {
          key: 'toggle-status',
          label: record.is_deleted === 'active' ? 'Vô hiệu hóa' : 'Kích hoạt',
        },
        {
          key: 'force-delete',
          label: <span style={{ color: 'red' }}>Xóa vĩnh viễn</span>,
        }
      );
    } else if (role === 'staff') {
      items.push({
        key: 'soft-delete',
        label: <span style={{ color: 'red' }}>Xóa</span>,
      });
    }

    const handleMenuClick = ({ key }: { key: string }) => {
      if (key === 'edit') {
        handleEdit(record);
      } else if (key === 'toggle-status') {
        const newStatus = record.is_deleted === 'active' ? 'inactive' : 'active';
        handleSoftDelete(record.id);
      } else if (key === 'force-delete') {
        confirmDelete(record.id);
      } else if (key === 'soft-delete') {
        handleSoftDelete(record.id);
      }
    };

    return (
      <Dropdown
        menu={{ items, onClick: handleMenuClick }}
        trigger={['click']}
      >
        <Button type="text" icon={<PlusOutlined />} />
      </Dropdown>
    );
  };


  return (
    <>
      {contextHolder}
      <div className="mb-2">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            navigate("/destination/create")
          }}
        >
          Thêm địa điểm
        </Button>
      </div>

      <TableGeneric<DestinationType>
        data={data}
        columns={columns}
        loading={loading}
        rowKey="id"
      />

      <Modal
        title={editing ? 'Cập nhật địa điểm' : 'Thêm địa điểm mới'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleCreateOrUpdate}
        okText={editing ? 'Cập nhật' : 'Tạo mới'}
        cancelText="Hủy"
      >
        <Form layout="vertical" form={form}>
          <Form.Item label="Tên địa điểm" name="name" rules={[{ required: true }]}> <Input /> </Form.Item>
          <Form.Item label="Địa điểm" name="location" rules={[{ required: true }]}> <Input /> </Form.Item>
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
        title="Xác nhận xóa vĩnh viễn"
        onCancel={() => setConfirmDeleteVisible(false)}
        footer={[
          <CustomButton key="cancel" text="Hủy" customType="cancel" onClick={() => setConfirmDeleteVisible(false)} />,
          <CustomButton
            key="delete"
            text="Xóa"
            customType="delete"
            onClick={() => deletingId !== null && handleDelete(deletingId)}
            loading={loading}
          />,
        ]}
      >
        <p>Bạn chắc chắn muốn xóa vĩnh viễn địa điểm này?</p>
      </Modal>
    </>
  );
}
