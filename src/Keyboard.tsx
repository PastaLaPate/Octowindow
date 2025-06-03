import { useState, useRef, type RefObject } from "react";
import Keyboard from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";
import React from "react";

type ControlledKeyboardProps = {
  setInput: (input: string) => void;
  input: string;
  validate?: (input: string) => void;
};

export default function ControlledKeyboard({
  setInput,
  input,
  validate = () => {},
}: ControlledKeyboardProps) {
  const [layoutName, setLayoutName] = useState("default");
  const keyboard: RefObject<any> = useRef(null);

  const onChange = (input: string) => {
    setInput(input);
    console.log("Input changed", input);
  };

  const onKeyPress = (button: string) => {
    if (!(button.startsWith("{") && button.endsWith("}"))) {
      setInput(input + button);
    }
    if (button === "{bksp}" && input.length > 0) {
      // Remove the last character from the input
      setInput(input.slice(0, -1));
    }
    if (button === "{enter}") {
      validate(input);
    }
    if (button === "{shift}" || button === "{lock}") handleShift();
  };

  const handleShift = () => {
    setLayoutName(layoutName === "default" ? "shift" : "default");
  };

  return (
    <Keyboard
      keyboardRef={(r) => (keyboard.current = r)}
      layoutName={layoutName}
      onKeyPress={onKeyPress}
      theme={"hg-theme-default darkTheme"}
    />
  );
}
