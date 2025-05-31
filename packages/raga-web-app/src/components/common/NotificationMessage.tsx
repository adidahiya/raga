import { Button, type MantineColor, Stack, Text } from "@mantine/core";
import * as React from "react";

interface NotificationMessageProps {
  message: string;
  action: {
    icon: React.JSX.Element;
    text: string;
    onClick: () => void;
    color?: MantineColor;
  };
}

export default function NotificationMessage({ message, action }: NotificationMessageProps) {
  return (
    <Stack gap={5}>
      <Text>{message}</Text>
      <Button
        size="compact-sm"
        leftSection={action.icon}
        onClick={action.onClick}
        color={action.color}
      >
        {action.text}
      </Button>
    </Stack>
  );
}
