import { Button, Group, Text } from "@mantine/core";
import * as React from "react";

interface NotificationMessageProps {
  message: string;
  action: {
    icon: React.JSX.Element;
    text: string;
    onClick: () => void;
  };
}

export default function NotificationMessage({ message, action }: NotificationMessageProps) {
  return (
    <Group>
      <Text style={{ flexGrow: 1 }}>{message}</Text>
      <Button leftSection={action.icon} onClick={action.onClick}>
        {action.text}
      </Button>
    </Group>
  );
}
