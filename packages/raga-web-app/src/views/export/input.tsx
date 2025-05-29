import { Badge, Button, Text } from "@mantine/core";
import { IoCheckmark } from "react-icons/io5";
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
      <Badge leftSection={<IoCheckmark />} color="green" variant="light" radius="sm">
        Loaded
      </Badge>
      <Text>{libraryInputFilepath}</Text>
      <Button onClick={setIsSelectingNewLibrary}>Select new library</Button>
    </>
  );
}
