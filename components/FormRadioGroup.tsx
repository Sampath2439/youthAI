
import React from 'react';

interface RadioOption {
  value: string;
  label: string;
}

interface FormRadioGroupProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  options: RadioOption[];
  disabled?: boolean;
}

const FormRadioGroup: React.FC<FormRadioGroupProps> = ({ label, name, value, onChange, options, disabled = false }) => {
  return (
    <fieldset disabled={disabled}>
      <legend className="mb-2 font-semibold text-sm text-slate-600 dark:text-slate-400">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <div key={option.value} className="flex-auto">
            <input
              type="radio"
              id={`${name}-${option.value}`}
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={onChange}
              className="sr-only"
              disabled={disabled}
            />
            <label
              htmlFor={`${name}-${option.value}`}
              className={`block w-full text-center text-sm px-3 py-2 border rounded-lg transition-all duration-200 ${
                value === option.value
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
              } ${disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
            >
              {option.label}
            </label>
          </div>
        ))}
      </div>
    </fieldset>
  );
};

export default FormRadioGroup;
