import { state } from "membrane";
import fetch from "node-fetch";

export async function api(
  method: string,
  path: string,
  query?: any,
  body?: string
) {
  if (!state.token) {
    throw new Error(
      "You must first invoke the configure action with an API token"
    );
  }
  if (query) {
    Object.keys(query).forEach((key) =>
      query[key] === undefined ? delete query[key] : {}
    );
  }
  const querystr =
    query && Object.keys(query).length ? `?${new URLSearchParams(query)}` : "";
  const url = `https://api.twitter.com/${path}${querystr}`;
  const req = {
    method,
    body,
    headers: {
      Authorization: `Bearer ${state.token}`,
      "Content-Type": "application/json",
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

// Determines if a query includes any fields that require fetching a given resource. Simple fields is an array of the
// fields that can be resolved without fetching
export const shouldFetch = (info: ResolverInfo, simpleFields: string[]) =>
  info.fieldNodes
    .flatMap(({ selectionSet: { selections } }) => {
      return selections;
    })
    .some(({ name: { value } }) => !simpleFields.includes(value));
