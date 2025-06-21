import React, {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { cn } from "@/lib/utils";
import ControlledKeyboard from "@/components/Keyboard";

type ControlledInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  numeric?: boolean;
  validate?: (
    value: string,
    setIsKeyboardVisible: (val: boolean) => void,
  ) => void;
  className?: string;
  inputClassName?: string;
  standAlonePlaceholder?: boolean;
};

const ControlledInput = forwardRef<HTMLInputElement, ControlledInputProps>(
  (
    {
      value,
      onChange,
      placeholder,
      label,
      numeric = false,
      validate,
      className = "",
      inputClassName = "",
      standAlonePlaceholder = false,
    },
    ref,
  ) => {
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Allow parent to use ref
    useEffect(() => {
      if (typeof ref === "function") {
        ref(inputRef.current);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLInputElement | null>).current =
          inputRef.current;
      }
    }, [ref]);

    // Focus input when keyboard opens
    useEffect(() => {
      if (isKeyboardVisible && inputRef.current) {
        inputRef.current.focus();
      }
    }, [isKeyboardVisible]);

    // Close keyboard if click is outside input and keyboard
    useEffect(() => {
      if (!isKeyboardVisible) return;
      const handlePointerDown = (e: PointerEvent) => {
        const input = inputRef.current;
        const keyboard = document.querySelector(".custom-keyboard-root");
        const path = e.composedPath ? e.composedPath() : [];
        if (
          input &&
          !path.includes(input) &&
          keyboard &&
          !path.includes(keyboard)
        ) {
          setIsKeyboardVisible(false);
        }
      };
      document.addEventListener("pointerdown", handlePointerDown);
      return () =>
        document.removeEventListener("pointerdown", handlePointerDown);
    }, [isKeyboardVisible]);

    const handleInputChange = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        onChange(event.target.value);
      },
      [onChange],
    );

    const handleInputFocus = () => {
      setIsKeyboardVisible(true);
    };

    const setKeyboardInput = (input: string) => {
      onChange(input);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    };

    return (
      <div className={`w-full ${className}`}>
        {label && (
          <label className="mb-2 block text-base font-bold text-white sm:mb-3 sm:text-lg">
            {label}
          </label>
        )}
        <input
          ref={inputRef}
          type={numeric ? "number" : "text"}
          inputMode={numeric ? "numeric" : "text"}
          className={cn(
            `w-full appearance-none rounded-lg border border-slate-600 bg-slate-900 px-3 py-3 text-base leading-tight text-white shadow focus:ring-2 focus:ring-blue-500 focus:outline-none sm:text-lg`,
            inputClassName,
          )}
          value={
            isKeyboardVisible || !standAlonePlaceholder ? value : placeholder
          }
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          autoComplete="off"
        />
        {isKeyboardVisible && (
          <ControlledKeyboard
            setInput={setKeyboardInput}
            input={value}
            close={() => {
              setKeyboardInput("");
              setIsKeyboardVisible(false);
            }}
            validate={(val) => {
              validate?.(val, setIsKeyboardVisible);
            }}
            numeric={numeric}
          />
        )}
      </div>
    );
  },
);

export default ControlledInput;
