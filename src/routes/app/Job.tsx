import { t } from "i18next";
import { CirclePause, CirclePlay, CircleStop, Fan } from "lucide-react";
import { DateTime, Duration } from "luxon";
import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { toast } from "sonner";

import type { FilesInformation } from "@/lib/octoprint/apis/FileAPI";
import { cn } from "@/lib/utils";
import ActionBox from "@/components/home/ActionBox";
import { TempViewer } from "@/components/home/PrinterStatus";

import type { OctoprintState } from "./App";

function FanViewer({ octoprintState }: { octoprintState: OctoprintState }) {
  return (
    <div
      className={cn(
        "relative flex min-w-0 flex-1 flex-col items-center justify-between gap-2 rounded-2xl border-2 border-transparent bg-gradient-to-br from-slate-800 to-slate-900 p-2 !px-0 shadow-lg transition hover:border-blue-500 active:scale-100 sm:gap-3 sm:p-2 md:h-46 md:w-34 md:p-5 lg:h-60 lg:w-60"
      )}
      style={{
        minWidth: 0,
      }} // Responsive width
    >
      <div
        className={cn(
          "flex h-14 w-14 items-center justify-center md:h-10 md:w-10"
        )}
      >
        <Fan className="h-full w-full" color="#C5C5FF" />
      </div>
      <div className="flex flex-col items-center justify-center gap-2">
        <label className="mb-2 block p-0 text-base font-bold text-white sm:mb-1 sm:text-lg md:mb-1">
          Fan
        </label>
        <p className="w-25 px-3 py-3 text-center font-bold text-blue-100 md:w-20 md:text-lg lg:text-2xl xl:w-30 2xl:w-30">
          {octoprintState.layerProgress?.fanspeed ?? 250}
        </p>
      </div>
      <div
        className={cn(
          "absolute bottom-0 h-2 w-full rounded-b-2xl",
          "bg-blue-300"
        )}
      />
    </div>
  );
}

