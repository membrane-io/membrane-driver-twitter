# Twitter Driver

A [Membrane.io](https://membrane.io/) driver for Twitter.

## Actions

Get [API key and secret](https://developer.twitter.com/en/portal/register/keys) from twitter dev portal and setup your [Callback URI](https://developer.twitter.com/en/docs/apps/callback-urls) with the program Endpoint URL.

$~~~~$`mctl action "twitter:configure(APP_KEY: '<string>', APP_SECRET: '<string>')"`

Create a tweet (it also support polls!)

$~~~~$`mctl action "twitter:tweet(text:'Hi!')"`

# Schema

### Types
```javascript
<Root>
    - Fields
        user(id | username) -> Ref <User>
        status() -> String
        tweets(search) -> Ref <SearchCollection>
    - Actions
        configure(token) -> Void
        tweet() -> Void
<User>
    - Fields
        id -> String
        username -> String
        name -> String
        tweets -> <TweetCollection>
        followers -> <FollowersCollection>
        mentions -> <MentionsCollection>
        liked -> <LikedCollection>
<SearchCollection>
    - Fields
       one(id) -> Ref <Tweet>
       page(pagination_token, max_results) -> Ref <TweetPage>
<TweetCollection>
    - Fields
       one(id) -> Ref <Tweet>
       page(pagination_token, max_results) -> Ref <TweetPage>
<TweetPage>
    - Fields
        items -> List[] <Tweet>
        next -> Ref <TweetPage>
<FollowersCollection>
    - Fields
       one(id) -> Ref <Tweet>
       page(pagination_token, max_results) -> Ref <FollowersPage>
<FollowersPage>
    - Fields
        items -> List[] <User>
        next -> Ref <FollowersPage>
<MentionsCollection>
    - Fields
       one(id) -> Ref <Tweet>
       page(pagination_token, max_results) -> Ref <MentionsPage>
<MentionsPage>
    - Fields
        items -> List[] <Tweet>
        next -> Ref <MentionsPage>
<LikedCollection>
    - Fields
       one(id) -> Ref <Tweet>
       page(pagination_token, max_results) -> Ref <LikedPage>
<LikedPage>
    - Fields
        items -> List[] <Tweet>
        next -> Ref <LikedPage>
<Tweet>
    - Fields
        id -> String
        text -> String
        likingUsers -> <LikingCollection>
<LikingCollection>
    - Fields
       one(id) -> Ref <Tweet>
       page(pagination_token, max_results) -> Ref <LikingPage>
<LikingPage>
    - Fields
        items -> List[] <User>
        next -> Ref <LikingPage>
```