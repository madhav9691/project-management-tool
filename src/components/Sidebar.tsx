"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Building2,
  FileText,
  Settings,
  Briefcase,
  CheckCircle,
  Send,
  Upload,
  Download,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Projects", href: "/projects", icon: FolderKanban },
  { name: "Assign Tasks", href: "/assign", icon: Send },
  { name: "All Tasks", href: "/tasks", icon: CheckCircle },
  { name: "Resource Portal", href: "/portal", icon: Users },
  { name: "Team Members", href: "/team", icon: Users },
  { name: "Clients", href: "/clients", icon: Building2 },
  { name: "Import Data", href: "/import", icon: Upload },
  { name: "Export Reports", href: "/export", icon: Download },
  { name: "Reports", href: "/reports", icon: FileText },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Briefcase className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-lg font-bold text-gray-900">ProjectHub</h1>
            <p className="text-xs text-gray-500">Management Platform</p>
          </div>
        </div>
      </div>
      <nav className="sidebar-nav">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`sidebar-link ${isActive ? "active" : ""}`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
            A
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Admin User</p>
            <p className="text-xs text-gray-500">admin@projecthub.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
