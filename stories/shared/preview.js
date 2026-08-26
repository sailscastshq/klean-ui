export default {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    docs: {
      toc: true,
    },
    options: {
      storySort: {
        order: [
          "Klean UI",
          ["Introduction", "Durable UI", "Theming"],
          "Components",
        ],
      },
    },
    a11y: {
      test: "error",
    },
  },
};
