import ActionBox from "./ActionBox";

export default function Actions() {
  return (
    <div className="h-full w-[50vw] m-10">
      <div className="grid grid-cols-2 gap-4 w-full h-full items-center justify-items-center">
        <ActionBox />
        <ActionBox />
        <ActionBox />
        <ActionBox />
        <ActionBox className="col-span-2" />
      </div>
    </div>
  );
}
