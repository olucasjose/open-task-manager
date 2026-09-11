import type { CloudAdapter } from './CloudAdapter';

export class DropboxAdapter implements CloudAdapter {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  async listFiles(): Promise<string[]> {
    const res = await fetch('https://api.dropboxapi.com/2/files/list_folder', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ path: '' })
    });
    
    if (!res.ok) throw new Error(`Dropbox listFolder error: ${await res.text()}`);
    
    const data = await res.json();
    return data.entries
      .filter((e: any) => e['.tag'] === 'file' && e.name.endsWith('.json'))
      .map((e: any) => e.name);
  }

  async readFile(filename: string): Promise<string | null> {
    const res = await fetch('https://content.dropboxapi.com/2/files/download', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Dropbox-API-Arg': JSON.stringify({ path: `/${filename}` }),
      }
    });

    if (res.status === 409) return null; // Not found
    if (!res.ok) throw new Error(`Dropbox readFile error: ${await res.text()}`);
    return await res.text();
  }

  async writeFile(filename: string, content: string): Promise<void> {
    const res = await fetch('https://content.dropboxapi.com/2/files/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/octet-stream',
        'Dropbox-API-Arg': JSON.stringify({
          path: `/${filename}`,
          mode: 'overwrite'
        }),
      },
      body: content
    });

    if (!res.ok) throw new Error(`Dropbox writeFile error: ${await res.text()}`);
  }

  async deleteFile(filename: string): Promise<void> {
    const res = await fetch('https://api.dropboxapi.com/2/files/delete_v2', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ path: `/${filename}` })
    });

    if (!res.ok && res.status !== 409) {
      throw new Error(`Dropbox deleteFile error: ${await res.text()}`);
    }
  }
}

export const DROPBOX_CLIENT_ID = import.meta.env.VITE_DROPBOX_CLIENT_ID || '';

export function getDropboxAuthUrl(codeChallenge: string, redirectUri: string) {
  if (!DROPBOX_CLIENT_ID) throw new Error('VITE_DROPBOX_CLIENT_ID não configurado no .env');
  
  const params = new URLSearchParams({
    client_id: DROPBOX_CLIENT_ID,
    response_type: 'code',
    redirect_uri: redirectUri,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    token_access_type: 'offline', // Necessário para obter refresh_token
  });

  return `https://www.dropbox.com/oauth2/authorize?${params.toString()}`;
}

export async function exchangeCodeForTokens(code: string, codeVerifier: string, redirectUri: string): Promise<{ accessToken: string, refreshToken: string }> {
  if (!DROPBOX_CLIENT_ID) throw new Error('VITE_DROPBOX_CLIENT_ID ausente no .env');

  const params = new URLSearchParams({
    code,
    grant_type: 'authorization_code',
    client_id: DROPBOX_CLIENT_ID,
    redirect_uri: redirectUri,
    code_verifier: codeVerifier,
  });

  const res = await fetch('https://api.dropboxapi.com/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString()
  });

  const data = await res.json();
  if (!res.ok) throw new Error(`Dropbox OAuth error: ${data.error_description || data.error}`);

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token
  };
}

export async function refreshAccessToken(refreshToken: string): Promise<string> {
  if (!DROPBOX_CLIENT_ID) throw new Error('VITE_DROPBOX_CLIENT_ID ausente no .env');

  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: DROPBOX_CLIENT_ID,
  });

  const res = await fetch('https://api.dropboxapi.com/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString()
  });

  const data = await res.json();
  if (!res.ok) throw new Error(`Dropbox Token Refresh error: ${data.error_description || data.error}`);

  return data.access_token;
}
