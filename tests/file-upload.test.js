import { parse } from "@babel/parser";
import { expect, test } from "@rstest/core";
import { mount } from "@vue/test-utils";
import { compile } from "svelte/compiler";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { defineComponent, nextTick, ref, shallowRef } from "vue";
import FileUpload from "../src/vue/file-upload/FileUpload.vue";

function registrySource(framework, filename) {
  return readFileSync(
    resolve(`registry/file-upload/${framework}/${filename}`),
    "utf8",
  );
}

function installObjectUrlSpies() {
  const createDescriptor = Object.getOwnPropertyDescriptor(
    URL,
    "createObjectURL",
  );
  const revokeDescriptor = Object.getOwnPropertyDescriptor(
    URL,
    "revokeObjectURL",
  );
  const created = [];
  const revoked = [];

  Object.defineProperty(URL, "createObjectURL", {
    configurable: true,
    value(file) {
      const value = `blob:klean-${created.length + 1}`;
      created.push({ file, value });
      return value;
    },
  });
  Object.defineProperty(URL, "revokeObjectURL", {
    configurable: true,
    value(value) {
      revoked.push(value);
    },
  });

  return {
    created,
    revoked,
    restore() {
      if (createDescriptor) {
        Object.defineProperty(URL, "createObjectURL", createDescriptor);
      } else {
        delete URL.createObjectURL;
      }
      if (revokeDescriptor) {
        Object.defineProperty(URL, "revokeObjectURL", revokeDescriptor);
      } else {
        delete URL.revokeObjectURL;
      }
    },
  };
}

function harness(options = {}) {
  const file = shallowRef(options.file ?? null);
  const rejections = ref([]);
  const changes = ref([]);
  const disabled = ref(options.disabled ?? false);
  const wrapper = mount(
    defineComponent({
      components: { FileUpload },
      setup() {
        function handleReject(detail) {
          rejections.value.push(detail);
        }
        function handleChange(value) {
          changes.value.push(value);
        }
        return {
          accept: options.accept ?? "image/png,.pdf",
          changes,
          disabled,
          file,
          handleChange,
          handleReject,
          rejections,
          validate:
            options.validate ??
            ((candidate) =>
              candidate.size <= 1024 ? true : "Choose a file under 1 KB."),
        };
      },
      template: `
        <FileUpload
          v-model="file"
          :accept="accept"
          :disabled="disabled"
          :validate="validate"
          class="rounded-xl border"
          @change="handleChange"
          @reject="handleReject"
          v-slot="upload"
        >
          <button type="button" class="choose" @click="upload.choose">Choose file</button>
          <div class="dropzone" v-bind="upload.dropzone">Drop file</div>
          <output class="filename">{{ upload.file?.name }}</output>
          <output class="preview">{{ upload.previewUrl }}</output>
          <button v-if="upload.file" type="button" class="clear" @click="upload.clear">Remove</button>
        </FileUpload>
      `,
    }),
    { attachTo: document.body },
  );
  return { changes, disabled, file, rejections, wrapper };
}

async function changeFiles(wrapper, files) {
  const input = wrapper.get('input[type="file"]');
  Object.defineProperty(input.element, "files", {
    configurable: true,
    value: files,
  });
  await input.trigger("change");
}

function dispatchDrop(element, files) {
  const event = new Event("drop", { bubbles: true, cancelable: true });
  Object.defineProperty(event, "dataTransfer", {
    value: { files, types: ["Files"], dropEffect: "none" },
  });
  element.dispatchEvent(event);
  return event;
}

test("owns one native input while caller markup owns every visible control", () => {
  const { wrapper } = harness();
  const root = wrapper.get('[data-slot="file-upload"]');
  const input = root.get('input[type="file"]');

  expect(root.classes()).toEqual(
    expect.arrayContaining(["rounded-xl", "border"]),
  );
  expect(root.attributes("data-state")).toBe("empty");
  expect(input.attributes("hidden")).toBeDefined();
  expect(input.attributes("accept")).toBe("image/png,.pdf");
  expect(root.get("button.choose").attributes("type")).toBe("button");
  expect(root.get(".dropzone").attributes("role")).toBeUndefined();

  wrapper.unmount();
});

test("accepts, replaces, clears, and completely revokes temporary previews", async () => {
  const urls = installObjectUrlSpies();
  const { changes, file, wrapper } = harness();
  const first = new File(["one"], "one.png", { type: "image/png" });
  const second = new File(["two"], "two.pdf", {
    type: "application/pdf",
  });

  try {
    await changeFiles(wrapper, [first]);
    expect(file.value).toBe(first);
    expect(
      wrapper.get('[data-slot="file-upload"]').attributes("data-state"),
    ).toBe("ready");
    expect(wrapper.get(".preview").text()).toBe("blob:klean-1");
    expect(wrapper.get('input[type="file"]').element.value).toBe("");

    await changeFiles(wrapper, [second]);
    expect(file.value).toBe(second);
    expect(urls.revoked).toEqual(["blob:klean-1"]);
    expect(wrapper.get(".preview").text()).toBe("blob:klean-2");

    await wrapper.get("button.clear").trigger("click");
    expect(file.value).toBeNull();
    expect(changes.value).toEqual([first, second, null]);
    expect(urls.revoked).toEqual(["blob:klean-1", "blob:klean-2"]);
  } finally {
    wrapper.unmount();
    urls.restore();
  }
});

