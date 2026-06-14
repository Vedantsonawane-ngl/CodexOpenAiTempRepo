import { Outlet, useLocation } from "react-router-dom";
import StatusFooter from "./StatusFooter.jsx";
import Sidebar from "./Sidebar.jsx";
import TopHeader from "./TopHeader.jsx";

const pageTitles = [
  ["/dashboard", "Security Overview"],
  ["/alerts", "Alert Inbox"],
  ["/investigations/new", "Load Investigation Data"],
  ["/investigations/", "Investigation Results"],
  ["/entities", "Entity Explorer"],
  ["/approvals", "Human Approval Queue"],
  ["/reports", "Incident Reports"]
];

function getTitle(pathname) {
  const match = pageTitles.find(([path]) => pathname === path || pathname.startsWith(path));
  return match ? match[1] : "intelliSOC Operations";
}

export default function AppShell() {
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-background text-on-surface">
      <Sidebar />
      <main className="ml-20 flex min-h-screen flex-1 flex-col transition-all duration-300">
        <TopHeader title={getTitle(location.pathname)} />
        <div className="mx-auto w-full max-w-7xl flex-1 space-y-xl p-lg page-enter">
          <Outlet />
        </div>
        <StatusFooter />
      </main>
    </div>
  );
}
