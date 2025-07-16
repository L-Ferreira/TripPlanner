import { ChangeEvent } from 'react';

interface CheckboxProps {
  id?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

const Checkbox = ({ id, checked = false, onCheckedChange, disabled = false, className = '' }: CheckboxProps) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onCheckedChange?.(e.target.checked);
  };

  return (
    <input
      id={id}
      type="checkbox"
      checked={checked}
      onChange={handleChange}
      disabled={disabled}
      className={`h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${className}`}
    />
  );
};

export { Checkbox };
