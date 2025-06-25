import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

export default function BackButton({ title, children }: { title: string; children?: ReactNode }) {
  const navigate = useNavigate();
  return (
    <div className="relative flex w-full flex-row items-center justify-center gap-4">
      <div className="absolute left-1 flex items-center justify-center gap-3">
        <div className="flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-slate-800 transition hover:bg-slate-700">
          <ArrowLeft
            className="h-10 w-10"
            onClick={() => {
              navigate(-1);
            }}
          />
        </div>
        <p className="text-2xl">Back</p>
      </div>
      <p className="text-4xl font-bold">{title}</p>
      {children}
    </div>
  );
}
