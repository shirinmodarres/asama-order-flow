export type RoleKey = "expert" | "manager" | "warehouse" | "finance" | "support";

export interface Role {
  key: RoleKey;
  title: string;
  description: string;
  path: `/${RoleKey}`;
  badge: string;
}

export interface SidebarItem {
  label: string;
  href: string;
}

export interface DashboardStat {
  id: string;
  label: string;
  value: string;
  hint: string;
}

export interface ActivityItem {
  id: string;
  text: string;
  time: string;
}
