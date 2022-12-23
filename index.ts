// `nodes` contain any nodes you add from the graph (dependencies)
// `root` is a reference to this program's root node
// `state` is an object that persist across program updates. Store data here.
import { root, state } from "membrane";
import { api, shouldFetch } from "./util";

export const Root = {
  parse({ args: { name, value } }) {
    // TODO
  },
  tweets: () => ({}),
  status: () => {
    return "Ready";
  },
  configure: ({ args: { token } }) => {
    state.token = token;
  },
};

// Resolvers for the TweetCollection type
export const TweetCollection = {
  async one({ args: { id }, info }) {
    if (!shouldFetch(info, ["id", "events"])) {
      return { id };
    }
    const res = await api("GET", `2/tweets/${id}`);
    return await res.json().then((json: any) => json && json.data);
  },
  async page({ self, args: { until_id } }) {
    const res = await api("GET", `2/tweets/search/`, { query: "", until_id });
    const { data, meta } = await res.json();
    const next = self.page({ until_id: meta.oldest_id });
    return { items: data, next };
  },
};
