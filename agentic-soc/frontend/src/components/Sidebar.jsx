import { NavLink } from "react-router-dom";
import Icon from "./Icon.jsx";

const navItems = [
  { to: "/dashboard", icon: "dashboard", label: "Dashboard" },
  { to: "/alerts", icon: "warning", label: "Alerts" },
  { to: "/investigations/new", icon: "security", label: "Investigations" },
  { to: "/entities", icon: "hub", label: "Entities" },
  { to: "/approvals", icon: "approval_delegation", label: "Approvals" },
  { to: "/reports", icon: "analytics", label: "Reports" }
];

function navClass({ isActive }) {
  const base =
    "flex items-center gap-md rounded-lg p-md transition-all active:scale-95 active:opacity-80";
  return isActive
    ? `${base} active-nav-glow border-r-2 border-primary bg-secondary-container/10 text-primary`
    : `${base} text-on-surface-variant hover:bg-surface-container-highest`;
}

export default function Sidebar() {
  return (
    <aside className="group fixed left-0 top-0 z-50 flex h-full w-20 flex-col border-r border-outline-variant bg-surface-container-low py-md transition-all duration-300 hover:w-64">
      <div className="mb-xl flex items-center gap-md px-lg">
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary">
          <Icon name="security" className="text-[20px] text-on-primary" filled />
        </div>
        <div className="overflow-hidden whitespace-nowrap opacity-0 transition-opacity group-hover:opacity-100">
          <h1 className="text-lg font-black tracking-tight text-primary">intelliSOC</h1>
          <p className="font-geist text-[11px] uppercase tracking-[0.05em] text-on-surface-variant">SOC Operations</p>
        </div>
      </div>

      <nav className="flex-1 space-y-xs overflow-hidden px-sm">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} className={navClass} title={item.label}>
            {({ isActive }) => (
              <>
                <Icon name={item.icon} className="shrink-0" filled={isActive} />
                <span className="font-geist text-[11px] font-bold uppercase tracking-[0.05em] opacity-0 transition-opacity group-hover:opacity-100">
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="space-y-xs border-t border-outline-variant px-sm pt-md">
        <a className="flex items-center gap-md rounded-lg p-md text-on-surface-variant transition-colors hover:bg-surface-container-highest" href="#">
          <Icon name="support" className="shrink-0" />
          <span className="font-geist text-[11px] uppercase tracking-[0.05em] opacity-0 transition-opacity group-hover:opacity-100">
            Support
          </span>
        </a>
        <a className="flex items-center gap-md rounded-lg p-md text-on-surface-variant transition-colors hover:bg-surface-container-highest" href="#">
          <Icon name="logout" className="shrink-0" />
          <span className="font-geist text-[11px] uppercase tracking-[0.05em] opacity-0 transition-opacity group-hover:opacity-100">
            Logout
          </span>
        </a>
      </div>
    </aside>
  );
}
