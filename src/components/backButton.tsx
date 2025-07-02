import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

export default function BackButton({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  const navigate = useNavigate();
  return (
    <div className="relative flex w-full flex-row items-center justify-center gap-4">
      <div className="absolute left-1 flex items-center justify-center gap-3">
        <div className="flex cursor-pointer items-center justify-center rounded-full bg-slate-800 transition hover:bg-slate-700 md:size-10 lg:size-14">
          <ArrowLeft
            className="md:size-7 lg:size-10"
            onClick={() => {
              navigate(-1);
            }}
          />
        </div>
        <p className="md:text-xl lg:text-2xl">Back</p>
      </div>
      <p className="font-bold md:text-2xl lg:text-4xl">{title}</p>
      {children}
    </div>
  );
}
