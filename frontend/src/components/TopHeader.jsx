import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Icon from "./Icon.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useNotifications } from "../context/NotificationContext.jsx";

export default function TopHeader({ title }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchValue, setSearchValue] = useState(searchParams.get("query") || "");
  const inputRef = useRef(null);
  
  const { notifications, markAllAsRead, clearNotifications } = useNotifications();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const initials = user?.username ? user.username.slice(0, 2).toUpperCase() : "OP";
  const displayName = user?.username ? user.username : "Operator";

  // Keep search input in sync with URL parameter if it changes elsewhere
  useEffect(() => {
    setSearchValue(searchParams.get("query") || "");
  }, [searchParams]);

  // Handle Ctrl+K shortcut to focus search input
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate(`/alerts?query=${encodeURIComponent(searchValue.trim())}`);
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-outline-variant bg-surface-dim px-margin">
      <div className="flex flex-1 items-center gap-lg">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-primary">{title}</h2>
          <p className="hidden font-geist text-[10px] uppercase tracking-[0.08em] text-on-surface-variant md:block">
            intelliSOC / Operations
          </p>
        </div>
        <form onSubmit={handleSearchSubmit} className="hidden w-96 items-center rounded-lg border border-outline-variant/30 bg-surface-container-high px-md py-xs md:flex">
          <Icon name="search" className="mr-sm text-[20px] text-on-surface-variant" />
          <input
            ref={inputRef}
            className="w-full border-none bg-transparent text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:ring-0 focus:outline-none"
            placeholder="Search alerts, entities, logs..."
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
          <span className="font-geist text-[10px] uppercase text-on-surface-variant">Ctrl K</span>
        </form>
      </div>

      <div className="flex items-center gap-md">
        {/* Notifications Icon Button with Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="relative rounded-full p-sm text-on-surface-variant transition-colors hover:bg-surface-container-high"
            type="button"
          >
            <Icon name="notifications" />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-error text-[9px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-xs w-80 rounded-xl card-glass border border-outline-variant/30 bg-[#0a0a0b] p-md shadow-soft-purple z-50">
              <div className="mb-sm flex items-center justify-between border-b border-outline-variant/30 pb-xs">
                <span className="font-geist text-xs font-bold text-primary">Notifications</span>
                <div className="flex gap-sm">
                  <button
                    onClick={() => {
                      markAllAsRead();
                      setDropdownOpen(false);
                    }}
                    className="font-geist text-[10px] text-on-surface-variant hover:text-primary"
                  >
                    Mark read
                  </button>
                  <button
                    onClick={() => {
                      clearNotifications();
                      setDropdownOpen(false);
                    }}
                    className="font-geist text-[10px] text-on-surface-variant hover:text-error"
                  >
                    Clear
                  </button>
                </div>
              </div>
              <div className="max-h-60 overflow-y-auto space-y-sm custom-scrollbar">
                {notifications.length === 0 ? (
                  <p className="py-md text-center text-xs text-on-surface-variant">No notifications</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`flex flex-col rounded-lg p-sm text-xs border ${
                        n.read ? "border-transparent text-on-surface-variant" : "border-primary/20 bg-primary/5 text-on-surface"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            n.type === "success" ? "bg-success" : n.type === "warning" ? "bg-warning" : "bg-primary"
                          }`}
                        />
                        <span className="text-[9px] text-on-surface-variant/50">{n.time}</span>
                      </div>
                      <p className="mt-xs font-medium">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {["settings", "help"].map((icon) => (
          <button key={icon} className="rounded-full p-sm text-on-surface-variant transition-colors hover:bg-surface-container-high" type="button">
            <Icon name={icon} />
          </button>
        ))}
        <div className="mx-xs h-6 w-px bg-outline-variant" />
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-sm rounded-full p-xs pr-md transition-colors hover:bg-surface-container-high"
            type="button"
          >
            <div className="grid h-8 w-8 place-items-center rounded-full border border-primary/20 bg-secondary-container/30 font-geist text-[11px] font-black text-primary">
              {initials}
            </div>
            <span className="font-geist text-[11px] uppercase text-on-surface">{displayName}</span>
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-xs w-64 rounded-xl card-glass border border-outline-variant/30 bg-[#000000] p-md shadow-soft-purple z-50">
              <div className="mb-sm border-b border-outline-variant/30 pb-xs flex items-center justify-between">
                <span className="font-geist text-xs font-bold text-primary">Operator Profile</span>
                <button
                  onClick={() => setProfileOpen(false)}
                  className="text-on-surface-variant hover:text-primary text-[10px]"
                >
                  Close
                </button>
              </div>
              <div className="space-y-sm text-xs font-mono">
                <div>
                  <span className="text-[10px] text-on-surface-variant uppercase tracking-wider block">Username</span>
                  <span className="font-semibold text-primary">{user?.username || "Operator"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-on-surface-variant uppercase tracking-wider block">Email Address</span>
                  <span className="font-semibold text-primary break-all">{user?.email || "operator@intellisoc.local"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-on-surface-variant uppercase tracking-wider block">System Access</span>
                  <span className="font-semibold text-primary">AUTHORIZED OPERATOR</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
