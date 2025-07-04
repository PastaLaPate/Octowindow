import { t } from "i18next";

import type { Print } from "@/lib/octoprint/apis/FileAPI";

import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "../ui/dialog";

export default function ThumbnailPreviewer({
  file,
  open,
  setOpen,
}: {
  file: Print;
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="flex flex-col items-center justify-center gap-2">
        <DialogTitle>
          {t("file.thumbnail_name", {
            file_name: file.display,
          })}
        </DialogTitle>
        <div className="p-6">
          <img
            src={file.thumbnail}
            className="aspect-square h-full max-h-[55vh] w-full max-w-[60vw]"
          />
        </div>
        <DialogFooter>
          <Button variant={"destructive"} onClick={() => setOpen(false)}>
            {t("general.close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
