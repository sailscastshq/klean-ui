import LineChart from "../../registry/line-chart/react/LineChart.jsx";
import Sparkline from "../../registry/sparkline/react/Sparkline.jsx";

const signups = [
  { label: "Fri", value: 4, detail: "Friday, 4 signups" },
  { label: "Sat", value: 4, detail: "Saturday, 4 signups" },
  { label: "Sun", value: 9, detail: "Sunday, 9 signups" },
  { label: "Mon", value: 9, detail: "Monday, 9 signups" },
  { label: "Tue", value: 4, detail: "Tuesday, 4 signups" },
  { label: "Wed", value: 4, detail: "Wednesday, 4 signups" },
  { label: "Thu", value: 4, detail: "Thursday, 4 signups" },
];

const cpu = [
  { label: "12:00", value: 18, detail: "12:00, 18 percent" },
  { label: "12:10", value: 23, detail: "12:10, 23 percent" },
  { label: "12:20", value: 21, detail: "12:20, 21 percent" },
  { label: "12:30", value: 48, detail: "12:30, 48 percent" },
  { label: "12:40", value: 36, detail: "12:40, 36 percent" },
  { label: "12:50", value: 61, detail: "12:50, 61 percent" },
  { label: "13:00", value: 42, detail: "13:00, 42 percent" },
];

function LineChartExample({ caption, emptyLabel, className }) {
  return (
    <LineChart
      data={signups}
      caption={caption}
      emptyLabel={emptyLabel}
      className={className}
    />
  );
}

const meta = {
  title: "Components/LineChart",
  component: LineChartExample,
  parameters: { layout: "centered" },
  args: {
    caption: "Signups — last 7 days",
    emptyLabel: "No data",
    className: "w-[min(90vw,42rem)]",
  },
  argTypes: {
    caption: { control: "text" },
    emptyLabel: { control: "text" },
    className: { control: "text" },
  },
};

export default meta;

export const Playground = {};

export const Apps = {
  render: () => (
    <section className="grid w-[min(92vw,64rem)] gap-8 lg:grid-cols-2">
      <article className="dark rounded-xl bg-gray-950 p-6 text-white shadow-xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-gray-400">
          Slipway / Lookout
        </p>
        <div className="mt-4 flex items-end gap-4">
          <strong className="text-3xl tabular-nums">42%</strong>
          <Sparkline data={cpu} className="mb-1 h-7 w-32 text-emerald-400" />
        </div>
        <LineChart
          data={cpu}
          caption="CPU — last hour"
          className="mt-8 h-56 text-emerald-400 **:data-[slot=line-chart-caption]:text-white **:data-[slot=line-chart-labels]:text-gray-400"
        />
      </article>
      <article className="border-2 border-gray-950 bg-[#f7f3eb] p-6 text-gray-950 shadow-[6px_6px_0_0_#111]">
        <LineChart
          data={signups}
          caption="Signups — last 7 days"
          className="h-72 text-gray-950 dark:text-gray-950 **:data-[slot=line-chart-caption]:text-lg **:data-[slot=line-chart-labels]:text-gray-600"
        />
      </article>
    </section>
  ),
};

export const DataStates = {
  render: () => (
    <div className="grid w-[min(92vw,64rem)] gap-8 md:grid-cols-3">
      <LineChart data={[]} caption="Empty" className="h-56" />
      <LineChart
        data={[{ label: "Now", value: 8 }]}
        caption="One point"
        className="h-56"
      />
      <LineChart
        data={[
          { label: "A", value: -5 },
          { label: "B", value: 0 },
          { label: "C", value: 8 },
        ]}
        caption="Zero and negative"
        className="h-56"
      />
    </div>
  ),
};