test("rejects type, size, and multiple-file mistakes without losing accepted state", async () => {
  const urls = installObjectUrlSpies();
  const accepted = new File(["ok"], "receipt.png", { type: "image/png" });
  const { file, rejections, wrapper } = harness({ file: accepted });

  try {
    await nextTick();
    const wrongType = new File(["no"], "notes.txt", { type: "text/plain" });
    await changeFiles(wrapper, [wrongType]);
    expect(file.value).toBe(accepted);
    expect(rejections.value.at(-1)).toMatchObject({
      file: wrongType,
      reason: "accept",
    });

    const tooLarge = new File(["x".repeat(2048)], "large.png", {
      type: "image/png",
    });
    await changeFiles(wrapper, [tooLarge]);
    expect(file.value).toBe(accepted);
    expect(rejections.value.at(-1)).toMatchObject({
      file: tooLarge,
      reason: "validate",
      message: "Choose a file under 1 KB.",
    });

    dispatchDrop(wrapper.get(".dropzone").element, [accepted, tooLarge]);
    await nextTick();
    expect(file.value).toBe(accepted);
    expect(rejections.value.at(-1)).toMatchObject({ reason: "multiple" });
    expect(rejections.value.at(-1).files).toHaveLength(2);
  } finally {
    wrapper.unmount();
    urls.restore();
  }
});

test("uses additive drop bindings without inventing keyboard semantics", async () => {
  const urls = installObjectUrlSpies();
  const { disabled, file, wrapper } = harness();
  const dropzone = wrapper.get(".dropzone");
  const image = new File(["ok"], "logo.png", { type: "image/png" });
  const enter = new Event("dragenter", { bubbles: true, cancelable: true });
  Object.defineProperty(enter, "dataTransfer", {
    value: { files: [image], types: ["Files"], dropEffect: "none" },
  });

  try {
    dropzone.element.dispatchEvent(enter);
    await nextTick();
    expect(enter.defaultPrevented).toBe(true);
    expect(dropzone.attributes("data-dragging")).toBe("");

    const drop = dispatchDrop(dropzone.element, [image]);
    await nextTick();
    expect(drop.defaultPrevented).toBe(true);
    expect(file.value).toBe(image);
    expect(dropzone.attributes("data-dragging")).toBeUndefined();

    disabled.value = true;
    await nextTick();
    dispatchDrop(dropzone.element, [
      new File(["x"], "new.png", { type: "image/png" }),
    ]);
    await nextTick();
    expect(file.value).toBe(image);
    expect(dropzone.attributes("data-disabled")).toBe("");
  } finally {
    wrapper.unmount();
    urls.restore();
  }
});

test("opens the platform picker from a real caller button and respects disabled", async () => {
  const { disabled, wrapper } = harness();
  const input = wrapper.get('input[type="file"]').element;
  let opens = 0;
  Object.defineProperty(input, "showPicker", {
    configurable: true,
    value() {
      opens += 1;
    },
  });

  await wrapper.get("button.choose").trigger("click");
  expect(opens).toBe(1);

  disabled.value = true;
  await nextTick();
  await wrapper.get("button.choose").trigger("click");
  expect(opens).toBe(1);

  wrapper.unmount();
});

test("revokes the active preview when its owner unmounts", async () => {
  const urls = installObjectUrlSpies();
  const { wrapper } = harness();
  const image = new File(["logo"], "logo.png", { type: "image/png" });

  try {
    await changeFiles(wrapper, [image]);
    expect(urls.created).toHaveLength(1);
    wrapper.unmount();
    expect(urls.revoked).toEqual(["blob:klean-1"]);
  } finally {
    if (wrapper.exists()) wrapper.unmount();
    urls.restore();
  }
});

test("ships equivalent parseable native-first source for every framework", () => {
  expect(registrySource("vue", "FileUpload.vue")).toBe(
    readFileSync(resolve("src/vue/file-upload/FileUpload.vue"), "utf8"),
  );

  expect(() =>
    parse(registrySource("react", "FileUpload.jsx"), {
      sourceType: "module",
      plugins: ["jsx"],
    }),
  ).not.toThrow();

  const result = compile(registrySource("svelte", "FileUpload.svelte"), {
    filename: "FileUpload.svelte",
    generate: false,
  });
  expect(result.warnings).toEqual([]);

  for (const [framework, filename] of [
    ["vue", "FileUpload.vue"],
    ["react", "FileUpload.jsx"],
    ["svelte", "FileUpload.svelte"],
  ]) {
    const source = registrySource(framework, filename);
    expect(source).toMatch(/type=["']file["']/);
    expect(source).toContain('data-slot="file-upload"');
    expect(source).toContain('data-part="input"');
    expect(source).toContain("createObjectURL");
    expect(source).toContain("revokeObjectURL");
    expect(source).toContain("showPicker");
    expect(source).not.toMatch(
      /FileUploadTrigger|FileUploadDropzone|FileUploadPreview/,
    );
    expect(source).not.toMatch(/localStorage|sessionStorage|URLSearchParams/);
    expect(source).not.toMatch(/\b(?:form|required)\b/);
    expect(source).not.toMatch(/\bvariant\b/i);
  }
});
