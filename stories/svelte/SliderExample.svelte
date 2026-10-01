<script>
  import Slider from "../../registry/slider/svelte/Slider.svelte";
  let rollout = $state(40);
  let budget = $state([20, 80]);
  let effort = $state(2);
  let commits = $state(0);
</script>

<form
  class="w-full max-w-lg space-y-8 p-6"
  onsubmit={(event) => event.preventDefault()}
>
  <section>
    <label for="rollout" class="font-medium">Rollout</label><output
      class="float-end">{rollout}%</output
    >
    <Slider
      id="rollout"
      name="rollout"
      bind:value={rollout}
      oncommit={() => commits++}
      valueText={(value) => `${value} percent`}
    />
    <p>
      Committed adjustments: <output aria-label="Commit count">{commits}</output
      >
    </p>
  </section>
  <section>
    <h2 id="budget-label" class="font-medium">Budget</h2>
    <output>{budget.join(" – ")}</output>
    <Slider
      bind:value={budget}
      minStepsBetween={5}
      name={["minimum", "maximum"]}
      aria-labelledby="budget-label"
      labels={["Minimum budget", "Maximum budget"]}
    />
  </section>
  <section>
    <h2 class="font-medium">Thinking effort</h2>
    <output
      >{["", "Low", "Medium", "High", "Very high", "Ultra"][effort]}</output
    >
    <Slider
      bind:value={effort}
      min={1}
      max={5}
      marks={[2, 3, 4]}
      aria-label="Thinking effort"
      class={`h-16 [--thumb-size:3.5rem] **:data-[slot=slider-track]:h-12 **:data-[slot=slider-mark]:size-2 ${effort === 5 ? "text-violet-600 **:data-[slot=slider-fill]:bg-[linear-gradient(90deg,#2563eb,#a78bfa,#7c3aed)] **:data-[slot=slider-mark]:opacity-0" : "text-blue-500"}`}
    />
  </section>
  <Slider value={30} disabled aria-label="Unavailable" />
  <fieldset disabled>
    <legend>Unavailable form section</legend><Slider
      value={20}
      aria-label="Disabled by fieldset"
    />
  </fieldset>
  <div dir="rtl"><Slider value={40} aria-label="RTL value" /></div>
  <button
    type="reset"
    class="cursor-pointer rounded-lg border border-gray-300 px-4 py-2"
    >Reset</button
  >
</form>
