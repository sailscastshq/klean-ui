import { expect, userEvent, waitFor, within } from "storybook/test";

export const longNotification = {
  title: "ProductionDeploymentWithAnUnbrokenApplicationIdentifier",
  message:
    "https://production.example.com/deployments/01J9productiondeploymentwithaverylongunbrokenidentifier/build-output",
  action: {
    label: "ViewTheCompleteDeploymentHistoryAndBuildOutput",
    href: "#deployment-history",
  },
  duration: false,
};

export const deployment = {
  project: { name: "depth-with-a-very-long-project-name" },
  environment: { name: "Production" },
  app: { name: "depth-with-a-long-application-name.sailscasts.com" },
  gitBranch: "feat/a-long-unbroken-branch-name-for-production-deployment",
};

export async function verifyToastBounds({ canvasElement }) {
  const canvas = within(canvasElement);
  await userEvent.click(
    canvas.getByRole("button", {
      name: /Show (long|deployment) notification/,
    }),
  );

  await waitFor(() => {
    expect(
      canvasElement.querySelector('[data-klean-toast-item][data-state="open"]'),
    ).not.toBeNull();
  });

  const viewport = canvasElement.querySelector('[data-slot="toast-viewport"]');
  const item = canvasElement.querySelector('[data-slot="toast"]');
  const viewportBounds = viewport.getBoundingClientRect();
  const windowWidth = canvasElement.ownerDocument.documentElement.clientWidth;

  expect(viewportBounds.left).toBeGreaterThanOrEqual(0);
  expect(viewportBounds.right).toBeLessThanOrEqual(windowWidth + 1);

  for (const element of canvasElement.querySelectorAll(
    '[data-slot="toast-list"], [data-klean-toast-row], [data-slot="toast"], [data-slot="toast-title"], [data-slot="toast-message"], [data-slot="toast-action"], [data-slot="deployment-card"]',
  )) {
    const bounds = element.getBoundingClientRect();
    expect(bounds.left).toBeGreaterThanOrEqual(viewportBounds.left - 1);
    expect(bounds.right).toBeLessThanOrEqual(viewportBounds.right + 1);
    expect(element.scrollWidth).toBeLessThanOrEqual(element.clientWidth + 1);
  }

  const link = canvasElement.querySelector('[data-slot="deployment-link"]');
  if (link) {
    const style = getComputedStyle(link);
    expect(style.textOverflow).toBe("ellipsis");
    expect(style.overflowX).toBe("hidden");
    expect(link.scrollWidth).toBeGreaterThan(link.clientWidth);
  }

  const dismiss = canvas.getByRole("button", { name: /^Dismiss / });
  const dismissBounds = dismiss.getBoundingClientRect();
  const itemBounds = item.getBoundingClientRect();
  expect(dismissBounds.left).toBeGreaterThanOrEqual(itemBounds.left);
  expect(dismissBounds.right).toBeLessThanOrEqual(itemBounds.right);
  expect(dismissBounds.top).toBeGreaterThanOrEqual(itemBounds.top);
  expect(dismissBounds.bottom).toBeLessThanOrEqual(itemBounds.bottom);
}
