import { Fragment, forwardRef } from "react";
import { twMerge } from "tailwind-merge";
import Avatar from "../avatar/Avatar.jsx";

const ROOT_CLASSES = "flex items-center -space-x-2";
const AVATAR_CLASSES = "ring-2 ring-white dark:ring-gray-950";
const OVERFLOW_CLASSES =
  "relative inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-700 tabular-nums ring-2 ring-white select-none dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-950";

function initials(alt = "") {
  return alt
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

const AvatarGroup = forwardRef(function AvatarGroup(
  {
    items = [],
    max,
    total,
    avatarClassName,
    overflowClassName,
    renderItem,
    renderOverflow,
    className,
    "data-slot": _dataSlot,
    ...props
  },
  ref,
) {
  const visible =
    Number.isInteger(max) && max >= 0 ? items.slice(0, max) : items;
  const size = Number.isFinite(total)
    ? Math.max(total, visible.length)
    : items.length;
  const hidden = size - visible.length;

  return (
    <div
      {...props}
      ref={ref}
      role="group"
      data-slot="avatar-group"
      className={twMerge(ROOT_CLASSES, className)}
    >
      {visible.map((item, index) => (
        <Fragment key={item.key ?? index}>
          {renderItem ? (
            renderItem(item, index)
          ) : (
            <Avatar
              src={item.src}
              alt={item.alt ?? ""}
              className={twMerge(AVATAR_CLASSES, avatarClassName)}
            >
              {item.fallback ?? initials(item.alt)}
            </Avatar>
          )}
        </Fragment>
      ))}
      {hidden > 0 &&
        (renderOverflow ? (
          renderOverflow(hidden)
        ) : (
          <span
            role="img"
            data-slot="avatar-group-overflow"
            aria-label={`${hidden} more`}
            className={twMerge(OVERFLOW_CLASSES, overflowClassName)}
          >
            +{hidden}
          </span>
        ))}
    </div>
  );
});

export default AvatarGroup;
