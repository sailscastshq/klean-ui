import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import FileUpload from "../../registry/file-upload/react/FileUpload.jsx";

function formatSize(size) {
  if (size < 1024) return `${size} B`;
  return `${(size / 1024).toFixed(1)} KB`;
}

function Example({ accept, disabled, maxKb }) {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");

  return (
    <FileUpload
      value={file}
      onChange={(candidate) => {
        setFile(candidate);
        setError("");
      }}
      onReject={(detail) => setError(detail.message)}
      accept={accept}
      disabled={disabled}
      validate={(candidate) =>
        candidate.size <= maxKb * 1024
          ? true
          : `Choose a file under ${maxKb} KB.`
      }
      className="w-[min(38rem,calc(100vw-2rem))]"
    >
      {(upload) => (
        <>
          <div
            {...upload.dropzone}
            className={`rounded-2xl border border-dashed bg-white p-8 text-center shadow-sm transition-colors duration-150 dark:bg-gray-950 motion-reduce:transition-none ${
              upload.dragging
                ? "border-gray-950 bg-gray-50 dark:border-white dark:bg-gray-900"
                : "border-gray-300 dark:border-gray-700"
            } ${disabled ? "opacity-50" : ""}`}
          >
            <div className="mx-auto grid size-12 place-items-center rounded-xl bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-200">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="size-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M5 15v3.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V15" />
              </svg>
            </div>
            <h2 className="mt-5 text-lg font-semibold tracking-tight">
              {upload.file ? "Ready to upload" : "Add a file"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
              Drop one file here, or use the native picker.
            </p>
            <button
              type="button"
              disabled={disabled}
              className="mt-5 inline-flex min-h-11 cursor-pointer items-center justify-center rounded-lg bg-gray-950 px-4 text-sm font-medium text-white outline-none hover:bg-gray-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-950 disabled:cursor-not-allowed dark:bg-white dark:text-gray-950 dark:hover:bg-gray-200 dark:focus-visible:outline-white"
              onClick={upload.choose}
            >
              {upload.file ? "Replace file" : "Choose file"}
            </button>

            {upload.file ? (
              <div className="mt-6 flex items-center gap-3 rounded-xl bg-gray-50 p-3 text-left dark:bg-gray-900">
                <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-white text-gray-500 shadow-sm dark:bg-gray-950 dark:text-gray-400">
                  <span aria-hidden="true">↗</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {upload.file.name}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                    {formatSize(upload.file.size)}
                  </p>
                </div>
                <button
                  type="button"
                  className="min-h-10 cursor-pointer rounded-lg px-3 text-sm text-gray-600 hover:bg-gray-200 hover:text-gray-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-950 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white dark:focus-visible:outline-white"
                  onClick={upload.clear}
                >
                  Remove
                </button>
              </div>
            ) : null}
          </div>
          {error ? (
            <p
              role="alert"
              className="mt-3 text-sm text-red-700 dark:text-red-400"
            >
              {error}
            </p>
          ) : null}
        </>
      )}
    </FileUpload>
  );
}

function HagfishReceipt() {
  const [file, setFile] = useState(null);

  return (
    <main className="min-h-svh bg-[#f7f3eb] px-5 py-14 text-gray-950 sm:px-8">
      <section className="mx-auto max-w-2xl border-2 border-black bg-white p-6 shadow-[6px_6px_0_0_#000]">
        <h1 className="text-3xl font-semibold tracking-tight">
          Expense receipt
        </h1>
        <p className="mt-2 text-sm leading-6 text-gray-600">
          JPG, PNG, or PDF. The application still owns the upload request.
        </p>
        <FileUpload
          value={file}
          onChange={setFile}
          accept="image/jpeg,image/png,.pdf"
          capture="environment"
          className="mt-6"
        >
          {(upload) => (
            <div
              {...upload.dropzone}
              className={`border-2 border-dashed p-6 transition-colors duration-150 motion-reduce:transition-none ${
                upload.dragging
                  ? "border-black bg-amber-50"
                  : "border-gray-400 bg-gray-50"
              }`}
            >
              {upload.file ? (
                <div className="flex items-center gap-4">
                  {upload.file.type.startsWith("image/") ? (
                    <img
                      src={upload.previewUrl}
                      alt="Selected receipt preview"
                      className="size-20 shrink-0 border-2 border-black object-cover"
                    />
                  ) : (
                    <div className="grid size-20 shrink-0 place-items-center border-2 border-black bg-white font-mono text-sm font-semibold">
                      PDF
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{upload.file.name}</p>
                    <p className="mt-1 text-sm text-gray-600">
                      {formatSize(upload.file.size)}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="py-5 text-center">
                  <p className="font-medium">Drop a receipt here</p>
                  <p className="mt-1 text-sm text-gray-600">
                    A real button remains the keyboard path.
                  </p>
                </div>
              )}
              <div className="mt-5 flex justify-center gap-2">
                <button
                  type="button"
                  className="min-h-10 cursor-pointer border-2 border-black bg-black px-4 text-sm font-medium text-white hover:bg-gray-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                  onClick={upload.choose}
                >
                  {upload.file ? "Replace receipt" : "Choose receipt"}
                </button>
                {upload.file ? (
                  <button
                    type="button"
                    className="min-h-10 cursor-pointer border-2 border-black bg-white px-4 text-sm font-medium hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                    onClick={upload.clear}
                  >
                    Remove
                  </button>
                ) : null}
              </div>
            </div>
          )}
        </FileUpload>
      </section>
    </main>
  );
}

function AttachmentsExample() {
  const [images, setImages] = useState([]);
  const [error, setError] = useState("");
  const signature = (candidate) =>
    [
      candidate.name,
      candidate.size,
      candidate.type,
      candidate.lastModified,
    ].join(":");
  const validate = (candidate, { files }) => {
    if (candidate.size > 5 * 1024 * 1024) {
      return "Each image must be 5 MB or smaller.";
    }
    if (files.some((file) => signature(file) === signature(candidate))) {
      return {
        reason: "duplicate",
        message: "That image is already attached.",
      };
    }
    return files.length < 4 ? true : "Attach up to 4 images.";
  };

  return (
    <main className="min-h-svh bg-gray-50 px-5 py-12 text-gray-950 dark:bg-gray-950 dark:text-white sm:px-8 lg:py-20">
      <section
        className="mx-auto max-w-3xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-8"
        aria-labelledby="attachments-title"
      >
        <h1
          id="attachments-title"
          className="text-2xl font-semibold tracking-tight"
        >
          Attach screenshots
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500 dark:text-gray-400">
          Add up to four images. Upload progress and persistence stay with the
          application.
        </p>

        <FileUpload
          value={images}
          onChange={(selection) => {
            setImages(selection);
            setError("");
          }}
          onReject={(detail) => setError(detail.message)}
          multiple
          accept="image/avif,image/gif,image/jpeg,image/png,image/webp"
          validate={validate}
          className="mt-7"
        >
          {(upload) => (
            <>
              <div
                {...upload.dropzone}
                className={`rounded-xl border border-dashed p-5 transition-colors duration-150 motion-reduce:transition-none ${
                  upload.dragging
                    ? "border-gray-950 bg-gray-50 dark:border-white dark:bg-gray-800"
                    : "border-gray-300 dark:border-gray-700"
                }`}
              >
                {upload.previews.length ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {upload.previews.map((preview) => (
                      <figure
                        key={`${preview.file.name}:${preview.file.lastModified}`}
                        className="group relative min-w-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800"
                      >
                        <img
                          src={preview.previewUrl}
                          alt={preview.file.name}
                          className="aspect-square w-full object-cover"
                        />
                        <figcaption className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-gray-950/80 px-2 py-1.5 text-white backdrop-blur-sm">
                          <span className="min-w-0 flex-1 truncate text-xs">
                            {preview.file.name}
                          </span>
                          <button
                            type="button"
                            className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-md hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-white"
                            aria-label={`Remove ${preview.file.name}`}
                            onClick={() => upload.remove(preview.file)}
                          >
                            <span aria-hidden="true">×</span>
                          </button>
                        </figcaption>
                      </figure>
                    ))}
                  </div>
                ) : null}

                <div
                  className={
                    upload.previews.length
                      ? "mt-5 flex flex-wrap items-center justify-between gap-3"
                      : "py-8 text-center"
                  }
                >
                  <div className={upload.previews.length ? "" : "mx-auto"}>
                    <p className="text-sm font-medium">
                      {upload.previews.length
                        ? `${upload.files.length} of 4 attached`
                        : "Drop screenshots here"}
                    </p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      AVIF, GIF, JPEG, PNG, or WebP · 5 MB each
                    </p>
                  </div>
                  <button
                    type="button"
                    className={`inline-flex min-h-11 cursor-pointer items-center justify-center rounded-lg bg-gray-950 px-4 text-sm font-medium text-white hover:bg-gray-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-950 dark:bg-white dark:text-gray-950 dark:hover:bg-gray-200 dark:focus-visible:outline-white ${
                      upload.previews.length ? "mt-0" : "mt-4"
                    }`}
                    onClick={upload.choose}
                  >
                    {upload.previews.length ? "Add more" : "Choose images"}
                  </button>
                </div>
              </div>
              {error ? (
                <p
                  role="alert"
                  className="mt-3 text-sm font-medium text-red-700 dark:text-red-400"
                >
                  {error}
                </p>
              ) : null}
            </>
          )}
        </FileUpload>
      </section>
    </main>
  );
}

const meta = {
  title: "Components/FileUpload",
  component: Example,
  parameters: { layout: "centered" },
  args: {
    accept: "image/png,image/jpeg,.pdf",
    disabled: false,
    maxKb: 2048,
  },
  argTypes: {
    accept: { control: "text" },
    disabled: { control: "boolean" },
    maxKb: { control: { type: "number", min: 1, step: 1 } },
  },
};

export default meta;

export const Playground = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvasElement.querySelector('input[type="file"]');
    await userEvent.upload(
      input,
      new File(["receipt"], "receipt.pdf", { type: "application/pdf" }),
    );
    await expect(canvas.getByText("receipt.pdf")).toBeInTheDocument();
  },
};

export const Attachments = {
  parameters: { layout: "fullscreen", controls: { disable: true } },
  render: () => <AttachmentsExample />,
};

export const Hagfish = {
  parameters: { layout: "fullscreen", controls: { disable: true } },
  render: () => <HagfishReceipt />,
};
