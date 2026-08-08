# Date Range Picker

Date Range Picker selects one related start and end date and submits both as
stable `YYYY-MM-DD` values.

```sh
npx klean-ui@latest add date-range-picker
```

## When to use

Use Date Range Picker for reporting periods, booking windows, availability,
campaigns, or filters where two dates form one decision. Use two Date Pickers
when the fields have different business meanings or independent constraints,
such as invoice issue and due dates. Use Schedule Picker when either boundary
must include a time and timezone.

```vue
<DateRangePicker v-model="period" name="period">
  <template #start-label>From</template>
  <template #end-label>To</template>
</DateRangePicker>
```

The value is `{ start, end }`. A form named `period` submits
`period[start]` and `period[end]`. The calendar presents the contiguous range;
choosing an earlier second boundary orders the result rather than leaving an
impossible state. Same-day ranges are inclusive and valid unless the
application's availability rule says otherwise. The calendar anchors to the
field that opened it and flips or shifts before it leaves the viewport.

## Range rules

- Start and end are inclusive; choosing the same day twice is valid.
- Reverse pointer selection is ordered automatically. An inverted typed draft
  is reported as invalid and never mutates the committed value.
- Clearing the start clears both boundaries. An end typed without a start stays
  an invalid draft, so committed state is never end-only.
- `min` and `max` constrain both boundaries.
- An `unavailable` date cannot be selected or crossed. Date Range Picker owns a
  contiguous period, not a list of disconnected dates.
- Escape restores focus to the active field; outside dismissal leaves focus at
  the person's new target.
- Required, disabled, readonly, controlled, uncontrolled, locale, direction,
  and native form behavior remain available without extra configuration.

## Related components

Calendar, Date Picker, and Date Range Picker use date-only `YYYY-MM-DD` values.
Choose Schedule Picker when time and timezone must resolve to an exact ISO instant.

- Calendar — a single always-visible date-only `YYYY-MM-DD` surface.
- Date Picker — independent date-only `YYYY-MM-DD` fields and asymmetric business rules.
- Schedule Picker — date, time, and IANA timezone stored as an exact ISO instant.
- Popover — the floating surface used by the compact range picker.
