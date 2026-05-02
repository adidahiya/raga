import { Button, type ButtonProps } from "@adahiya/raga-design-system";
import * as React from "react";

interface NotificationMessageProps {
  message: string;
  action: {
    icon: React.JSX.Element;
    text: string;
    onClick: () => void;
    variant?: ButtonProps["variant"];
  };
}

export default function NotificationMessage({ message, action }: NotificationMessageProps) {
  return (
    <div className="flex flex-col gap-1">
      <span>{message}</span>
      <Button
        size="sm"
        variant={action.variant ?? "secondary"}
        onClick={action.onClick}
      >
        <span className="inline-flex items-center gap-1">
          {action.icon}
          {action.text}
        </span>
      </Button>
    </div>
  );
}
