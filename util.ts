import { state } from "membrane";
import fetch from "node-fetch";

const api_url = "https://api.twitter.com"

export async function api(
  method: string,
  path: string,
  query?: any,
  body?: string
): Promise<any> {
  // setup querystring 
  if (query) {
    Object.keys(query).forEach((key) =>
      query[key] === undefined ? delete query[key] : {}
    );
  }
  const querystr = query && Object.keys(query).length ? `?${new URLSearchParams(query)}` : "";
  const url = `${api_url}/${path}${querystr}`;
  // make request
  const req = {
    method,
    body,
    headers: {
      Authorization: `Bearer ${state.access_token}`,
      "content-type": "application/json",
    },
  };
  return await fetch(url, req);
}

export type ResolverInfo = {
  fieldNodes: {
    selectionSet: {
      selections: any;
    };
  }[];
};

export async function getBearerToken(code) {
  const url = new URL(`${api_url}/2/oauth2/token`);
  const params = new URLSearchParams(url.search);
  params.append("code", code);
  params.append("grant_type", "authorization_code");
  params.append("client_id", state.client_id);
  params.append("redirect_uri", `${state.endpointUrl}/callback`);
  params.append("code_verifier", state.code_challenge);
  const req = {
    method: "POST",
    body: params.toString(),
    headers: {
      Authorization:
        `Basic ${Buffer.from(`${state.client_id}:${state.client_secret}`).toString('base64')}`,
        "Content-Type": "application/x-www-form-urlencoded",
    },
  };
  const res = await fetch(`${api_url}/2/oauth2/token`, req);
  return await res.json();
}

// Parse Query String
export const parseQS = (search: string): Record<string, string> =>
  (search || '')
    .replace(/^\?/g, '')
    .split('&')
    .reduce((acc, query) => {
      const [key, value] = query.split('=');

      if (key) {
        acc[key] = decodeURIComponent(value);
      }

      return acc;
    }, {} as Record<string, string>);

// Determines if a query includes any fields that require fetching a given resource. Simple fields is an array of the
// fields that can be resolved without fetching
export const shouldFetch = (info: ResolverInfo, simpleFields: string[]) =>
  info.fieldNodes
    .flatMap(({ selectionSet: { selections } }) => {
      return selections;
    })
    .some(({ name: { value } }) => !simpleFields.includes(value));
    