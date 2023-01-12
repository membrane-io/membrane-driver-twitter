import { state } from "membrane";
import fetch from "node-fetch";
import OAuth from "oauth-1.0a";
import hash from "jshashes";

export async function api(
  method: string,
  path: string,
  query?: any,
  body?: string
): Promise<any> {
  // Set up OAuth SHA1
  const oauth = new OAuth({
    consumer: {
      key: state.appId,
      secret: state.appSecret,
    },
    signature_method: "HMAC-SHA1",
    hash_function: (baseString, key) => new hash.SHA1().b64_hmac(key, baseString),
  });

  // setup querystring 
  if (query) {
    Object.keys(query).forEach((key) =>
      query[key] === undefined ? delete query[key] : {}
    );
  }
  const querystr = query && Object.keys(query).length ? `?${new URLSearchParams(query)}` : "";
  const url = `https://api.twitter.com/${path}${querystr}`;

  // add params to headers
  const token = state.access || {};
  const authHeader = await oauth.toHeader(
    oauth.authorize({
      url: url,
      method,
    }, token)
  );

  // make request
  const req = {
    method,
    body,
    headers: {
      Authorization: authHeader["Authorization"],
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

// Parse Query String
export const parseQueryString = (search: string): Record<string, string> =>
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
    