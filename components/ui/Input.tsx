"use client";

import {
  InputHTMLAttributes,
  forwardRef,
} from "react";

interface InputProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", id, ...props }, ref) => {
    return (
      <div className="w-full space-y-2">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-gray-300"
          >
            {label}
          </label>
        )}

        <input
          ref={ref}
          id={id}
          {...props}
          className={`w-full rounded-xl border bg-gray-800 px-4 py-3 text-white outline-none transition placeholder:text-gray-500 focus:ring-2 ${
            error
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-700 focus:border-blue-500 focus:ring-blue-600"
          } ${className}`}
        />

        {error && (
          <p className="text-sm text-red-400">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
