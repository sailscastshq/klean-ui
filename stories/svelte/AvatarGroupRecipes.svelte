<script>
  import AvatarGroup from "../../registry/avatar-group/svelte/AvatarGroup.svelte";
  import { avatarGroupPeople } from "../shared/avatar-group-people.js";
</script>

<AvatarGroup items={avatarGroupPeople} max={3} total={9} aria-label="Team">
  {#snippet overflow(count)}
    <a
      href="#team"
      class="ml-3 self-center text-sm font-medium underline underline-offset-4"
    >
      and {count} others
    </a>
  {/snippet}
</AvatarGroup>
