import { motion } from "framer-motion";
import { ArrowDown, ArrowUp } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router";

import type { Temp } from "@/lib/octoprint/apis/PrinterAPI";

import ControlledKeyboard from "@/Keyboard";
import type { OctoprintState } from "@/routes/app/Home";
import HeatedPlate from "../svg/HeatedPlate";
import Nozzle from "../svg/Nozzle";

function TempViewer({
  octoprintState,
  target,
}: {
  octoprintState: OctoprintState;
  target: "tool" | "bed";
}) {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [tempInput, setNumberInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [temp, setTemp] = useState<Temp | undefined>(undefined);
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

  useEffect(() => {
    setTemp(
      target === "tool" ? octoprintState.toolTemp : octoprintState.bedTemp,
    );
  }, [octoprintState]);

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setNumberInput(event.target.value);
    },
    [],
  );

  const handleInputFocus = () => {
    setIsKeyboardVisible(true);
  };

  useEffect(() => {
    if (isKeyboardVisible && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isKeyboardVisible]);

  const setKeyboardInput = (input: string) => {
    setNumberInput(input);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-slate-900 p-5 px-10">
      {target === "tool" ? (
        <Nozzle stroke={"#FFFFFF"} className="h-24 w-24" />
      ) : (
        <HeatedPlate stroke={"#FFFFFF"} className="h-24 w-24" />
      )}
      {temp && (
        <input
          title="Set target"
          ref={inputRef}
          type="number"
          id="temp"
          autoComplete="off"
          className="w-20 text-center text-2xl"
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          value={isKeyboardVisible ? tempInput : Math.round(temp.current)}
        />
      )}
      <p className="text-2xl text-slate-500">
        {temp && (temp.target !== 0 ? `${temp.target}` : "")}
      </p>
      {isKeyboardVisible && (
        <motion.div
          className="keyboard-wrapper"
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            width: "100%",
            zIndex: 50,
            background: "#1f2937",
            borderTopLeftRadius: "1.5rem",
            borderTopRightRadius: "1.5rem",
            padding: "1rem 0.5rem .5rem 0.5rem",
            boxShadow: "0 -4px 24px rgba(0,0,0,0.3)",
          }}
        >
          {temp && (
            <ControlledKeyboard
              setInput={setKeyboardInput}
              input={tempInput}
              close={() => setIsKeyboardVisible(false)}
              validate={(input) => {
                setIsKeyboardVisible(false);
                console.log(temp);
                temp.setTemp(Math.round(Number(tempInput)));
              }}
              numeric={true}
            />
          )}
        </motion.div>
      )}
    </div>
  );
}

export default function PrintStatus() {
  const octoprintState: OctoprintState = useOutletContext();
  return (
    <div className="flex h-full w-[50vw] items-center justify-center gap-5">
      <TempViewer octoprintState={octoprintState} target="tool" />
      <TempViewer octoprintState={octoprintState} target="bed" />
    </div>
  );
}
