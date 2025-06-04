import { useState, useRef, type RefObject } from "react";
import Keyboard, { type KeyboardLayoutObject } from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";

type ControlledKeyboardProps = {
  setInput: (input: string) => void;
  input: string;
  validate?: (input: string) => void;
  close?: () => void;
};

const KeyboardLayouts: KeyboardLayoutObject = {
  default: [
    "` 1 2 3 4 5 6 7 8 9 0 - = {bksp}",
    "{tab} q w e r t y u i o p [ ] \\",
    "{lock} a s d f g h j k l ; ' {enter}",
    "{shift} z x c v b n m , . / {shift}",
    ".com @ {space} {close}",
  ],
  shift: [
    "~ ! @ # $ % ^ & * ( ) _ + {bksp}",
    "{tab} Q W E R T Y U I O P { } |",
    '{lock} A S D F G H J K L : " {enter}',
    "{shift} Z X C V B N M < > ? {shift}",
    ".com @ {space} {close}",
  ],
};

export default function ControlledKeyboard({
  setInput,
  input,
  validate = () => {},
  close = () => {},
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
    if (button === "{close}") {
      close();
    }
  };

  const handleShift = () => {
    setLayoutName(layoutName === "default" ? "shift" : "default");
  };

  return (
    <Keyboard
      keyboardRef={(r) => (keyboard.current = r)}
      layout={KeyboardLayouts}
      layoutName={layoutName}
      onKeyPress={onKeyPress}
      display={{
        "{bksp}": "backspace",
        "{tab}": "tab",
        "{lock}": "caps",
        "{shift}": "⇧",
        "{enter}": "⏎",
        "{space}": " ",
        "{close}": "✖",
      }}
      buttonTheme={[
        {
          class: "kbd-close-btn",
          buttons: "{close}",
        },
        {
          class: "kbd-space-btn",
          buttons: "{space}",
        },
      ]}
      theme={"hg-theme-default darkTheme"}
    />
  );
}
