import { Tag, Modal, Dropdown, Space } from 'antd';
import { useEffect, useState } from 'react';
import { useNotifier } from '@/hooks/useNotifier';
import { useNavigate } from 'react-router-dom';
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import TableGeneric from '@/components/TableGeneric';
import { API } from "@/lib/axios";
import { getCsrfToken } from "@/utils/getCsrfToken";

interface DataType {
  id: number;
  avatar: string;
  full_name: string;
  email: string;
  phone: string;
  role: string;
  is_verified?: boolean;
  is_deleted?: string; // "active" | "inactive"
}

export default function Employee() {
  const [data, setData] = useState<DataType[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [actionType, setActionType] = useState<'soft' | 'hard'>('soft');
  const navigate = useNavigate();
  const { notifySuccess, notifyError, contextHolder } = useNotifier();
  const token = localStorage.getItem('token');
  const user = useSelector((state: RootState) => state.auth.user);

  const fetchStaffUsers = async () => {
    setLoading(true);
    try {
      const response = await API.get(`${API}/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      const staffUsers = response.data.filter((u: DataType) => u.role === 'staff' || u.role === 'admin');
      setData(staffUsers);
    } catch (error) {
      notifyError('Lấy danh sách nhân viên thất bại');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffUsers();
  }, []);

  const handleSoftDelete = async () => {
    if (deleteId == null) return;
    try {
      const xsrfToken = await getCsrfToken();
      await API.put(`${API}/users/${deleteId}`, { is_deleted: 'inactive' }, {
        headers: { 'X-XSRF-TOKEN': xsrfToken ?? '' },
      });
      notifySuccess('Chuyển trạng thái tài khoản thành công');
      setData(prev =>
        prev.map(u =>
          u.id === deleteId ? { ...u, is_deleted: 'inactive' } : u
        )
      );
      setShowConfirm(false);
      setDeleteId(null);
    } catch (error) {
      notifyError('Chuyển trạng thái thất bại');
    }
  };

  const handleHardDelete = async () => {
    if (deleteId == null) return;
    try {
      const xsrfToken = await getCsrfToken();
      await API.delete(`${API}/users/${deleteId}`, {
        headers: { 'X-XSRF-TOKEN': xsrfToken ?? '' },
      });
      notifySuccess('Xóa user thành công');
      setData(prev => prev.filter(u => u.id !== deleteId));
      setShowConfirm(false);
      setDeleteId(null);
    } catch (error) {
      notifyError('Xóa user thất bại');
    }
  };

  const handleDeleteClick = (id: number, type: 'soft' | 'hard') => {
    setDeleteId(id);
    setActionType(type);
    setShowConfirm(true);
  };

  const columns = [
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
      render: (role: string) => <Tag color={role === 'admin' ? 'magenta' : 'success'}>{role}</Tag>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'is_deleted',
      key: 'is_deleted',
      render: (is_deleted: string) => (
        <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full
          ${is_deleted === 'active' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
          {is_deleted === 'active' ? 'Đang hoạt động' : 'Ngưng hoạt động'}
        </span>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: DataType) => {
        return (
          <Dropdown
            menu={{
              items: [
                {
                  label: 'Sửa',
                  key: 'edit',
                  onClick: () => navigate(`/user/update/${record.id}`),
                },
                {
                  label: 'Chuyển trạng thái (xóa mềm)',
                  key: 'soft-delete',
                  onClick: () => handleDeleteClick(record.id, 'soft'),
                  disabled: record.is_deleted === 'inactive',
                },
                ...(record.role === 'admin'
                  ? [{
                    label: <span style={{ color: 'red' }}>Xóa vĩnh viễn</span>,
                    key: 'hard-delete',
                    danger: true,
                    onClick: () => handleDeleteClick(record.id, 'hard'),
                  }]
                  : [])
              ],
            }}
            trigger={['click']}
          >
            <a onClick={e => e.preventDefault()} className="w-full block">
              <Space>
                <div className="w-full flex justify-center px-3">
                  <span>⋮</span>
                </div>
              </Space>
            </a>
          </Dropdown>
        );
      },
    },
  ];

  return (
    <>
      {contextHolder}
      <TableGeneric<DataType>
        data={data}
        columns={columns}
        loading={loading}
        rowKey="id"
      />
      <Modal
        open={showConfirm}
        onCancel={() => { setShowConfirm(false); setDeleteId(null); }}
        onOk={actionType === 'soft' ? handleSoftDelete : handleHardDelete}
        okText={actionType === 'hard' ? "Xóa vĩnh viễn" : "Chuyển trạng thái"}
        okButtonProps={actionType === 'hard' ? { danger: true } : {}}
        cancelText="Hủy"
        title={actionType === 'hard' ? "Xác nhận xóa vĩnh viễn" : "Xác nhận chuyển trạng thái"}
      >
        {actionType === 'hard'
          ? "Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản này? Thao tác này không thể hoàn tác."
          : "Bạn có chắc chắn muốn chuyển trạng thái tài khoản này sang 'Ngưng hoạt động'? (xóa mềm)"}
      </Modal>
    </>
  );
}