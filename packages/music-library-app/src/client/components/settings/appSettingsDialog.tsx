import { Button, Classes, Dialog, DialogBody } from "@blueprintjs/core";
import { useBoolean } from "usehooks-ts";

import { AnalyzerSettings } from "./analyzerSettings";

export default function AppSettingsDialog() {
    const { value: isOpen, setTrue: openDialog, setFalse: closeDialog } = useBoolean(false);

    return (
        <>
            <Button small={true} minimal={true} icon="cog" text="Settings" onClick={openDialog} />
            <Dialog
                className={Classes.DARK}
                isOpen={isOpen}
                onClose={closeDialog}
                title="Music Library App Settings"
                icon="cog"
            >
                <DialogBody>
                    <AnalyzerSettings />
                </DialogBody>
            </Dialog>
        </>
    );
}
