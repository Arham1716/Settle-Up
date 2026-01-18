import {
  Users,
  UserPlus,
  UserMinus,
  Receipt,
  Pencil,
  Trash2,
  Bell,
} from "lucide-react";

function ActivityIcon({ type }: { type: string }) {
  const className = "h-4 w-4 text-white/70 shrink-0";

  switch (type) {
    case "GROUP_CREATED":
      return <Users className={className} />;

    case "MEMBER_ADDED":
      return <UserPlus className={className} />;

    case "MEMBER_REMOVED":
      return <UserMinus className={className} />;

    case "EXPENSE_ADDED":
      return <Receipt className={className} />;

    case "EXPENSE_UPDATED":
      return <Pencil className={className} />;

    case "EXPENSE_DELETED":
      return <Trash2 className={className} />;

    default:
      return <Bell className={className} />;
  }
}

export { ActivityIcon };
