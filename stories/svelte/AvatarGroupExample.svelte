<script>
  import AvatarGroup from "../../registry/avatar-group/svelte/AvatarGroup.svelte";
  import { avatarGroupPeople } from "../shared/avatar-group-people.js";

  let {
    max = 4,
    total = 42,
    avatarClass = "",
    class: className = "",
  } = $props();
</script>

<AvatarGroup
  items={avatarGroupPeople}
  {max}
  {total}
  {avatarClass}
  class={className}
  aria-label="Maintainers"
/>
