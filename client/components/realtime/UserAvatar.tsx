"use client";

interface UserAvatarProps {
  user: {
    userId: string;
    username: string;
    avatarUrl?: string;
    email: string;
  };
  size?: "sm" | "md" | "lg";
  showOnline?: boolean;
}

const sizeClasses = {
  sm: "h-6 w-6 text-xs",
  md: "h-8 w-8 text-sm",
  lg: "h-10 w-10 text-base",
};

export function UserAvatar({ user, size = "md", showOnline = false }: UserAvatarProps) {
  return (
    <div className="relative inline-block">
      <div
        className={`${sizeClasses[size]} flex items-center justify-center rounded-full bg-primary text-primary-foreground ring-2 ring-background`}
        title={user.username}
      >
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.username}
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          <span>{user.username.charAt(0).toUpperCase()}</span>
        )}
      </div>
      {showOnline && (
        <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-green-500 ring-2 ring-background" />
      )}
    </div>
  );
}

