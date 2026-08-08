# Schedule Picker

Schedule Picker turns a future wall-clock intention into an exact ISO instant.
It combines an editable natural-language field, Calendar, time choices, and an
automatic commit on Enter or composite blur without a provider or configuration
file.

```sh
npx klean-ui@latest add schedule-picker
```

## When to use

Use Schedule Picker for publishing, sending, deploying, appointments, and jobs
that must happen at a future moment. Use Date Picker when only the day matters,
Date Range Picker for reporting periods, and Calendar when the calendar itself
is the workspace.

```vue
<SchedulePicker
  v-model="form.publishAt"
  name="publishAt"
  time-zone="Africa/Lagos"
  required
/>
```

Pass the account or application IANA timezone when it is known; otherwise the
browser timezone is the convention. `Friday at 9am`, `in 5 minutes`, and `in
one hour` create visible proposals. Relative durations preserve seconds. Enter
or leaving the complete picker commits the proposal; **Use this time** remains
available inside the popover. Moving focus within the picker does not commit
prematurely. The named form value retains the last valid ISO instant through
incomplete or ambiguous drafts.

The calendar and time list are keyboard navigable. Natural input can be more
precise than the `minuteStep` used by the time list. Past proposals are invalid.

## Related components

- Date Picker — a date without time or timezone.
- Calendar — the always-visible date-selection surface.
- Date Range Picker — date-only periods.
- Popover — the non-modal floating surface.
- Toast — announce the server result after a schedule is saved.
