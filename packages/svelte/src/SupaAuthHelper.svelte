<script lang="ts">
  import type { SupabaseClient, User } from '@supabase/supabase-js';
  import { onMount } from 'svelte';
  import { derived } from 'svelte/store';
  import type { Writable } from 'svelte/store';
  import { setError, checkSession, type Session } from './helpers';
  // import { setIsLoading, setError, user, accessToken } from './store';

  // Props
  export let supabaseClient: SupabaseClient;
  export let callbackUrl = '/api/auth/callback';
  export let profileUrl = '/api/auth/user';
  export let autoRefreshToken = true;
  export let session: Writable<Session>;
  export let onUserUpdate = (user: User | null) => {};

  const wrapSession = () => {
    const mirror = derived(session, ($session) => $session);

    return {
      subscribe: mirror.subscribe,

      set: (value) => {
        session.set(value);
      },

      update: (cb) => {
        session.set(cb($session));
      }
    };
  };

  const wrappedSession = wrapSession();

  const handleVisibilityChange = async () => {
    if (document?.visibilityState === 'visible') {
      await checkSession({
        profileUrl,
        autoRefreshToken,
        supabaseClient,
        session: wrappedSession
      });
    }
  };

  onMount(() => {
    handleVisibilityChange();
    // user.subscribe((value) => {
    //   if (value) {
    //     $session = { ...$session, user: value, accessToken: $accessToken };
    //   }
    //   onUserUpdate(value);
    // });
    if (autoRefreshToken)
      window?.addEventListener('visibilitychange', handleVisibilityChange);
    const { data: authListener } = supabaseClient.auth.onAuthStateChange(
      async (event, _session) => {
        if (event === 'TOKEN_REFRESHED') return;
        // Forward session from client to server where it is set in a Cookie.
        // NOTE: this will eventually be removed when the Cookie can be set differently.
        await fetch(callbackUrl, {
          method: 'POST',
          headers: new Headers({ 'Content-Type': 'application/json' }),
          credentials: 'same-origin',
          body: JSON.stringify({ event, session: _session })
        }).then((res) => {
          if (!res.ok) {
            const err = new Error(`The request to ${callbackUrl} failed`);
            setError(wrappedSession, err);
          }
        });
        // Fetch the user from the API route
        await checkSession({
          profileUrl,
          autoRefreshToken,
          supabaseClient,
          session: wrappedSession
        });
      }
    );
    return () => {
      window?.removeEventListener('visibilitychange', handleVisibilityChange);
      authListener?.unsubscribe();
    };
  });
</script>

<slot />
