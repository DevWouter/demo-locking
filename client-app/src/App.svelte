<script lang="ts">
	import Chat from "./Chat.svelte";
	import GridData from "./GridData.svelte";
</script>

<style>
	.container {
		max-height: 100vh;
		height: 100vh;
		display: grid;
		grid-template-columns: 1fr 1fr;
	}
</style>

<div class="container">
	<div class="left">
		<Chat />
	</div>
	<div class="right">
		<GridData />
	</div>
</div>
