import { expect, test } from "@rstest/core";
import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";
import { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { Markdown } from "@tiptap/markdown";
import {
  htmlRoundTripMatches,
  inspectMarkdown,
  inspectRichTextHtml,
  normalizeImageUrl,
  normalizeLinkUrl,
  preserveMarkdownEnvelope,
  roundTripMatches,
  sanitizeRichTextHtml,
} from "../registry/rich-text/vue/rich-text.js";

const codes = (result) => result.issues.map((item) => item.code);
const htmlWindow = new JSDOM("").window;

test("ordinary Markdown supports structured writing and safe images", () => {
  const markdown =
    '# Release\n\n**Bold**, *italic*, ~~removed~~ and `code`.\n\n> A quote\n\n- One\n- Two\n\n3. Three\n4. Four\n\n[Docs](/docs) and <https://example.com>.\n\n![Diagram](/uploads/diagram.png "A diagram")\n\n---';
  expect(inspectMarkdown(markdown)).toEqual({ supported: true, issues: [] });
});

test("unsupported Markdown stays in source mode instead of silently dropping syntax", () => {
  const fixtures = [
    ["<!-- keep this -->", "html-comments"],
    ["<aside>Note</aside>", "raw-html"],
    ["Text[^note]\n\n[^note]: Note", "footnotes"],
    ["[Docs][docs]\n\n[docs]: https://example.com", "reference-links"],
    ["| Name | Value |\n| --- | --- |\n| A | B |", "tables"],
    ["- [x] Done\n- [ ] Pending", "task-lists"],
    [":::warning\nDanger\n:::", "directives"],
    ["{{ component }}", "directives"],
    ["import Thing from './thing.js'", "mdx"],
    ["export const title = 'Thing'", "mdx"],
    ["---\ntitle: Release\n---\n\nHello", "frontmatter"],
    ["\uFEFF+++\ntitle = 'Release'\n+++", "frontmatter"],
    ["[Bad](javascript:alert(1))", "unsafe-links"],
    ["![Bad](data:image/png;base64,AAAA)", "unsafe-images"],
  ];
  for (const [source, code] of fixtures) {
    expect(codes(inspectMarkdown(source))).toContain(code);
    expect(roundTripMatches(source, source)).toBe(false);
  }
});

test("code examples and escaped HTML are not mistaken for unsupported documents", () => {
  const fixtures = [
    '```html\n<div class="notice">Example</div>\n<!-- comment -->\n```',
    "~~~md\n- [x] task\n\n[ref]: /docs\n[^note]: text\n~~~",
    "    <table>example</table>\n    import x from 'x'",
    "Use `<aside>` or `` `<div>` `` in your example.",
    "\\<aside> and &lt;script&gt; are literal text.",
    "<https://example.com> and <person@example.com>",
  ];
  for (const source of fixtures)
    expect(inspectMarkdown(source).supported).toBe(true);
});

test("equivalent Markdown spelling can round trip without treating editor output as proof", () => {
  const pairs = [
    ["**strong** and *emphasis*", "__strong__ and _emphasis_"],
    ["- One\n- Two", "* One\n* Two"],
    ["Heading\n=======", "# Heading"],
    ["&amp; and \\*", "& and \\*"],
    ["\uFEFF\r\n# Heading\r\n\r\n", "# Heading"],
  ];
  for (const [source, output] of pairs)
    expect(roundTripMatches(source, output)).toBe(true);
  expect(roundTripMatches("**Bold**", "Bold", () => ({ type: "doc" }))).toBe(
    false,
  );
  expect(roundTripMatches("[Site](/one)", "[Site](/two)", () => ({}))).toBe(
    false,
  );
  expect(
    roundTripMatches("![Alt](/a.png)", "![Other](/a.png)", () => ({})),
  ).toBe(false);
  expect(roundTripMatches("`first`", "`second`", () => ({}))).toBe(false);
  expect(roundTripMatches("3. Three", "1. Three", () => ({}))).toBe(false);
  expect(roundTripMatches("# Title", "## Title", () => ({}))).toBe(false);
  expect(
    roundTripMatches("**Bold**", "__Bold__", () => {
      throw new Error("parse");
    }),
  ).toBe(false);
});

test("the actual editor round trip keeps supported semantics and detects loss", () => {
  const editor = new Editor({
    element: document.createElement("div"),
    extensions: [StarterKit.configure({ underline: false }), Image, Markdown],
    content:
      "# Release\n\nA **bold** update and [docs](/docs).\n\n- One\n- Two",
    contentType: "markdown",
  });
  try {
    const original =
      "# Release\n\nA **bold** update and [docs](/docs).\n\n- One\n- Two";
    expect(
      roundTripMatches(original, editor.getMarkdown(), (value) =>
        editor.markdown.parse(value),
      ),
    ).toBe(true);
    const unsupported = 'A <span class="special">meaningful</span> label';
    editor.commands.setContent(unsupported, {
      contentType: "markdown",
      emitUpdate: false,
    });
    expect(
      roundTripMatches(unsupported, editor.getMarkdown(), (value) =>
        editor.markdown.parse(value),
      ),
    ).toBe(false);
  } finally {
    editor.destroy();
  }
});

test("Markdown edits preserve the caller's newline envelope and line ending convention", () => {
  expect(
    preserveMarkdownEnvelope("# New\n", "\uFEFF\r\n\r\n# Old\r\n\r\n"),
  ).toBe("\uFEFF\r\n\r\n# New\r\n\r\n");
  expect(preserveMarkdownEnvelope("# New\n", "# Old")).toBe("# New");
  expect(preserveMarkdownEnvelope("# New", "\n# Old\n")).toBe("\n# New\n");
  expect(preserveMarkdownEnvelope("", "\n# Old\n")).toBe("");
});

test("links accept ordinary application navigation and explicitly safe protocols", () => {
  for (const url of [
    "https://example.com/path",
    "http://localhost:1337",
    "mailto:a@example.com",
    "tel:+234123",
    "/projects/one",
    "./docs",
    "../home",
    "#heading",
    "?page=2",
  ]) {
    expect(normalizeLinkUrl(url)).toBe(url);
  }
  expect(normalizeLinkUrl(" example.com/docs ")).toBe(
    "https://example.com/docs",
  );
  for (const url of [
    "",
    "javascript:alert(1)",
    "JaVaScRiPt:alert(1)",
    "java\nscript:alert(1)",
    "data:text/html,hello",
    "blob:https://example.com/a",
    "vbscript:msgbox(1)",
    "//example.com",
    "\\\\example.com",
    "https://example.com/a b",
    "mailto:",
    "tel:",
  ]) {
    expect(normalizeLinkUrl(url)).toBe(null);
  }
});

test("image URLs exclude executable protocols, embedded payloads, and SVG", () => {
  for (const url of [
    "https://example.com/image.png",
    "http://localhost:1337/image.webp",
    "/uploads/photo.jpg",
    "./photo.avif",
    "../photo.gif",
  ]) {
    expect(normalizeImageUrl(url)).toBe(url);
  }
  for (const url of [
    "javascript:alert(1)",
    "data:image/png;base64,AAAA",
    "data:image/svg+xml,<svg/>",
    "blob:https://example.com/image",
    "mailto:a@example.com",
    "//example.com/photo.png",
    "/image.svg",
    "/image.SVG?cache=1",
    "/image.%73vg",
    "/image.svgz",
  ]) {
    expect(normalizeImageUrl(url)).toBe(null);
  }
});

test("HTML inspection only accepts the visual schema's elements and attributes", () => {
  expect(
    inspectRichTextHtml(
      '<h6>Small heading</h6><p><u>Underline</u> <a href="/docs" title="Docs">Docs</a></p><ol start="3"><li>Third</li></ol><pre><code class="language-js">const x = 1</code></pre><img src="/a.png" alt="A" width="100" height="80">',
    ).supported,
  ).toBe(true);
  for (const html of [
    "<table><tr><td>Data</td></tr></table>",
    '<p style="color:red">Color</p>',
    '<p class="custom">Class</p>',
    '<p id="anchor">Anchor</p>',
    '<code class="custom">Code</code>',
    "<!-- Preserve me --><p>Text</p>",
    "<html><body><p>Document</p></body></html>",
    '<a href="javascript:alert(1)">Bad</a>',
    '<img src="/a.svg" alt="SVG">',
    '<img alt="Missing image">',
  ])
    expect(inspectRichTextHtml(html).supported).toBe(false);
});

test("HTML sanitization strips scripts, event handlers, unsafe URLs, and hidden styling", () => {
  const html =
    '<script>alert(1)</script><svg><script>alert(2)</script></svg><math><mtext>X</mtext></math><iframe src="https://evil.example"></iframe><p style="position:fixed" onclick="alert(1)" data-secret="x">Safe <strong>text</strong></p><img src="data:image/png;base64,AAAA" onerror="alert(1)"><a href="java&#x09;script:alert(1)">Bad</a><img src="/image.svg">';
  const result = sanitizeRichTextHtml(html, { window: htmlWindow });
  const template = document.createElement("template");
  template.innerHTML = result;
  expect(template.content.querySelector("script, svg, math, iframe")).toBe(
    null,
  );
  expect(
    template.content.querySelector(
      "[style], [onclick], [onerror], [data-secret]",
    ),
  ).toBe(null);
  expect(template.content.querySelector("a").hasAttribute("href")).toBe(false);
  for (const image of template.content.querySelectorAll("img"))
    expect(image.hasAttribute("src")).toBe(false);
  expect(result).toContain("Safe <strong>text</strong>");
});

test("safe HTML retains formatting while new-window links receive protections", () => {
  const result = sanitizeRichTextHtml(
    '<h5>Heading</h5><p><u>Underlined</u><a href="https://example.com" target="_blank" rel="nofollow">Site</a></p><img src="/a.png" alt="Diagram" title="A" width="120" height="80"><pre><code class="language-js">const x = 1</code></pre>',
    { window: htmlWindow },
  );
  const template = document.createElement("template");
  template.innerHTML = result;
  expect(template.content.querySelector("h5").textContent).toBe("Heading");
  expect(template.content.querySelector("u").textContent).toBe("Underlined");
  expect(template.content.querySelector("img").getAttribute("width")).toBe(
    "120",
  );
  expect(template.content.querySelector("code").className).toBe("language-js");
  expect(template.content.querySelector("a").rel.split(" ").sort()).toEqual([
    "nofollow",
    "noopener",
    "noreferrer",
  ]);
});

test("HTML processing fails closed without a browser DOM", () => {
  expect(
    inspectRichTextHtml("<p>Text</p>", { window: undefined }).supported,
  ).toBe(false);
  expect(sanitizeRichTextHtml("<p>Text</p>", { window: undefined })).toBe("");
});

test("HTML round trips tolerate formatting aliases and harmless serialization differences", () => {
  const pairs = [
    [
      "<p><b>Bold</b> <i>italic</i> <del>gone</del></p>",
      "<p><strong>Bold</strong> <em>italic</em> <s>gone</s></p>",
    ],
    ["<p>One<p>Two", "<p>One</p>\n<p>Two</p>"],
    [
      '<a title="Docs" href="/docs">Docs</a>',
      '<a rel="noopener noreferrer" href="/docs" title="Docs">Docs</a>',
    ],
    ["<ol><li>One</li></ol>", '<ol start="1"><li><p>One</p></li></ol>'],
    ["<p>  Hello\n world  </p>", "<p>Hello world</p>"],
    ["", "<p></p>"],
    ["Hello <b>world</b>", "<p>Hello <strong>world</strong></p>"],
  ];
  for (const [source, output] of pairs)
    expect(htmlRoundTripMatches(source, output)).toBe(true);
});

test("HTML round trips reject dropped marks, attributes, content, and code whitespace", () => {
  const pairs = [
    ["<p><u>Keep underline</u></p>", "<p>Keep underline</p>"],
    [
      '<p><a href="/docs" title="Helpful title">Docs</a></p>',
      '<p><a href="/docs">Docs</a></p>',
    ],
    [
      '<p><a href="/docs" target="_blank">Docs</a></p>',
      '<p><a href="/docs">Docs</a></p>',
    ],
    [
      '<p><a href="/docs" rel="nofollow">Docs</a></p>',
      '<p><a href="/docs">Docs</a></p>',
    ],
    ["<pre><code>a  b\nc</code></pre>", "<pre><code>a b\nc</code></pre>"],
    ["<p><code>a  b</code></p>", "<p><code>a b</code></p>"],
    [
      "<p><strong>a</strong> <em>b</em></p>",
      "<p><strong>a</strong><em>b</em></p>",
    ],
    [
      "<p><strong>a </strong><em>b</em></p>",
      "<p><strong>a</strong><em>b</em></p>",
    ],
    ['<img src="/a.png" alt="A" width="100">', '<img src="/a.png" alt="A">'],
  ];
  for (const [source, output] of pairs)
    expect(htmlRoundTripMatches(source, output)).toBe(false);
});

test("real editor HTML round trips detect unsupported underline and preserve link titles", () => {
  const editor = new Editor({
    element: document.createElement("div"),
    extensions: [
      StarterKit.configure({
        underline: false,
        link: { HTMLAttributes: { target: null, rel: "noopener noreferrer" } },
      }),
      Image,
    ],
    content: "<p></p>",
  });
  try {
    const underlined = "<p><u>Underline</u></p>";
    editor.commands.setContent(underlined, { emitUpdate: false });
    expect(htmlRoundTripMatches(underlined, editor.getHTML())).toBe(false);
    const titledLink = '<p><a href="/docs" title="Important">Docs</a></p>';
    editor.commands.setContent(titledLink, { emitUpdate: false });
    expect(htmlRoundTripMatches(titledLink, editor.getHTML())).toBe(true);
    const html =
      '<h2>Heading</h2><p><b>Bold</b> and <a href="/docs">docs</a>.</p><ul><li>One</li><li>Two</li></ul>';
    editor.commands.setContent(html, { emitUpdate: false });
    expect(htmlRoundTripMatches(html, editor.getHTML())).toBe(true);
  } finally {
    editor.destroy();
  }
});

test("all framework source-owned content helpers have identical behavior", () => {
  const source = readFileSync("registry/rich-text/vue/rich-text.js", "utf8");
  for (const framework of ["react", "svelte"])
    expect(
      readFileSync(`registry/rich-text/${framework}/rich-text.js`, "utf8"),
    ).toBe(source);
});
