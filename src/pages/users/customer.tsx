import { Dropdown, Space, Table, Tag } from 'antd';
import { BsThreeDots } from "react-icons/bs";
import type { TableProps } from 'antd';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNotifier } from '@/hooks/useNotifier';
import { useNavigate } from 'react-router-dom';
// import { useAuth } from '@/contexts/AuthContext';
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { API } from "@/lib/axios";
import { getCsrfToken } from "@/utils/getCsrfToken";

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

export default function Employee() {
  const apiUrl = "http://127.0.0.1:8000/api/users/";
  const [data, setData] = useState<DataType[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  // const { user } = useAuth();
  const user = useSelector((state: RootState) => state.auth.user);
  const navigate = useNavigate();
  const { notifySuccess, notifyError, contextHolder } = useNotifier();
  const token = localStorage.getItem('token');

  const fetchStaffUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      let customerUsers = response.data.filter((user: DataType) => user.role === 'customer');

      if (user?.role === 'staff') {
        customerUsers = customerUsers.filter((user: DataType) => user.is_deleted === 'active');
      }

      setData(customerUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      notifyError('Lấy danh sách người dùng thất bại');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffUsers();
  }, [user?.role]);

  const handleDelete = async (id: number) => {
    try {
      const xsrfToken = await getCsrfToken();

      const response = await API.delete(`/user/delete/${id}`, {
        headers: {
          'X-XSRF-TOKEN': xsrfToken ?? '',
        },
      });

      notifySuccess(response.data.message);
      setData((prevData) => prevData.filter((user) => user.id !== id));
      setShowConfirm(false);
      setDeleteId(null);
    } catch (error: any) {
      console.error('Error deleting user:', error);
      const errorMessage = error.response?.data?.message || 'Xóa user thất bại';
      notifyError(errorMessage);
    }
  };

  const baseColumns: TableProps<DataType>['columns'] = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
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
    {
      title: 'Họ và tên',
      dataIndex: 'full_name',
      key: 'full_name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
    },
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
        <span
          className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${isVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-800'
            }`}
        >
          {isVerified ? 'Đã xác thực' : 'Chưa xác thực'}
        </span>
      ),
    },
  ];

  // Add "Hoạt động" column only for admin
  const activityColumn: TableProps<DataType>['columns'] = [
    {
      title: 'Hoạt động',
      dataIndex: 'is_deleted',
      key: 'is_deleted',
      render: (isDeleted: string) => (
        <span
          className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${isDeleted === 'active' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
            }`}
        >
          {isDeleted === 'active' ? 'Đang hoạt động' : 'Ngưng hoạt động'}
        </span>
      ),
    },
  ];

  const actionColumn: TableProps<DataType>['columns'] = [
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              { label: 'Xem', key: 'view' },
              {
                label: 'Sửa',
                key: 'edit',
                onClick: () => {
                  navigate(`/user/update/${record.id}`);
                },
              },
              {
                label: 'Xóa',
                key: 'delete',
                danger: true,
                onClick: () => {
                  setDeleteId(record.id);
                  setShowConfirm(true);
                },
              },
            ],
          }}
          trigger={['click']}
        >
          <a onClick={(e) => e.preventDefault()} className="w-full block">
            <Space>
              <div className="w-full flex justify-center px-3">
                <BsThreeDots />
              </div>
            </Space>
          </a>
        </Dropdown>
      ),
    },
  ];

  const columns = user?.role === 'admin'
    ? [...baseColumns, ...activityColumn, ...actionColumn]
    : [...baseColumns, ...actionColumn];

  return (
    <>
      {contextHolder}
      <Table<DataType>
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#00000052] bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-[90%] max-w-md p-6">
            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-semibold">Xác nhận xóa</h3>
              <p className="mb-6">Bạn có chắc chắn muốn xóa tài khoản này?</p>
            </div>
            <div className="flex justify-end space-x-2 gap-4 mt-10">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 bg-gray-300 text-[#fff] rounded hover:bg-gray-400"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  if (deleteId !== null) {
                    handleDelete(deleteId);
                  }
                }}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}