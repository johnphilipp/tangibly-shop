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
      className={`rounded-md border px-2 py-2 font-semibold text-gray-900 no-underline transition hover:bg-gray-100 sm:px-4 md:px-6 ${className}`}
    >
      {children}
    </Link>
  ) : (
    <button
      className={`rounded-md border px-2 py-2 font-semibold text-gray-900 no-underline transition hover:bg-gray-100 sm:px-4 md:px-6 ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
