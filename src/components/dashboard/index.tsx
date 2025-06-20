import { useLayout } from "@/contexts/LayoutContext";
import { useNavigate } from "react-router-dom";
import { usePageTitle } from "@/contexts/PageTitleContext";
import { FaChartPie, FaGift, FaRegEnvelopeOpen, FaUser } from "react-icons/fa";
import { MdTour } from "react-icons/md";
import { FaLocationDot, FaRegEnvelope } from "react-icons/fa6";
import { VscExtensions } from "react-icons/vsc";
import type { MenuProps } from 'antd';
import { Menu } from 'antd';

type MenuItem = Required<MenuProps>['items'][number];

const items: MenuItem[] = [
  { key: '/', icon: <FaChartPie />, label: 'Thống kê' },

  {
    key: 'user',
    label: 'Tài khoản',
    icon: <FaUser />,
    children: [
      { key: '/user/employee', label: 'Tài khoản nhân viên' },
      { key: '/user/customer', label: 'Tài khoản khách hàng' },
      { key: '/user/add', label: 'Tạo tài khoản' },
    ],
  },

  {
    key: 'tour',
    label: 'Quản lý Tours',
    icon: <MdTour />,
    children: [
      { key: '/tours', label: 'Danh sách Tours' },
      { key: '/category/tours', label: 'Danh mục Tours' },
      { key: '/tours/book', label: 'Đặt Tour' },
    ],
  },

  {
    key: 'destination',
    label: 'Quản lý Điểm đến',
    icon: <FaLocationDot />,
    children: [
      { key: '/destinations', label: 'Danh sách điểm đến' },
      { key: '/category/destinations', label: 'Danh mục điểm đến' },
      { key: '/destinations/add', label: 'Thêm điểm đến' },
    ],
  },

  {
    key: 'service',
    label: 'Dịch vụ mở rộng',
    icon: <VscExtensions />,
    children: [
      { key: '/guides', label: 'Thuê hướng dẫn viên' },
      { key: '/motorbikes', label: 'Thuê xe máy' },
      { key: '/bus-routes', label: 'Tuyến xe khách' },
      { key: '/hotels', label: 'Đặt phòng khách sạn' },
    ],
  },

  {
    key: 'combo',
    label: 'Combo',
    icon: <FaGiftt />,
    children: [
      { key: '/combos', label: 'Danh sách combo' },
      { key: '/combos/add', label: 'Tạo combo mới' },
    ],
  },

  {
    key: 'booking',
    label: 'Quản lý đặt chỗ',
    icon: <FaRegEnvelopeOpen />,
    children: [
      { key: '/bookings', label: 'Tất cả đặt chỗ' },
      { key: '/custom-tours', label: 'Tour linh hoạt' },
    ],
  },

  {
    key: 'review',
    label: 'Đánh giá & Phản hồi',
    icon: <FaRegComments />,
    children: [
      { key: '/reviews', label: 'Đánh giá tour' },
      { key: '/feedbacks', label: 'Phản hồi người dùng' },
    ],
  },

  {
    key: 'payment',
    label: 'Thanh toán',
    icon: <MdPayments />,
    children: [
      { key: '/payments', label: 'Giao dịch thanh toán' },
      { key: '/payment-methods', label: 'Phương thức thanh toán' },
    ],
  },

  {
    key: 'promotion',
    label: 'Khuyến mãi',
    icon: <FaGift />,
    children: [
      { key: '/promotions', label: 'Mã khuyến mãi' },
    ],
  },

  {
    key: 'notification',
    label: 'Thông báo',
    icon: <FaBell />,
    children: [
      { key: '/notifications', label: 'Danh sách thông báo' },
    ],
  },

  {
    key: 'contact',
    label: 'Liên hệ & Hỗ trợ',
    icon: <FaRegEnvelope />,
    children: [
      { key: '/contacts', label: 'Yêu cầu hỗ trợ' },
      { key: '/chats', label: 'Chat trực tuyến' },
    ],
  },
];

const findLabelByKey = (key: string, items: MenuItem[]): string | undefined => {
  for (const item of items) {
    if (!item) continue;
    if ('key' in item && item.key === key && 'label' in item && item.label) {
      return String(item.label);
    }

    if ('children' in item && Array.isArray(item.children)) {
      const found = findLabelByKey(key, item.children as MenuItem[]);
      if (found) return found;
    }
  }
  return undefined;
};

export default function Dashboard() {
  const { collapsed } = useLayout();
  const navigate = useNavigate();
  const { setTitle } = usePageTitle();

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    const route = e.key;
    navigate(route);

    const label = findLabelByKey(route, items);
    if (label) setTitle(label);
  };


  return (
    <div
      className={`absolute z-1 top-[70px] left-0 h-[calc(100vh-70px)] min-h-[calc(100vh-70px)]  transition-all duration-300 overflow-hidden ${collapsed ? 'w-[80px]' : 'w-[250px]'}`}
    >
      <div className='flex flex-col h-full '>
        <Menu
          defaultSelectedKeys={['1']}
          defaultOpenKeys={['sub1']}
          mode="inline"
          theme="dark"
          inlineCollapsed={collapsed}
          items={items}
          onClick={handleMenuClick}
          className="flex-1 overflow-auto"
        />
      </div>
    </div>
  );
};
