import { JSX, mergeProps, splitProps } from "solid-js";
import { cn } from "./utils";

export interface CardProps extends JSX.HTMLAttributes<HTMLDivElement> {
  class?: string;
}

export const Card = (props: CardProps) => {
  const [, rest] = splitProps(props, ["class"]);
  const merged = mergeProps(rest, {
    class: cn(
      "rounded-xl border bg-card text-card-foreground shadow",
      props.class,
    ),
  });

  return <div {...merged} />;
};

export const CardHeader = (props: CardProps) => {
  const [, rest] = splitProps(props, ["class"]);
  const merged = mergeProps(rest, {
    class: cn("flex flex-col space-y-1.5 p-6", props.class),
  });

  return <div {...merged} />;
};

export const CardTitle = (props: CardProps) => {
  const [, rest] = splitProps(props, ["class"]);
  const merged = mergeProps(rest, {
    class: cn("font-semibold leading-none tracking-tight", props.class),
  });

  return <div {...merged} />;
};

export const CardDescription = (props: CardProps) => {
  const [, rest] = splitProps(props, ["class"]);
  const merged = mergeProps(rest, {
    class: cn("text-sm text-muted-foreground", props.class),
  });

  return <div {...merged} />;
};

export const CardContent = (props: CardProps) => {
  const [, rest] = splitProps(props, ["class"]);
  const merged = mergeProps(rest, {
    class: cn("p-6 pt-0", props.class),
  });

  return <div {...merged} />;
};

export const CardFooter = (props: CardProps) => {
  const [, rest] = splitProps(props, ["class"]);
  const merged = mergeProps(rest, {
    class: cn("flex items-center p-6 pt-0", props.class),
  });

  return <div {...merged} />;
};
