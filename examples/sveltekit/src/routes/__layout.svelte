<script>
	import { onMount } from 'svelte';
	import { goto, invalidate } from '$app/navigation';
	import { session } from '$app/stores';
	import { supabaseClient } from '$lib/db';
	import { SupaAuthHelper } from '@supabase/auth-helpers-svelte';

	const onUserUpdate = async (user) => {
		if (user && user.id) {
			console.log('User logged in!');
			await goto('/');
		}
	};
	// onMount(() => {
	// 	$session = { ...$session, hello: 'World' };
	// });
</script>

<SupaAuthHelper {supabaseClient} {onUserUpdate} {session}>
	<slot />
</SupaAuthHelper>
