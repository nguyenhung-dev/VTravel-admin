import { Tag, Modal } from 'antd';
import { useEffect, useState } from 'react';
import { useNotifier } from '@/hooks/useNotifier';
import { useNavigate } from 'react-router-dom';
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { API } from "@/lib/axios";
import { getCsrfToken } from "@/utils/getCsrfToken";
import TableGeneric from '@/components/TableGeneric';

interface DataType {
  id: number;
  avatar: string;
  full_name: string;
  email: string;
  phone: string;
  role: string;
  is_verified: boolean;
  is_deleted: string;
}

export default function Customer() {
  const [data, setData] = useState<DataType[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const user = useSelector((state: RootState) => state.auth.user);
  const navigate = useNavigate();
  const { notifySuccess, notifyError, contextHolder } = useNotifier();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const xsrfToken = await getCsrfToken();
      const response = await API.get(`/users`, {
        headers: { 'X-XSRF-TOKEN': xsrfToken ?? '' },
      });
      let customerUsers = response.data.filter((user: DataType) => user.role === 'customer');
      if (user?.role === 'staff') {
        customerUsers = customerUsers.filter((user: DataType) => user.is_deleted === 'active');
      }
      setData(customerUsers);
    } catch (error) {
      notifyError('Lấy danh sách khách hàng thất bại');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [user?.role]);

  const handleDelete = async () => {
    if (deleteId == null) return;
    try {
      const xsrfToken = await getCsrfToken();
      await API.delete(`/user/delete/${deleteId}`, {
        headers: { 'X-XSRF-TOKEN': xsrfToken ?? '' },
      });
      notifySuccess('Xóa user thành công');
      setData(prev => prev.filter(u => u.id !== deleteId));
      setShowConfirm(false);
      setDeleteId(null);
    } catch (error: any) {
      notifyError('Xóa user thất bại');
    }
  };

  const baseColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    {
      title: 'Ảnh đại diện',
      dataIndex: 'avatar',
      key: 'avatar',
      render: (avatar: string | null) =>
        avatar ? (
          <img src={avatar} alt="avatar" style={{ width: 40, height: 40, borderRadius: '50%' }} />
        ) : (
          <img
            src="/images/avatar-default.png"
            alt="default avatar"
            style={{ width: 40, height: 40, borderRadius: '50%' }}
          />
        ),
    },
    { title: 'Họ và tên', dataIndex: 'full_name', key: 'full_name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Số điện thoại', dataIndex: 'phone', key: 'phone' },
    {
      title: 'Quyền',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => <Tag color={role === 'staff' ? 'success' : 'default'}>{role}</Tag>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'is_verified',
      key: 'is_verified',
      render: (isVerified: boolean) => (
        <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${isVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-800'}`}>
          {isVerified ? 'Đã xác thực' : 'Chưa xác thực'}
        </span>
      ),
    },
  ];
  const activityColumn = [{
    title: 'Hoạt động',
    dataIndex: 'is_deleted',
    key: 'is_deleted',
    render: (isDeleted: string) => (
      <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${isDeleted === 'active' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
        {isDeleted === 'active' ? 'Đang hoạt động' : 'Ngưng hoạt động'}
      </span>
    ),
  }];
  const columns = user?.role === 'admin'
    ? [...baseColumns, ...activityColumn]
    : baseColumns;

  return (
    <>
      {contextHolder}
      <TableGeneric<DataType>
        data={data}
        columns={columns}
        loading={loading}
        onDeleteClick={id => { setDeleteId(id); setShowConfirm(true); }}
        onEditClick={id => navigate(`/user/update/${id}`)}
        rowKey="id"
      />
      <Modal
        open={showConfirm}
        onCancel={() => { setShowConfirm(false); setDeleteId(null); }}
        onOk={handleDelete}
        okText="Xóa"
        okButtonProps={{ danger: true }}
        cancelText="Hủy"
        title="Xác nhận xóa"
      >
        Bạn có chắc chắn muốn xóa tài khoản này?
      </Modal>
    </>
  );
}