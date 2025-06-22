import { Dropdown, Space, Table, Tag } from 'antd';
import { BsThreeDots } from "react-icons/bs";
import type { TableProps } from 'antd';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNotifier } from '@/hooks/useNotifier';
import { useNavigate } from 'react-router-dom';


interface DataType {
  id: number;
  avatar: string;
  full_name: string;
  email: string;
  phone: string;
  role: string;
}

export default function Employee() {
  const apiUrl = "http://127.0.0.1:8000/api/users/";
  const [data, setData] = useState<DataType[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

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

      const staffUsers = response.data.filter((user: DataType) => user.role === 'staff');
      setData(staffUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffUsers();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`${apiUrl}${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      notifySuccess('Xóa user thành công');
      setData((prevData) => prevData.filter((user) => user.id !== id));
    } catch (error) {
      console.error('Error deleting user:', error);
      notifyError('Xóa user thất bại');
    }
  };

  const columns: TableProps<DataType>['columns'] = [
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
  return (
    <>
      {contextHolder}
      < Table<DataType>
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={{ pageSize: 10 }
        }
      />
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#00000052] bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-[90%] max-w-md p-6">
            <div className='flex flex-col gap-4'>
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
                    setShowConfirm(false);
                    setDeleteId(null);
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
