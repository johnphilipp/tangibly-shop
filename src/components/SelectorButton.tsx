import Link from "next/link";
import React from "react";

interface SelectorButtonProps {
  href?: string;
  onClick?: (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => void | Promise<void>;
  className?: string;
  children: React.ReactNode;
  disabled?: boolean;
  type?: "button" | "submit" | "reset"; // Added type with its possible values
}

const SelectorButton: React.FC<SelectorButtonProps> = ({
  href,
  onClick,
  className,
  children,
  disabled,
  type = "button", // Default type is set to "button"
}) => {
  return href ? (
    <Link
      href={href}
      className={`rounded-md border px-2 py-2 font-semibold text-gray-900 no-underline transition sm:px-4 md:px-6 ${className}`}
    >
      {children}
    </Link>
  ) : (
    <button
      className={`rounded-md border px-1 py-1.5 font-semibold text-gray-900 no-underline transition sm:px-4 md:px-6 ${className}`}
      onClick={onClick}
      disabled={disabled}
      type={type} // Using the type property here
    >
      {children}
    </button>
  );
};

export default SelectorButton;
