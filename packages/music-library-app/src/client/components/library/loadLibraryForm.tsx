import { FileInput, FormGroup } from "@blueprintjs/core";
import { useCallback } from "react";

import { appStore } from "../../store/appStore";

const XML_INPUT_PROPS = {
    accept: ".xml",
};

export default function LoadLibraryForm() {
    const setLibraryInputFilepath = appStore.use.setLibraryInputFilepath();
    const handleChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            if (event.target.files?.length) {
                setLibraryInputFilepath(event.target.files[0].path);
            }
        },
        [setLibraryInputFilepath],
    );

    return (
        <FormGroup>
            <FileInput
                text="Input library XML"
                fill={true}
                onInputChange={handleChange}
                inputProps={XML_INPUT_PROPS}
            />
        </FormGroup>
    );
}
