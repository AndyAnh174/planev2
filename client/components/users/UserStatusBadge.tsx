"use client";

interface UserStatusBadgeProps {
  status: "active" | "inactive" | "pending";
}

export function UserStatusBadge({ status }: UserStatusBadgeProps) {
  const statusConfig = {
    active: {
      label: "Active",
      className: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
    },
    inactive: {
      label: "Inactive",
      className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400",
    },
    pending: {
      label: "Pending",
      className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
    },
  };

  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}

