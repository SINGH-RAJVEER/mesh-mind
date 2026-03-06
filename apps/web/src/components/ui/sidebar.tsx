import { type JSX, Show } from "solid-js";
import { cn } from "./utils";

export interface SidebarProps extends JSX.HTMLAttributes<HTMLElement> {
  collapsed?: boolean;
  onCollapse?: () => void;
}

export const Sidebar = (props: SidebarProps) => {
  return (
    <aside
      className={cn(
        "h-full bg-card border-r flex flex-col transition-all duration-300 ease-in-out",
        props.collapsed ? "w-16" : "w-64",
        props.class,
      )}
      style={{
        minWidth: props.collapsed ? "4rem" : "16rem",
        maxWidth: props.collapsed ? "4rem" : "16rem",
      }}
    >
      <div className="flex items-center justify-between p-4 border-b">
        <Show when={!props.collapsed}>
          <span className="font-bold text-lg">Chats</span>
        </Show>
        <button
          type="button"
          onClick={props.onCollapse}
          className="ml-auto text-muted-foreground hover:text-foreground focus:outline-none"
          aria-label={props.collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {props.collapsed ? (
            <svg
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <title>Expand sidebar</title>
              <path d="M9 18l6-6-6-6" />
            </svg>
          ) : (
            <svg
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <title>Collapse sidebar</title>
              <path d="M15 6l-6 6 6 6" />
            </svg>
          )}
        </button>
      </div>
      <div
        className={cn(
          "flex-1 overflow-y-auto transition-opacity duration-200",
          props.collapsed ? "opacity-0 pointer-events-none" : "opacity-100",
        )}
      >
        {props.children}
      </div>
    </aside>
  );
};
