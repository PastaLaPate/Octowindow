import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  DrawerPortal,
  DrawerTitle,
} from "../ui/drawer";

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
          <div className="flex-1 rounded-t-[10px] bg-white p-4">
            <div className="mx-auto max-w-md">
              <DrawerTitle className="mb-4 font-medium text-gray-900">
                Drawer for React.
              </DrawerTitle>
              <p className="mb-2 text-gray-600">
                This component can be used as a Dialog replacement on mobile and
                tablet devices. You can read about why and how it was built{" "}
                <a
                  target="_blank"
                  className="underline"
                  href="https://emilkowal.ski/ui/building-a-drawer-component"
                >
                  here
                </a>
                .
              </p>
              <p className="mb-2 text-gray-600">
                This one specifically is the most simplest setup you can have,
                just a simple drawer with a trigger.
              </p>
            </div>
          </div>
          <div className="mt-auto border-t border-gray-200 bg-gray-100 p-4">
            <div className="mx-auto flex max-w-md justify-end gap-6">
              <a
                className="flex items-center gap-0.25 text-xs text-gray-600"
                href="https://github.com/emilkowalski/vaul"
                target="_blank"
              >
                GitHub
                <svg
                  fill="none"
                  height="16"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  width="16"
                  aria-hidden="true"
                  className="ml-1 h-3 w-3"
                >
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"></path>
                  <path d="M15 3h6v6"></path>
                  <path d="M10 14L21 3"></path>
                </svg>
              </a>
              <a
                className="flex items-center gap-0.25 text-xs text-gray-600"
                href="https://twitter.com/emilkowalski_"
                target="_blank"
              >
                Twitter
                <svg
                  fill="none"
                  height="16"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  width="16"
                  aria-hidden="true"
                  className="ml-1 h-3 w-3"
                >
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"></path>
                  <path d="M15 3h6v6"></path>
                  <path d="M10 14L21 3"></path>
                </svg>
              </a>
            </div>
          </div>
        </DrawerContent>
      </DrawerPortal>
    </Drawer>
  );
}
