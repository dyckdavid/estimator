import {
    type NodeOnDiskFile,
    unstable_composeUploadHandlers,
    unstable_createFileUploadHandler,
    unstable_createMemoryUploadHandler,
  } from "@remix-run/node";

  export const allowedMimeTypes = {
    csv: "text/csv",
  };

  export function isUploadedFile(file: unknown): file is NodeOnDiskFile {
    return (file as NodeOnDiskFile) != null;
  }

  export const csvUploadHandler = unstable_composeUploadHandlers(
    unstable_createFileUploadHandler({
      maxPartSize: 5_000_000,
      filter: ({ contentType }) =>
        Object.values(allowedMimeTypes).includes(contentType),
    }),
    unstable_createMemoryUploadHandler()
  );
