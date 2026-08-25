import { ref, shallowRef } from "vue";
import { expect, userEvent, within } from "storybook/test";
import FileUpload from "../src/vue/file-upload/FileUpload.vue";
import { avatarImages } from "./shared/avatar-images.js";

function formatSize(size) {
  if (size < 1024) return `${size} B`;
  return `${(size / 1024).toFixed(1)} KB`;
}

const meta = {
  title: "Components/FileUpload",
  component: FileUpload,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "One native file input with a small state-and-lifecycle bridge. Real buttons own browse access; ordinary application markup owns every visible upload surface.",
      },
    },
  },
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
  parameters: { controls: { include: ["accept", "disabled", "maxKb"] } },
  render: (args) => ({
    components: { FileUpload },
    setup() {
      const file = shallowRef(null);
      const error = ref("");
      function validate(candidate) {
        return candidate.size <= args.maxKb * 1024
          ? true
          : `Choose a file under ${args.maxKb} KB.`;
      }
      function reject(detail) {
        error.value = detail.message;
      }
      function change() {
        error.value = "";
      }
      return { args, change, error, file, formatSize, reject, validate };
    },
    template: `
      <FileUpload
        v-model="file"
        :accept="args.accept"
        :disabled="args.disabled"
        :validate="validate"
        @change="change"
        @reject="reject"
        v-slot="upload"
        class="w-[min(38rem,calc(100vw-2rem))]"
      >
        <div
          v-bind="upload.dropzone"
          :class="[
            'rounded-2xl border border-dashed bg-white p-8 text-center shadow-sm transition-colors duration-150 dark:bg-gray-950 motion-reduce:transition-none',
            upload.dragging ? 'border-gray-950 bg-gray-50 dark:border-white dark:bg-gray-900' : 'border-gray-300 dark:border-gray-700',
            args.disabled ? 'opacity-50' : '',
          ]"
        >
          <div class="mx-auto grid size-12 place-items-center rounded-xl bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-200">
            <svg aria-hidden="true" viewBox="0 0 24 24" class="size-6" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M5 15v3.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V15"/></svg>
          </div>
          <h2 class="mt-5 text-lg font-semibold tracking-tight">{{ upload.file ? 'Ready to upload' : 'Add a file' }}</h2>
          <p class="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">Drop one file here, or use the native picker.</p>
          <button
            type="button"
            :disabled="args.disabled"
            class="mt-5 inline-flex min-h-11 cursor-pointer items-center justify-center rounded-lg bg-gray-950 px-4 text-sm font-medium text-white outline-none hover:bg-gray-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-950 disabled:cursor-not-allowed dark:bg-white dark:text-gray-950 dark:hover:bg-gray-200 dark:focus-visible:outline-white"
            @click="upload.choose"
          >
            {{ upload.file ? 'Replace file' : 'Choose file' }}
          </button>

          <div v-if="upload.file" class="mt-6 flex items-center gap-3 rounded-xl bg-gray-50 p-3 text-left dark:bg-gray-900">
            <div class="grid size-10 shrink-0 place-items-center rounded-lg bg-white text-gray-500 shadow-sm dark:bg-gray-950 dark:text-gray-400">
              <svg aria-hidden="true" viewBox="0 0 24 24" class="size-5" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M7 3.75h7l3 3V20.25H7z"/><path d="M14 3.75v3h3"/></svg>
            </div>
            <div class="min-w-0 flex-1"><p class="truncate text-sm font-medium">{{ upload.file.name }}</p><p class="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{{ formatSize(upload.file.size) }}</p></div>
            <button type="button" class="min-h-10 cursor-pointer rounded-lg px-3 text-sm text-gray-600 hover:bg-gray-200 hover:text-gray-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-950 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white dark:focus-visible:outline-white" @click="upload.clear">Remove</button>
          </div>
        </div>
        <p v-if="error" role="alert" class="mt-3 text-sm text-red-700 dark:text-red-400">{{ error }}</p>
      </FileUpload>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvasElement.querySelector('input[type="file"]');
    const receipt = new File(["receipt"], "receipt.pdf", {
      type: "application/pdf",
    });

    await userEvent.upload(input, receipt);
    await expect(canvas.getByText("receipt.pdf")).toBeInTheDocument();
    await expect(
      canvas.getByRole("button", { name: "Replace file" }),
    ).toBeInTheDocument();
  },
};

export const Attachments = {
  parameters: { layout: "fullscreen", controls: { disable: true } },
  render: () => ({
    components: { FileUpload },
    setup() {
      const images = shallowRef([]);
      const error = ref("");
      function signature(candidate) {
        return [
          candidate.name,
          candidate.size,
          candidate.type,
          candidate.lastModified,
        ].join(":");
      }
      function validateImage(candidate, { files }) {
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
      }
      return { error, images, validateImage };
    },
    template: `
      <main class="min-h-svh bg-gray-50 px-5 py-12 text-gray-950 dark:bg-gray-950 dark:text-white sm:px-8 lg:py-20">
        <section class="mx-auto max-w-3xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-8" aria-labelledby="attachments-title">
          <div class="flex flex-wrap items-start justify-between gap-5">
            <div>
              <h1 id="attachments-title" class="text-2xl font-semibold tracking-tight">Attach screenshots</h1>
              <p class="mt-2 max-w-xl text-sm leading-6 text-gray-500 dark:text-gray-400">Add up to four images. Paste can update the same model; upload progress and persistence stay with the application.</p>
            </div>
          </div>

          <FileUpload
            v-model="images"
            multiple
            accept="image/avif,image/gif,image/jpeg,image/png,image/webp"
            :validate="validateImage"
            @change="error = ''"
            @reject="error = $event.message"
            v-slot="upload"
            class="mt-7"
          >
            <div
              v-bind="upload.dropzone"
              :class="[
                'rounded-xl border border-dashed p-5 transition-colors duration-150 motion-reduce:transition-none',
                upload.dragging ? 'border-gray-950 bg-gray-50 dark:border-white dark:bg-gray-800' : 'border-gray-300 dark:border-gray-700'
              ]"
            >
              <div v-if="upload.previews.length" class="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <figure v-for="preview in upload.previews" :key="preview.file.name + preview.file.lastModified" class="group relative min-w-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                  <img :src="preview.previewUrl" :alt="preview.file.name" class="aspect-square w-full object-cover" />
                  <figcaption class="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-gray-950/80 px-2 py-1.5 text-white backdrop-blur-sm">
                    <span class="min-w-0 flex-1 truncate text-xs">{{ preview.file.name }}</span>
                    <button type="button" class="grid size-8 shrink-0 cursor-pointer place-items-center rounded-md hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-white" :aria-label="'Remove ' + preview.file.name" @click="upload.remove(preview.file)">
                      <svg aria-hidden="true" viewBox="0 0 20 20" class="size-4" fill="none" stroke="currentColor" stroke-width="1.6"><path d="m6 6 8 8m0-8-8 8" stroke-linecap="round" /></svg>
                    </button>
                  </figcaption>
                </figure>
              </div>

              <div :class="upload.previews.length ? 'mt-5 flex flex-wrap items-center justify-between gap-3' : 'py-8 text-center'">
                <div :class="upload.previews.length ? '' : 'mx-auto'">
                  <p class="text-sm font-medium">{{ upload.previews.length ? upload.files.length + ' of 4 attached' : 'Drop screenshots here' }}</p>
                  <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">AVIF, GIF, JPEG, PNG, or WebP · 5 MB each</p>
                </div>
                <button type="button" class="mt-4 inline-flex min-h-11 cursor-pointer items-center justify-center rounded-lg bg-gray-950 px-4 text-sm font-medium text-white hover:bg-gray-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-950 dark:bg-white dark:text-gray-950 dark:hover:bg-gray-200 dark:focus-visible:outline-white" :class="upload.previews.length ? 'mt-0' : ''" @click="upload.choose">
                  {{ upload.previews.length ? 'Add more' : 'Choose images' }}
                </button>
              </div>
            </div>
            <p v-if="error" role="alert" class="mt-3 text-sm font-medium text-red-700 dark:text-red-400">{{ error }}</p>
          </FileUpload>
        </section>
      </main>
    `,
  }),
};

export const Hagfish = {
  parameters: { layout: "fullscreen", controls: { disable: true } },
  render: () => ({
    components: { FileUpload },
    setup() {
      const logo = shallowRef(null);
      const receipt = shallowRef(null);
      const logoRemoved = ref(false);
      const receiptError = ref("");
      function validateReceipt(candidate) {
        return candidate.size <= 5 * 1024 * 1024
          ? true
          : "Receipts must be 5 MB or smaller.";
      }
      return {
        avatarImages,
        formatSize,
        logo,
        logoRemoved,
        receipt,
        receiptError,
        validateReceipt,
      };
    },
    template: `
      <main class="min-h-svh bg-[#f7f3eb] px-5 py-12 text-gray-950 sm:px-8 lg:px-12 lg:py-20">
        <div class="mx-auto max-w-5xl">
          <header class="max-w-2xl">
            <h1 class="text-balance text-4xl font-semibold tracking-tighter sm:text-5xl">Files should feel like part of the form.</h1>
            <p class="mt-5 text-pretty text-base leading-7 text-gray-600">The same native bridge becomes a compact logo editor or a receipt surface. Hagfish keeps the copy, shape, policy, and eventual upload request.</p>
          </header>

          <div class="mt-12 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <section class="border-2 border-black bg-white p-6 shadow-[6px_6px_0_0_#000]" aria-labelledby="business-logo-title">
              <h2 id="business-logo-title" class="text-xl font-semibold">Business logo</h2>
              <p class="mt-2 text-sm leading-6 text-gray-600">Shown on every invoice.</p>
              <FileUpload v-model="logo" accept="image/*" v-slot="upload" class="mt-6">
                <div class="flex items-center gap-4">
                  <div class="grid size-20 shrink-0 place-items-center overflow-hidden rounded-xl border-2 border-black bg-gray-100">
                    <img v-if="upload.previewUrl || (!logoRemoved && avatarImages.kelvin)" :src="upload.previewUrl || avatarImages.kelvin" alt="Current business logo" class="size-full object-cover" />
                    <span v-else class="text-xl font-semibold">HF</span>
                  </div>
                  <div class="min-w-0">
                    <p class="truncate text-sm font-medium">{{ upload.file?.name || (!logoRemoved ? 'hagfish-studio.png' : 'No logo selected') }}</p>
                    <div class="mt-3 flex flex-wrap gap-2">
                      <button type="button" class="min-h-10 cursor-pointer border-2 border-black bg-black px-3 text-sm font-medium text-white hover:bg-gray-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black" @click="upload.choose">{{ upload.file || !logoRemoved ? 'Replace' : 'Choose logo' }}</button>
                      <button v-if="upload.file || !logoRemoved" type="button" class="min-h-10 cursor-pointer border-2 border-black bg-white px-3 text-sm font-medium hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black" @click="upload.file ? upload.clear() : (logoRemoved = true)">Remove</button>
                    </div>
                  </div>
                </div>
              </FileUpload>
            </section>

            <section class="border-2 border-black bg-white p-6 shadow-[6px_6px_0_0_#000]" aria-labelledby="receipt-title">
              <h2 id="receipt-title" class="text-xl font-semibold">Expense receipt</h2>
              <p class="mt-2 text-sm leading-6 text-gray-600">JPG, PNG, or PDF. Up to 5 MB.</p>
              <FileUpload
                v-model="receipt"
                accept="image/jpeg,image/png,.pdf"
                capture="environment"
                :validate="validateReceipt"
                @change="receiptError = ''"
                @reject="receiptError = $event.message"
                v-slot="upload"
                class="mt-6"
              >
                <div
                  v-bind="upload.dropzone"
                  :class="['border-2 border-dashed p-5 transition-colors duration-150 motion-reduce:transition-none', upload.dragging ? 'border-black bg-amber-50' : 'border-gray-400 bg-gray-50']"
                >
                  <div v-if="upload.file" class="flex items-center gap-4">
                    <img v-if="upload.file.type.startsWith('image/')" :src="upload.previewUrl" alt="Selected receipt preview" class="size-20 shrink-0 border-2 border-black object-cover" />
                    <div v-else class="grid size-20 shrink-0 place-items-center border-2 border-black bg-white font-mono text-sm font-semibold">PDF</div>
                    <div class="min-w-0 flex-1"><p class="truncate font-medium">{{ upload.file.name }}</p><p class="mt-1 text-sm text-gray-600">{{ formatSize(upload.file.size) }}</p></div>
                  </div>
                  <div v-else class="py-4 text-center"><p class="font-medium">Drop a receipt here</p><p class="mt-1 text-sm text-gray-600">The choose button remains the keyboard path.</p></div>
                  <div class="mt-5 flex justify-center gap-2">
                    <button type="button" class="min-h-10 cursor-pointer border-2 border-black bg-black px-4 text-sm font-medium text-white hover:bg-gray-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black" @click="upload.choose">{{ upload.file ? 'Replace receipt' : 'Choose receipt' }}</button>
                    <button v-if="upload.file" type="button" class="min-h-10 cursor-pointer border-2 border-black bg-white px-4 text-sm font-medium hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black" @click="upload.clear">Remove</button>
                  </div>
                </div>
                <p v-if="receiptError" role="alert" class="mt-3 text-sm font-medium text-red-700">{{ receiptError }}</p>
              </FileUpload>
            </section>
          </div>
        </div>
      </main>
    `,
  }),
};
