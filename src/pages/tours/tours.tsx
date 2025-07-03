import { Button } from 'antd';
import { useNotifier } from "@/hooks/useNotifier";
import { notification } from 'antd';

export default function Tours() {
  const { notifySuccess, contextHolder } = useNotifier();

  return (
    <div>
      {contextHolder}
      <Button
        onClick={() => notification.success({ message: "iosadasdsadsadsad;" })}
      >
        Show message
      </Button>
    </div>
  )
}
