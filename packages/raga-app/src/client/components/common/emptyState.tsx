import { Center, Stack, Text, Title } from "@mantine/core";

interface EmptyStateProps {
  description?: string;
  icon?: React.ReactNode;
  title?: string;
  children?: React.ReactNode;
}

export default function EmptyState({ description, icon, title, children }: EmptyStateProps) {
  return (
    <Center w="100%" h="100%">
      <Stack gap={16} align="center">
        {icon}
        {title && <Title order={4}>{title}</Title>}
        {description && <Text>{description}</Text>}
        {children}
      </Stack>
    </Center>
  );
}
