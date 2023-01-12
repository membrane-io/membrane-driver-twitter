# Twitter Driver

A [Membrane.io](https://membrane.io/) driver for Twitter.

## Usage

1. Install the [Membrane VSCode Extension](https://marketplace.visualstudio.com/items?itemName=membrane.membrane).
2. Setup on extension your [Membrane's CLI binary (mctl)](https://membrane.io/download) path.
3. Login / Sign up with ```mctl login```.
4. Update the program on Membrane with the VSCode Command palette `(cmd+shift+p)`\
  ```> Membrame: Update current program```

## Actions

Configure [APP KEY and APP SECRET](https://developer.twitter.com/en/portal/register/keys)

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