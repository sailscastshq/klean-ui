<script>
  import Avatar from "../../registry/avatar/svelte/Avatar.svelte";
  import { avatarImages } from "../shared/avatar-images.js";

  let {
    image = true,
    alt = "Ada Okafor",
    fallback = "AO",
    class: className = "",
  } = $props();
</script>

<Avatar src={image ? avatarImages.ada : ""} {alt} class={className}>
  {fallback}
</Avatar>
