import { FaBars } from "react-icons/fa";
import { useLayout } from "@/contexts/LayoutContext";
import { usePageTitle } from "@/contexts/PageTitleContext";
import type { MenuProps } from 'antd';
import { Dropdown, Space } from 'antd';
import { Link } from "react-router-dom";
import { Button } from "antd";
import { useAuth } from "@/contexts/AuthContext";

export default function Header() {
  const { toggleSidebar, toggleCollapsed } = useLayout()
  const { title } = usePageTitle()
  const { logout, user } = useAuth();

  const items: MenuProps['items'] = [
    {
      label: (
        <Link to="/">Profile</Link>
      ),
      key: '0',
    },
    {
      label: (
        <Link to="/">Setting</Link>
      ),
      key: '1',
    },
    {
      label: <Button onClick={logout}>Logout</Button>,
      key: '3',
    },
  ];

  return (
    <div className="fixed z-10 bg-[#ffffff] top-0 left-0 right-0 h-[70px] flex items-center px-5">
      <div className="flex justify-between items-center w-[220px]">
        <img src="/images/logo.png" alt="logo" className="h-[45px] w-auto object-cover object-center" />
        <button onClick={() => {
          toggleSidebar();
          toggleCollapsed();
        }}>
          <FaBars className="cursor-pointer" />
        </button>
      </div>
      <div className="flex-1 px-5">
        <h1 className="text-xl font-extrabold">{title}</h1>
      </div>
      <div>
        <Dropdown menu={{ items }} trigger={['click']} className="cursor-pointer">
          <a onClick={(e) => e.preventDefault()}>
            <Space className="flex items-center gap-2">
              <img src="/images/avatar-default.png" alt="avatar" className="w-10 h-10 rounded-[50%] object-cover" />
              <span>
                {
                  user && (
                    user.full_name
                  )
                }
              </span>
            </Space>
          </a>
        </Dropdown>
      </div>
    </div >
  )
}
