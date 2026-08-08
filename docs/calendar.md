# Calendar

Calendar is the always-visible, locale-aware date-selection surface for Vue,
React, and Svelte. It uses date-only `YYYY-MM-DD` values so application dates do
not move when a user or server changes timezone.

```sh
npx klean-ui@latest add calendar
```

## When to use

Use Calendar when choosing dates is the main task: availability, scheduling
workspaces, booking flows, or a dashboard that should keep the month visible.

Use Date Picker for one compact form field, Date Range Picker for a bounded
period, and Schedule Picker when date, time, and timezone must become an exact
instant.

## API

`value`/`modelValue`, `defaultValue`, `min`, `max`, `unavailable`, `locale`,
`dir`, `disabled`, and `readonly` form the public contract. Callers style the
component with ordinary Tailwind classes and own product-specific availability
rules. There are no visual variants.

The calendar derives month names, weekday names, reading direction, and the
first day of the week from `Intl`. Arrow keys move by day or week; Home and End
move to week edges; Page Up and Page Down move by month, or by year with Shift.
Disabled dates remain discoverable but cannot be selected.

## Related components

- Date Picker — one editable date field with an optional calendar.
- Date Range Picker — a related start and end date.
- Schedule Picker — a future date and wall-clock time stored as an instant.
- Popover — the floating surface used by the compact pickers.
