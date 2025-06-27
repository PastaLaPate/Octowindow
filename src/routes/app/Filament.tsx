import BackButton from "@/components/backButton";

export default function FilamentPage() {
  return (
    <div className="flex min-h-0 w-screen flex-1 items-center justify-center">
      <div className="flex h-5/6 min-h-0 w-11/12 flex-col items-start gap-8 rounded-2xl bg-slate-900 p-10">
        <BackButton title="Control" />
      </div>
    </div>
  );
}
