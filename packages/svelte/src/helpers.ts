import {
  MAX_RETRIES,
  RETRY_INTERVAL,
  TOKEN_REFRESH_MARGIN
} from '@supabase/auth-helpers-shared';
import type { UserFetcher } from '@supabase/auth-helpers-shared';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import type { UserExtra } from './store';
import { type Writable, get } from 'svelte/store';
import { dequal } from 'dequal';

let networkRetries = 0;
let refreshTokenTimer: ReturnType<typeof setTimeout>;

const handleError = async (error: Response) => {
  if (typeof error.json !== 'function') {
    return String(error);
  }
  const err = await error.json();
  return {
    message:
      err.msg ||
      err.message ||
      err.error_description ||
      err.error ||
      JSON.stringify(err),
    status: error?.status || 500
  };
};

export const userFetcher: UserFetcher = async (url) => {
  const response = await fetch(url, { method: 'POST' }).catch(
    () => undefined
  );
  if (!response) {
    return { user: null, accessToken: null, error: 'Request failed' };
  }
  return response.ok
    ? response.json()
    : { user: null, accessToken: null, error: await handleError(response) };
};

let session: CheckSessionArgs["session"];

export const setUserAndAccessToken = (session: CheckSessionArgs["session"], user: User, accessToken: string) => {
  const currentSession = get(session);
  const currentUser = currentSession.user;
  const currentAccessToken = currentSession.accessToken;
  console.log(`setAccessToken outside...`, {
    currentAccessToken,
    currentAccessTokenIsEqual: dequal(currentAccessToken, accessToken)
  });
  if (!dequal(currentUser, user) || !dequal(currentAccessToken, accessToken)) {
    session.update((sess) => ({ ...sess, accessToken }))
  }
}

export const setError = (session: CheckSessionArgs["session"], error: Error | null) => {
  console.log(`setError...`);
  session.update((sess) => ({ ...sess, error }))
}

export interface Session {
  user?: User;
  accessToken?: string;
  isLoading?: boolean;
  error?: Error | null;
}

interface CheckSessionArgs {
  profileUrl: string;
  autoRefreshToken: boolean;
  supabaseClient: SupabaseClient;
  session: Writable<Session>;
}

let profileUrl: CheckSessionArgs["profileUrl"];
let autoRefreshToken: CheckSessionArgs["autoRefreshToken"];
let supabaseClient: CheckSessionArgs["supabaseClient"];

export const checkSession = async (props: CheckSessionArgs): Promise<void> => {
  try {
    get(props.session)
  } catch (e) {
    console.log({ e })
  }
  if (!profileUrl || !autoRefreshToken || !supabaseClient || !session) {
    profileUrl = props.profileUrl;
    autoRefreshToken = props.autoRefreshToken;
    supabaseClient = props.supabaseClient;
    session = props.session;
  }

  try {
    networkRetries++;
    const { user, accessToken, error } = await userFetcher(profileUrl);
    if (error) {
      if (error === 'Request failed' && networkRetries < MAX_RETRIES) {
        if (refreshTokenTimer) clearTimeout(refreshTokenTimer);
        refreshTokenTimer = setTimeout(
          checkSession,
          RETRY_INTERVAL ** networkRetries * 100 // exponential backoff
        );
        return;
      }
      setError(session, new Error(error));
    }
    networkRetries = 0;
    console.log(`checkSession before setUserAndAccessToken: `, {
      user,
      accessToken
    });
    if (accessToken) {
      supabaseClient.auth.setAuth(accessToken);
    }
    setUserAndAccessToken(session, user, accessToken);

    // Set up auto token refresh
    if (autoRefreshToken) {
      const expiresAt = (user as UserExtra).exp;
      let timeout = 20 * 1000;
      if (expiresAt) {
        const timeNow = Math.round(Date.now() / 1000);
        const expiresIn = expiresAt - timeNow;
        const refreshDurationBeforeExpires =
          expiresIn > TOKEN_REFRESH_MARGIN ? TOKEN_REFRESH_MARGIN : 0.5;
        timeout = (expiresIn - refreshDurationBeforeExpires) * 1000;
      }
      setTimeout(checkSession, timeout);
    }
  } catch (_e) {
    const err = new Error(`The request to ${profileUrl} failed`);
    console.log({ error: _e });
    setError(session, err);
  }
};