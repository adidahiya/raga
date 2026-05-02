import classNames from "classnames";

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
    <div
      className={classNames(
        "flex h-full w-full items-center justify-center",
        className,
      )}
    >
      <div className="flex flex-col items-center gap-4 py-2">
        {icon}
        {title !== undefined && (
          <h4 className="m-0 text-h2 font-medium text-text-primary">{title}</h4>
        )}
        {description !== undefined && (
          <span className="text-text-secondary">{description}</span>
        )}
        {children}
      </div>
    </div>
  );
}
