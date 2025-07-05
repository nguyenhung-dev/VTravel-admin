import { useState } from 'react';
import { useNotifier } from '@/hooks/useNotifier';
import { Button, Form, Input, Select, Upload } from 'antd';
import { API } from '@/lib/axios';


interface DestinationType {
  name: string;
  description: string;
  location: string;
  type: string;
  images: string[];
}

export default function CreateDestination() {
  const { contextHolder } = useNotifier();

  return (
    <>
      {contextHolder}
      <div className="w-full max-w-3xl mx-auto bg-white p-8 shadow-lg rounded-[8px]">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800">Thêm điểm đến mới</h1>
          <span className="mt-2 text-gray-500 text-sm">
            Điền đầy đủ thông tin để tạo điểm đến mới
          </span>
        </div>
      </div>
    </>
  );
}