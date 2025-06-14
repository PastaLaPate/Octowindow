import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerPortal,
  DrawerTitle,
} from "../ui/drawer";

function TempPreset({
  name,
  bedTemp,
  toolTemp,
  onSelected = () => {},
}: {
  name: string;
  bedTemp: number;
  toolTemp: number;
  onSelected?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl bg-slate-900 p-4">
      <p>{name}</p>
      <p>{bedTemp}</p>
      <p>{toolTemp}</p>
    </div>
  );
}

export default function PreHeat({
  opened,
  setOpened,
}: {
  opened: boolean;
  setOpened: (x: boolean) => void;
}) {
  return (
    <Drawer open={opened} onClose={() => setOpened(false)}>
      <DrawerPortal>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="text-2xl">
              Select a temp preset or create one.
            </DrawerTitle>
          </DrawerHeader>
          <div className="flex w-max items-center justify-center overflow-x-auto">
            <TempPreset name="PLA" bedTemp={60} toolTemp={200} />
          </div>
        </DrawerContent>
      </DrawerPortal>
    </Drawer>
  );
}
