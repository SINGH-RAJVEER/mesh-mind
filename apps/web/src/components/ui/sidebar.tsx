import { JSX, mergeProps, splitProps } from "solid-js";
import { cn } from "./utils";

export interface SidebarProps extends JSX.HTMLAttributes<HTMLElement> {
  collapsed?: boolean;
  onCollapse?: () => void;
}

export const Sidebar = (props: SidebarProps) => {
  const [, rest] = splitProps(props, [
    "class",
    "collapsed",
    "onCollapse",
    "children",
  ]);

  return (
    <aside
      class={cn(
        "h-full bg-card border-r flex flex-col transition-all duration-300 ease-in-out",
        props.collapsed ? "w-16" : "w-64",
        props.class,
      )}
      style={{
        "min-width": props.collapsed ? "4rem" : "16rem",
        "max-width": props.collapsed ? "4rem" : "16rem",
      }}
      {...rest}
    >
      <div class="flex items-center justify-between p-4 border-b">
        {!props.collapsed && <span class="font-bold text-lg">Chats</span>}
        <button
          onClick={props.onCollapse}
          class="ml-auto text-muted-foreground hover:text-foreground focus:outline-none"
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
              <path d="M15 6l-6 6 6 6" />
            </svg>
          )}
        </button>
      </div>
      <div
        class={cn(
          "flex-1 overflow-y-auto transition-opacity duration-200",
          props.collapsed ? "opacity-0 pointer-events-none" : "opacity-100",
        )}
      >
        {props.children}
      </div>
    </aside>
  );
};
