import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";

import type { OctoprintState } from "./App";

export default function JobPage() {
  const octoprintState: OctoprintState = useOutletContext();

  const [percent, setPercent] = useState(0);
  const elapsed = "00:42:15";
  const timeLeft = "01:17:45";
  const estimatedFinish = "15:30";
  const filamentUsed = "5.2g / 1.7m";
  const thumbnail =
    "https://images.cults3d.com/HdTHHlECkxM5ANNhheoivtg90to=/516x516/filters:no_upscale()/https://fbi.cults3d.com/uploaders/133/illustration-file/1428782343-8151-3672/_4___3DBenchy__Default_view.png";

  const nozzleTemp = octoprintState.toolTemp.current;
  const nozzleTarget = octoprintState.toolTemp.target;
  const bedTemp = octoprintState.bedTemp.current;
  const bedTarget = octoprintState.bedTemp.target;

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (circumference * percent) / 100;
  useEffect(() => {
    const inter = setInterval(() => {
      setPercent((prev) => (prev + Math.round(Math.random() * 10)) % 100);
    }, 1000);
    return () => clearInterval(inter);
  }, []);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-slate-950 p-4">
      <div className="flex w-full max-w-4xl flex-col items-center justify-center gap-y-8 md:flex-row md:items-start md:gap-8">
        {/* Progress + Thumbnail Panel */}
        <div className="flex w-full max-w-sm flex-col items-center">
          <div className="relative flex h-48 w-48 items-center justify-center">
            <svg
              className="absolute top-0 left-0 h-full w-full"
              viewBox="0 0 100 100"
              style={{
                transform: "rotate(-90deg)",
                transition: "stroke-dashoffset 0.35s",
              }}
            >
              <circle
                className="stroke-current text-gray-700"
                strokeWidth="10"
                cx="50"
                cy="50"
                r={radius}
                fill="transparent"
              />
              <circle
                className="stroke-current text-green-500"
                strokeWidth="10"
                strokeLinecap="round"
                cx="50"
                cy="50"
                r={radius}
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                style={{ transition: "stroke-dashoffset 0.5s" }}
              />
            </svg>
            <svg
              viewBox="0 0 100 100"
              className="absolute z-10 size-[136px] rounded-full"
              preserveAspectRatio="xMidYMid slice"
            >
              <defs>
                <clipPath id="circleClip">
                  <circle cx="50" cy="50" r="50" />
                </clipPath>
              </defs>

              <image
                href={thumbnail}
                x="0"
                y="0"
                width="100"
                height="100"
                clipPath="url(#circleClip)"
              />
              <rect
                x="0"
                y={(100 * (100 - percent)) / 100}
                width="100"
                height={(100 * percent) / 100}
                fill="rgba(0,0,0,0.5)"
                clipPath="url(#circleClip)"
              >
                <animate attributeName="y" to={0} dur="0.3s" fill="freeze" />
                <animate
                  attributeName="height"
                  to={100 - percent}
                  dur="0.3s"
                  fill="freeze"
                />
              </rect>
            </svg>
          </div>
          <div className="mt-4 flex flex-col items-center gap-1 text-center">
            <span className="text-3xl font-bold text-white">{percent}%</span>
            <span className="text-base font-semibold text-blue-300">
              Time left: {timeLeft}
            </span>
            <span className="text-base font-semibold text-blue-300">
              Finish at: {estimatedFinish}
            </span>
            <span className="text-base font-semibold text-blue-300">
              Elapsed: {elapsed}
            </span>
            <span className="text-base font-semibold text-blue-300">
              Filament: {filamentUsed}
            </span>
          </div>
        </div>
        {/* Temps Panel */}
        <div className="flex w-full max-w-sm flex-col items-center justify-center gap-6 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-6 shadow-lg">
          <div className="flex flex-col items-center">
            <span className="text-lg font-bold text-blue-400">Nozzle</span>
            <span className="font-mono text-2xl text-white">
              {Math.round(nozzleTemp)}
              {nozzleTarget ? (
                <span className="text-blue-300">
                  /{Math.round(nozzleTarget)}
                </span>
              ) : null}
              °C
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-lg font-bold text-yellow-400">Bed</span>
            <span className="font-mono text-2xl text-white">
              {Math.round(bedTemp)}
              {bedTarget ? (
                <span className="text-yellow-300">
                  /{Math.round(bedTarget)}
                </span>
              ) : null}
              °C
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
