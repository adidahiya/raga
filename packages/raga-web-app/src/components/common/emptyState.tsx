import { Center, Stack, Text, Title } from "@mantine/core";

interface EmptyStateProps {
  className?: string;
  description?: string;
  icon?: React.ReactNode;
  title?: string;
  children?: React.ReactNode;
}

export default function EmptyState({
  className,
  description,
  icon,
  title,
  children,
}: EmptyStateProps) {
  return (
    <Center className={className} w="100%" h="100%">
      <Stack gap={16} align="center" py={8}>
        {icon}
        {title && <Title order={4}>{title}</Title>}
        {description && <Text>{description}</Text>}
        {children}
      </Stack>
    </Center>
  );
}
