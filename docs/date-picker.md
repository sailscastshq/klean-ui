# Date Picker

Date Picker is the normal choice for one date in a form. It keeps the field
editable, offers Calendar as an enhancement, and submits the stable date-only
value `YYYY-MM-DD`.

```sh
npx klean-ui@latest add date-picker
```

## When to use

Use Date Picker for issue dates, due dates, birthdays, effective dates, and
other fields where adding a time would create false precision. Use Calendar
when the month should stay visible, Date Range Picker for a bounded period, and
Schedule Picker for an exact moment.

```vue
<label for="due-date">Due date</label>
<DatePicker
  id="due-date"
  v-model="form.dueAt"
  name="dueAt"
  :min="minimumDueDate"
  required
/>
```

React uses `value` and `onValueChange`; Svelte uses `bind:value`. `min`, `max`,
and `unavailable` work the same way in all three frameworks. Typing an invalid
or unavailable date marks the field invalid without replacing the last valid
application value.

## Relational dates

Cross-field policy belongs in the form composition. An invoice can give the
issue date a `min` of today, give the due date a `min` of the day after the
issue date, and give the issue date a `max` of the day before the due date.
The same date is then impossible, past issuance is unavailable, and Date Picker
does not need an invoice-specific mode.

## Related components

- Calendar — an always-visible date workspace.
- Date Range Picker — a related start and end date.
- Schedule Picker — date, time, timezone, and natural-language scheduling.
- Input — a plain field when a calendar would add no value.
