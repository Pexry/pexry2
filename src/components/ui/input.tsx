import * as React from "react"
import { cn } from "@/lib/utils"
import { Eye, EyeOff } from "lucide-react";

function Input({ className, type, value, onChange, ...props }: React.ComponentProps<"input">) {
  const [show, setShow] = React.useState(false);
  const isPassword = type === "password";
  const inputProps: React.ComponentProps<"input"> = {
    type: isPassword && !show ? "password" : "text",
    // @ts-ignore: data-slot is a custom attribute
    "data-slot": "input",
    className: cn(
      "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
      "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
      "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
      // Modified Classes
      "h-12 bg-white font-medium md:text-base",
      className
    ),
    ...props,
  };

  if (value !== undefined) {
    inputProps.value = value ?? "";
    inputProps.onChange = onChange;
  }

  return (
    <div className="relative">
      <input {...inputProps} />
      {isPassword && (
        <button
          type="button"
          tabIndex={-1}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          onClick={() => setShow((s) => !s)}
        >
          {show ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      )}
    </div>
  );
}

export { Input }
