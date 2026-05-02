import { Button, StatusPill } from "@adahiya/raga-design-system";
import { useBoolean } from "usehooks-ts";

import LoadLibraryForm from "../../components/library/loadLibraryForm";
import { appStore } from "../../store/appStore";

export function Input() {
  const libraryInputFilepath = appStore.use.libraryInputFilepath();
  const { value: isSelectingNewLibrary, setTrue: setIsSelectingNewLibrary } = useBoolean(false);

  if (isSelectingNewLibrary) {
    return <LoadLibraryForm />;
  }

  return (
    <>
      <StatusPill tone="success" label="Loaded" />
      <span>{libraryInputFilepath}</span>
      <Button onClick={setIsSelectingNewLibrary}>Select new library</Button>
    </>
  );
}
