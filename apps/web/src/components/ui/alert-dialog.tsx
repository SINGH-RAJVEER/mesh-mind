import { type JSX, splitProps } from "solid-js";
import { cn } from "./utils";

const AlertDialog = (props: { children: JSX.Element }) => {
  return <>{props.children}</>;
};

const AlertDialogTrigger = (
  props: JSX.ButtonHTMLAttributes<HTMLButtonElement>,
) => {
  return <button {...props} />;
};

const AlertDialogPortal = (props: { children: JSX.Element }) => {
  return <>{props.children}</>;
};

const AlertDialogOverlay = (props: JSX.HTMLAttributes<HTMLDivElement>) => {
  const [split, rest] = splitProps(props, ["class"]);
  return (
    <div
      className={cn(
        "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        split.class,
      )}
      {...rest}
    />
  );
};

const AlertDialogContent = (
  props: JSX.HTMLAttributes<HTMLDivElement> & { children?: JSX.Element },
) => {
  const [split, rest] = splitProps(props, ["class", "children"]);
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <div
        className={cn(
          "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
          split.class,
        )}
        {...rest}
      >
        {split.children}
      </div>
    </AlertDialogPortal>
  );
};

const AlertDialogHeader = (props: JSX.HTMLAttributes<HTMLDivElement>) => {
  const [split, rest] = splitProps(props, ["class"]);
  return (
    <div
      className={cn(
        "flex flex-col space-y-2 text-center sm:text-left",
        split.class,
      )}
      {...rest}
    />
  );
};

const AlertDialogFooter = (props: JSX.HTMLAttributes<HTMLDivElement>) => {
  const [split, rest] = splitProps(props, ["class"]);
  return (
    <div
      className={cn(
        "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
        split.class,
      )}
      {...rest}
    />
  );
};

const AlertDialogTitle = (props: JSX.HTMLAttributes<HTMLHeadingElement>) => {
  const [split, rest] = splitProps(props, ["class"]);
  return <h2 className={cn("text-lg font-semibold", split.class)} {...rest} />;
};

const AlertDialogDescription = (
  props: JSX.HTMLAttributes<HTMLParagraphElement>,
) => {
  const [split, rest] = splitProps(props, ["class"]);
  return (
    <p className={cn("text-sm text-muted-foreground", split.class)} {...rest} />
  );
};

const AlertDialogAction = (
  props: JSX.ButtonHTMLAttributes<HTMLButtonElement>,
) => {
  return <button {...props} />;
};

const AlertDialogCancel = (
  props: JSX.ButtonHTMLAttributes<HTMLButtonElement>,
) => {
  return <button {...props} />;
};

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};
