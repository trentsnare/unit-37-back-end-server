# Unit4.block37a

backend server

# setting up

- create db 

```
createdb review_site
```

- install dependencies

```
npm install
```

- start server in root directory of repo
- installation of node, express,jsonwebtokenm prisma, pg, uuid

- tables: users(id, name, password), items(rating), reviews(id ), comments

Users not logged in:

1. can view items average rating (add all ratings/count(ratings))
2. buttons to logginh in
3. button to signing up

logged in:

1. can post review
2. can post rating (only one per item, per user)
3. can view a list of reviews user has written (al where id === user.id)
4. can edit reviews user has written (update: rating, review)
5. can view lsit of comments user has written
6. edit and delete comments
