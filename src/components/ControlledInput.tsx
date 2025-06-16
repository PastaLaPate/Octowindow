import { motion } from "framer-motion";
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { cn } from "@/lib/utils";

import ControlledKeyboard from "@/Keyboard";

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
      const handleClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const input = inputRef.current;
        const keyboard = document.querySelector(".keyboard-wrapper");
        if (
          input &&
          !input.contains(target) &&
          keyboard &&
          !keyboard.contains(target)
        ) {
          setIsKeyboardVisible(false);
        }
      };
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
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
          <motion.div
            className="keyboard-wrapper w-screen"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            style={{
              position: "fixed",
              bottom: 0,
              left: 0,
              zIndex: 50,
              background: "#1f2937",
              borderTopLeftRadius: "1.5rem",
              borderTopRightRadius: "1.5rem",
              padding: "1rem 0.5rem .5rem 0.5rem",
              boxShadow: "0 -4px 24px rgba(0,0,0,0.3)",
            }}
          >
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
          </motion.div>
        )}
      </div>
    );
  },
);

export default ControlledInput;
