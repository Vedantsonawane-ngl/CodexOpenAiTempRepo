import Icon from "./Icon.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function TopHeader({ title }) {
  const { user } = useAuth();
  const initials = user?.username ? user.username.slice(0, 2).toUpperCase() : "OP";
  const displayName = user?.username ? user.username : "Operator";
  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-outline-variant bg-surface-dim px-margin">
      <div className="flex flex-1 items-center gap-lg">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-primary">{title}</h2>
          <p className="hidden font-geist text-[10px] uppercase tracking-[0.08em] text-on-surface-variant md:block">
            intelliSOC / Operations
          </p>
        </div>
        <label className="hidden w-96 items-center rounded-lg border border-outline-variant/30 bg-surface-container-high px-md py-xs md:flex">
          <Icon name="search" className="mr-sm text-[20px] text-on-surface-variant" />
          <input
            className="w-full border-none bg-transparent text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:ring-0"
            placeholder="Search alerts, entities, logs..."
            type="text"
          />
          <span className="font-geist text-[10px] uppercase text-on-surface-variant">Ctrl K</span>
        </label>
      </div>

      <div className="flex items-center gap-md">
        {["notifications", "settings", "help"].map((icon) => (
          <button key={icon} className="rounded-full p-sm text-on-surface-variant transition-colors hover:bg-surface-container-high" type="button">
            <Icon name={icon} />
          </button>
        ))}
        <div className="mx-xs h-6 w-px bg-outline-variant" />
        <button className="flex items-center gap-sm rounded-full p-xs pr-md transition-colors hover:bg-surface-container-high" type="button">
          <div className="grid h-8 w-8 place-items-center rounded-full border border-primary/20 bg-secondary-container/30 font-geist text-[11px] font-black text-primary">
            {initials}
          </div>
          <span className="font-geist text-[11px] uppercase text-on-surface">{displayName}</span>
        </button>
      </div>
    </header>
  );
}
