import { Table, Dropdown, Space } from 'antd';
import { BsThreeDots } from "react-icons/bs";

interface TableGenericProps<T> {
  data: T[];
  columns: any[];
  loading?: boolean;
  showConfirm?: boolean;
  onDeleteClick?: (id: number) => void;
  onEditClick?: (id: number) => void;
  deleteId?: number | null;
  setShowConfirm?: (show: boolean) => void;
  contextHolder?: React.ReactNode;
  rowKey?: string;
  actionColumn?: boolean;
}

export default function TableGeneric<T extends { id: number }>({
  data,
  columns,
  loading = false,
  showConfirm = false,
  onDeleteClick,
  onEditClick,
  deleteId,
  setShowConfirm,
  contextHolder,
  rowKey = 'id',
  actionColumn = true,
}: TableGenericProps<T>) {
  const mergedColumns = actionColumn
    ? [
      ...columns,
      {
        title: 'Action',
        key: 'action',
        render: (_: any, record: T) => (
          <Dropdown
            menu={{
              items: [
                { label: 'Xem', key: 'view' },
                ...(onEditClick
                  ? [{
                    label: 'Sửa',
                    key: 'edit',
                    onClick: () => onEditClick(record.id),
                  }]
                  : []),
                ...(onDeleteClick
                  ? [{
                    label: 'Xóa',
                    key: 'delete',
                    danger: true,
                    onClick: () => {
                      setShowConfirm && setShowConfirm(true);
                      onDeleteClick(record.id);
                    },
                  }]
                  : []),
              ],
            }}
            trigger={['click']}
          >
            <a onClick={e => e.preventDefault()} className="w-full block">
              <Space>
                <div className="w-full flex justify-center px-3">
                  <BsThreeDots />
                </div>
              </Space>
            </a>
          </Dropdown>
        ),
      }
    ]
    : columns;

  return (
    <>
      {contextHolder}
      <Table<T>
        rowKey={rowKey}
        columns={mergedColumns}
        dataSource={data}
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </>
  );
}