export default function JobPage() {
  const octoprintState: OctoprintState = useOutletContext();
  const navigate = useNavigate();
  const [thumbnail, setThumbnail] = useState(
    "https://images.cults3d.com/HdTHHlECkxM5ANNhheoivtg90to=/516x516/filters:no_upscale()/https://fbi.cults3d.com/uploaders/133/illustration-file/1428782343-8151-3672/_4___3DBenchy__Default_view.png"
  );
  const dummy = false;

  const elapsed = !dummy
    ? Duration.fromObject({
        seconds: octoprintState.progress?.printTime,
      }).toFormat("hh:mm:ss")
    : "00:42:15";
  const timeLeft = !dummy
    ? Duration.fromObject({
        seconds: octoprintState.progress?.printTimeLeft,
      }).toFormat("hh:mm:ss")
    : "01:13:32";
  const estimatedFinish = !dummy
    ? DateTime.local()
        .plus({ seconds: octoprintState.progress?.printTimeLeft })
        .toFormat("HH:mm")
    : "15:30";
  const filamentUsed = !dummy
    ? `${octoprintState.job?.filament.length ?? 0 / 1000}m`
    : "1.7m";
  const percent = Math.round(
    ((octoprintState.progress?.printTime ?? 0) /
      ((octoprintState.progress?.printTime ?? 0) +
        (octoprintState.progress?.printTimeLeft ?? 0))) *
      100
  );

  const nozzleTemp = octoprintState.toolTemp.current;
  const nozzleTarget = octoprintState.toolTemp.target;
  const bedTemp = octoprintState.bedTemp.current;
  const bedTarget = octoprintState.bedTemp.target;

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (circumference * percent) / 100;
  useEffect(() => {
    if (!octoprintState.node) {
      return;
    }

    if (
      octoprintState.connectionInfos &&
      octoprintState.connectionInfos.flags.operational &&
      !octoprintState.connectionInfos.flags.printing &&
      !dummy
    ) {
      navigate("/app/", {
        replace: true,
      });
    }

    if (
      octoprintState.job &&
      thumbnail ===
        "https://images.cults3d.com/HdTHHlECkxM5ANNhheoivtg90to=/516x516/filters:no_upscale()/https://fbi.cults3d.com/uploaders/133/illustration-file/1428782343-8151-3672/_4___3DBenchy__Default_view.png"
    ) {
      const file: FilesInformation = octoprintState.job.file;
      octoprintState.node.file
        .getFileThumbnail({
          display: file.display,
          name: file.name,
          origin: file.origin,
          path: file.path,
          size: "",
        })
        .then((thumb) => setThumbnail(thumb));
    }
  }, [octoprintState.connectionInfos, octoprintState.job?.file]);

  return (
    octoprintState.node !== undefined && (
      <div className="flex flex-row items-center justify-center">
        {/* Progress + Thumbnail Panel */}
        <div className="flex w-[50vw] flex-col items-center">
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
                y={0}
                width="100"
                height={100 - percent}
                fill="rgba(0,0,0,0.5)"
                clipPath="url(#circleClip)"
                style={{
                  transition: "height 0.3s cubic-bezier(0.4,0,0.2,1)",
                }}
              />
            </svg>
          </div>
          <div className="mt-4 flex flex-col items-center gap-1 text-center">
            <span className="text-3xl font-bold text-white">
              {percent}% - {octoprintState.layerProgress?.currentLayer}/
              {octoprintState.layerProgress?.totalLayer} Layers
            </span>
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
        <div className="flex w-[50vw] flex-col items-center justify-center gap-6 rounded-2xl p-5 shadow-lg">
          <div className="flex w-full flex-row items-center justify-center gap-3">
            <TempViewer
              octoprintState={octoprintState}
              target="bed"
              className="md:h-46 md:w-34 lg:h-60 lg:w-60"
              inputClassName={
                "w-25 md:w-20 xl:w-30 2xl:w-30 md:text-lg lg:text-2xl"
              }
              iconClassName={"md:w-10 md:h-10"}
            />
            <TempViewer
              octoprintState={octoprintState}
              target="tool"
              className="md:h-46 md:w-34 lg:h-60 lg:w-60"
              inputClassName={
                "w-25 md:w-20 xl:w-30 2xl:w-30 md:text-lg lg:text-2xl"
              }
              iconClassName={"md:w-10 md:h-10"}
            />
            <FanViewer octoprintState={octoprintState} />
          </div>
          <div className="flex w-full flex-row items-center justify-center gap-3">
            <ActionBox
              color="bg-red-500"
              icon={CircleStop}
              label="Stop"
              onClick={() => {
                octoprintState.node;
                octoprintState.node?.job
                  .cancelJob()
                  .then(() => {
                    toast.success(t("infos.job.stopped"));
                  })
                  .catch((e) => {
                    if (e instanceof Error) {
                      toast.error(e.message);
                    }
                  });
              }}
            />
            {!octoprintState.connectionInfos.flags.paused ? (
              <ActionBox
                color={"bg-yellow-500"}
                icon={CirclePause}
                label="Pause"
                onClick={() => {
                  octoprintState.node?.job
                    .pauseJob()
                    .then(() => {
                      toast.success(t("infos.job.pause"));
                    })
                    .catch((e) => {
                      if (e instanceof Error) {
                        toast.error(e.message);
                      }
                    });
                }}
              />
            ) : (
              <ActionBox
                color={"bg-green-500"}
                icon={CirclePlay}
                label="Resume"
                onClick={() => {
                  octoprintState.node?.job
                    .resumeJob()
                    .then(() => {
                      toast.success(t("infos.job.resume"));
                    })
                    .catch((e) => {
                      if (e instanceof Error) {
                        toast.error(e.message);
                      }
                    });
                }}
              />
            )}
          </div>
        </div>
      </div>
    )
  );
}
