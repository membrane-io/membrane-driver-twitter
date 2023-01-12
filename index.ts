// `nodes` contain any nodes you add from the graph (dependencies)
// `root` is a reference to this program's root node
// `state` is an object that persist across program updates. Store data here.
import { root, state, nodes } from "membrane";
import { api, parseQueryString } from "./util";

export const Root = {
  parse({ args: { name, value } }) {
    switch (name) {
      case "tweet": {
        // TODO: parse tweet url
        const url = new URL(value);
        const [, user, tweet] = url.pathname.split("/");
        return [root.tweets.one({ id: tweet })];
      }
    }
  },
  status() {
    if (!state.appId || !state.appSecret) {
      return "Please [create project, get API_KEYS and configure](https://developer.twitter.com/en/portal).";
    } else if (!state.oauth_token) {
      return `Please [authenticate with Twitter](${state.endpointUrl})`;
    } else {
      return `Ready`;
    }
  },
  user: async ({ args: { id, username } }) => {
    // get by id or username
    // to resolve followers collection we need to know the user id
    let path: string = `2/users/${id}`;
    if (username) {
      path = `2/users/by/username/${username}`;
    }
    const res = await api("GET", path);

    return await res.json().then((json: any) => json && json.data);
  },
  configure: async ({ args: { APP_KEY, APP_SECRET } }) => {
    state.endpointUrl = state.endpointUrl ?? (await nodes.endpoint.$get());
    state.appId = APP_KEY;
    state.appSecret = APP_SECRET;
  },
  tweet: async ({ args }) => {
    let poll = {};
    if (args.poll_options && args.poll_duration_minutes) {
      poll = {
        // poll options must be comma separated
        options: args.poll_options.split(","),
        duration_minutes: args.poll_duration_minutes,
      };
    }

    const data = {
      text: args.text,
      ...(poll && { poll }),
    };
    JSON.stringify(
      await api("POST", "2/tweets", {}, JSON.stringify({ ...data }))
    );
  },
  tweets: () => ({}),
};

export const TweetCollection = {
  async one({ args: { id } }) {
    const res = await api("GET", `2/tweets/${id}`);

    return await res.json().then((json: any) => json && json.data);
  },
  async page({ self, args }) {
    const { id } = self.$argsAt(root.user);
    const res = await api("GET", `2/users/${id}/tweets`, args);
    const { data, meta } = await res.json();

    const next = self.page({ pagination_token: meta.next_token });
    return { items: data, next };
  },
};

export const SearchCollection = {
  async one({ args: { id } }) {
    const res = await api("GET", `2/tweets/${id}`);

    return await res.json().then((json: any) => json && json.data);
  },
  async page({ self, args }) {
    const res = await api("GET", `2/tweets/search/recent`, args);

    const { data, meta } = await res.json();

    const next = self.page({ pagination_token: meta.next_token });
    return { items: data, next };
  },
};

export const FollowersCollection = {
  async page({ self, args }) {
    const { id } = self.$argsAt(root.user);
    const res = await api("GET", `2/users/${id}/followers`, args);
    const { data, meta } = await res.json();

    const next = self.page({ pagination_token: meta.next_token });
    return { items: data, next };
  },
};

export const MentionsCollection = {
  async page({ self, args }) {
    const { id } = self.$argsAt(root.user);
    const res = await api("GET", `2/users/${id}/mentions`, args);
    const { data, meta } = await res.json();

    const next = self.page({ pagination_token: meta.next_token });
    return { items: data, next };
  },
};

export const LikedCollection = {
  async page({ self, args }) {
    const { id } = self.$argsAt(root.user);
    const res = await api("GET", `2/users/${id}/liked_tweets`, args);
    const { data, meta } = await res.json();

    const next = self.page({ pagination_token: meta.next_token });
    return { items: data, next };
  },
};

export const LikingCollection = {
  async page({ self, args }) {
    const { id } = self.$argsAt(root.user.tweets.one);
    const res = await api("GET", `2/tweets/${id}/liking_users`, args);
    const { data, meta } = await res.json();

    const next = self.page({ pagination_token: meta.next_token });
    return { items: data, next };
  },
};

export const Tweet = {
  gref: ({ obj, self }) => {
    const { id } = self.$argsAt(root.user);
    if (id) {
      return root.user({ id }).tweets.one({ id: obj.id });
    }
    return root.tweets.one({ id: obj.id });
  },
  likingUsers: () => ({}),
};

export const User = {
  gref: ({ obj }) => {
    return root.user({ id: obj.id });
  },
  tweets: () => ({}),
  followers: () => ({}),
  mentions: () => ({}),
  liked: () => ({}),
};

export async function endpoint({ args: { path, query, headers, body } }) {
  switch (path) {
    case "/": {
      const req = await api("POST", "oauth/request_token", {
        oauth_callback: `${state.endpointUrl}/callback`,
        oauth_consumer_key: state.appId,
        x_auth_access_type: "write",
      });
      const oAuthRequest = parseQueryString(await req.text());
      state.oauth_token = oAuthRequest.oauth_token;
      return `<a href="/auth">Authenticate with Twitter</a>`;
    }
    case "/auth":
    case "/auth/": {
      return JSON.stringify({
        status: 303,
        headers: {
          location: `https://api.twitter.com/oauth/authorize?oauth_token=${state.oauth_token}`,
        },
      });
    }
    case "/callback": {
      const queryParams = parseQueryString(query);

      const reqOauth = await api("POST", "oauth/access_token", {
        oauth_verifier: queryParams.oauth_verifier,
        oauth_token: queryParams.oauth_token,
        oauth_consumer_key: state.appId,
      });

      const oAuthRequest = parseQueryString(await reqOauth.text());
      state.access = {
        key: oAuthRequest.oauth_token,
        secret: oAuthRequest.oauth_token_secret,
      };

      const res = await api("GET", `2/users/me`);
      const { data } = await res.json();

      return `Hey @${data.username} the twitter driver configured correctly`;
    }
    default:
      console.log("Unknown Endpoint:", path);
  }
}
