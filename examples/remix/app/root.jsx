import { useEffect } from 'react';
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useFetcher,
  useLoaderData
} from 'remix';
import supabase from '~/utils/supabase';
import styles from './styles/app.css';

export function meta() {
  return { title: 'New Remix App' };
}

export function links() {
  return [{ rel: 'stylesheet', href: styles }];
}

export const loader = async () => {
  return {
    env: {
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY
    }
  };
};

export default function App() {
  const { env } = useLoaderData();
  const fetcher = useFetcher();

  useEffect(() => {
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN') {
        fetcher.submit(
          { accessToken: session.access_token },
          {
            method: 'post',
            action: '/auth/set-cookie'
          }
        );
      }

      if (event === 'SIGNED_OUT') {
        fetcher.submit(null, {
          method: 'post',
          action: '/auth/remove-cookie'
        });
      }
    });
  }, []);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.env = ${JSON.stringify(env)}`
          }}
        />
        <ScrollRestoration />
        <Scripts />
        {process.env.NODE_ENV === 'development' && <LiveReload />}
      </body>
    </html>
  );
}
