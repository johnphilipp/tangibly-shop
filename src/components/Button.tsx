// src/components/Button.tsx

import Link from "next/link";
import React from "react";

interface ButtonProps {
  href?: string;
  onClick?: (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => void | Promise<void>;
  className?: string;
  children: React.ReactNode;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  href,
  onClick,
  className,
  children,
  disabled,
}) => {
  return href ? (
    <Link
      href={href}
      className={`rounded-full bg-black/10 px-4 py-3 font-semibold no-underline transition hover:bg-black/20 sm:px-10 ${className}`}
    >
      {children}
    </Link>
  ) : (
    <button
      className={`rounded-md border px-4 py-2 font-semibold text-gray-900 no-underline transition hover:bg-gray-100 sm:px-10 ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
