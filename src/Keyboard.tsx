import { useState, useRef, type RefObject } from "react";
import Keyboard from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";
import React from "react";

type ControlledKeyboardProps = {
  setInput: (input: string) => void;
};

export default function ControlledKeyboard({
  setInput,
}: ControlledKeyboardProps) {
  const [layoutName, setLayoutName] = useState("default");
  const [input, setLocalInput] = useState("");
  const keyboard: RefObject<any> = useRef(null);

  const onChange = (input: string) => {
    setLocalInput(input);
    setInput(input);
    console.log("Input changed", input);
  };

  const onKeyPress = (button: string) => {
    console.log("Button pressed", button);

    if (button === "{shift}" || button === "{lock}") handleShift();
  };

  const handleShift = () => {
    setLayoutName(layoutName === "default" ? "shift" : "default");
  };

  return (
    <Keyboard
      keyboardRef={(r) => (keyboard.current = r)}
      layoutName={layoutName}
      onChange={onChange}
      onKeyPress={onKeyPress}
      theme={"hg-theme-default darkTheme"}
    />
  );
}
