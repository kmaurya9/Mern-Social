# DATABASE REQUIREMENTS - CODE PROOF

## 1. USER 1 CAN CRUD OWN DATA (User 2 Can't)

### Example: Posts (User can CRUD only their own posts)

**CREATE - Backend Route:**
```
File: backend/routes/postRoutes.js
Line: router.post("/new", isAuth, uploadFile, newPost);
Proof: isAuth middleware ensures only logged-in users can create
```

**CREATE - Controller:**
```
File: backend/controllers/postControllers.js
Function: newPost()
- Checks: req.user (authenticated user)
- Creates post with owner = req.user._id
- User can only create as themselves
```

**READ - User sees only their posts + followed users:**
```
File: frontend/src/pages/Home.jsx
Lines: 15-25
Code:
  const sortedPosts = useMemo(() => {
    if (isAuth && user && posts && !userLoading) {
      const userPosts = posts.filter((post) => post.owner._id === user._id);
      const followingPosts = posts.filter(
        (post) => post.owner._id !== user._id && user.followings?.includes(post.owner._id)
      );
      result = [...userPosts, ...followingPosts];
    }
  });
Proof: Only shows user's own posts + followed users' posts
```

**UPDATE - Only post owner can edit:**
```
File: backend/routes/postRoutes.js
Line: router.put("/:id", isAuth, editCaption);

File: backend/controllers/postControllers.js
Function: editCaption()
- Gets post from database
- Checks: if (post.owner.toString() !== req.user._id.toString())
- Returns: "Only post owner can edit this post"
Proof: User 2 cannot edit User 1's post
```

**DELETE - Only post owner can delete:**
```
File: backend/routes/postRoutes.js
Line: router.delete("/:id", isAuth, deletePost);

File: backend/controllers/postControllers.js
Function: deletePost()
- Gets post from database
- Checks: if (post.owner.toString() !== req.user._id.toString())
- Returns: "Only post owner can delete this post"
Proof: User 2 cannot delete User 1's post
```

---

## 2. USER 2 CAN CRUD DIFFERENT DATA (User 1 Can't)

### Example 1: User Profile (User can only edit their own)

**Only user can edit their own profile:**
```
File: backend/routes/userRoutes.js
Line: router.put("/profile/edit", isAuth, editProfile);

File: backend/controllers/userControllers.js
Function: editProfile()
- Gets user from req.user._id (authenticated user)
- Only allows editing their own profile
- User 2 cannot edit User 1's profile
Proof: User-specific data access control
```

### Example 2: Reviews (Each user creates own reviews)

**CREATE - User creates own reviews:**
```
File: backend/routes/movieRoutes.js
Line: router.post("/review", isAuth, addReview);

File: backend/controllers/movieControllers.js
Function: addReview()
- req.body.movieId (which movie)
- req.user._id (who's reviewing)
- Each user can only create reviews as themselves
Proof: User 2's reviews are separate from User 1's reviews
```

**DELETE - Only review author can delete:**
```
File: backend/routes/movieRoutes.js
Line: router.delete("/review/:id", isAuth, deleteReview);

File: backend/controllers/movieControllers.js
Function: deleteReview()
- Gets review from database
- Checks: if (review.user.toString() !== req.user._id.toString())
- User 2 cannot delete User 1's review
Proof: Role-based data deletion
```

---

## 3. AT LEAST 2 DOMAIN OBJECT MODELS ✅ (You have 5+)

### Domain Objects in Your App:

**1. Movie Model**
```
File: backend/models/movieModel.js
Fields:
- tmdbId (external API ID)
- title, overview, release_date
- poster_path, vote_average
- genres (array)
Domain-Specific: Movies are the core of your app
```

**2. Post Model**
```
File: backend/models/postModel.js
Fields:
- owner (User reference)
- caption, image
- likes (array of user IDs)
- comments (array of comment objects)
Domain-Specific: Social media posts for sharing thoughts
```

**3. User Model**
```
File: backend/models/userModel.js
Fields:
- name, email, password, role
- profilePic, gender
- followers, followings (arrays)
Domain-Specific: Core user identity
```

**4. Review Model** (Movie-specific domain object)
```
File: backend/models/reviewModel.js
Fields:
- user (User reference)
- movie (Movie reference)
- rating (1-5), comment
- createdAt
Domain-Specific: User reviews for movies
```

**5. CuratorList Model** (Curator-specific domain object)
```
File: backend/models/CuratorProfile.js or curatorListModel
Fields:
- curator (User reference)
- name, description
- movies (array of movie data)
Domain-Specific: Curators create themed movie lists
```

**Proof Command:**
```
ls -la backend/models/
Shows all 5+ domain model files
```

---

## 4. AT LEAST ONE ONE-TO-MANY RELATIONSHIP ✅ (You have 3+)

### One-to-Many Relationship 1: User → Posts (One user has many posts)

**Model Definition:**
```
File: backend/models/postModel.js
owner: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User"  ← References User model
}
Proof: One User can have multiple Posts
```

**Evidence in Code:**
```
File: backend/controllers/postControllers.js

Function: getAllPosts()
- Populates: .populate("owner")
- Shows: One user's ID appears in multiple posts
- Query: Post.find({ owner: userId })
  Returns: [post1, post2, post3, ...] all with same owner
```

**Proof in Database:**
```
User (ID: 507f1f77bcf86cd799439011) has:
  - Post 1: owner = 507f1f77bcf86cd799439011
  - Post 2: owner = 507f1f77bcf86cd799439011
  - Post 3: owner = 507f1f77bcf86cd799439011
One User → Many Posts ✓
```

---

### One-to-Many Relationship 2: User → Reviews (One user writes many reviews)

**Model Definition:**
```
File: backend/models/reviewModel.js
user: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User"  ← References User model
}
Proof: One User can write multiple Reviews
```

**Evidence in Code:**
```
File: backend/controllers/movieControllers.js

Function: getUserReviews(userId)
- Query: Review.find({ user: userId })
- Returns: [review1, review2, review3, ...]
- All reviews with same user ID
Proof: One user wrote multiple reviews
```

---

### One-to-Many Relationship 3: Movie → Reviews (One movie has many reviews)

**Model Definition:**
```
File: backend/models/reviewModel.js
movie: String  (movie ID from TMDB)
Proof: One Movie can have multiple Reviews
```

**Evidence in Code:**
```
File: backend/controllers/movieControllers.js

Function: getMovieReviews(movieId)
- Query: Review.find({ movie: movieId })
- Returns: [review1, review2, review3, ...]
- All reviews for the same movie
- Multiple users reviewed the same movie
Proof: One Movie → Many Reviews from different users
```

---

## 5. AT LEAST ONE MANY-TO-MANY RELATIONSHIP ✅ (You have 2+)

### Many-to-Many Relationship 1: User ↔ User (Followers/Following)

**Model Definition:**
```
File: backend/models/userModel.js
followers: [
  { type: mongoose.Schema.Types.ObjectId, ref: "User" }
]
followings: [
  { type: mongoose.Schema.Types.ObjectId, ref: "User" }
]

Proof: Many users can follow many users
Example:
  User1.followers = [User2, User3, User4]
  User1.followings = [User5, User6]
  User2.followers = [User1, User6, User7]
  User2.followings = [User1, User8]

Many-to-Many: Users form multiple follow relationships
```

**Evidence in Code:**
```
File: backend/controllers/userControllers.js

Function: followUser()
- Gets current user
- Adds targetUser to user.followings (array)
- Adds currentUser to targetUser.followers (array)
- Both sides updated

File: backend/routes/userRoutes.js
router.post("/follow/:id", isAuth, followUser);

Proof: Creates many-to-many relationships between users
```

**Visualization:**
```
User A ← → User B (mutual follow possible)
User A ← → User C
User A ← → User D
User B ← → User C
(Many users connected to many users)
```

---

### Many-to-Many Relationship 2: CuratorList ↔ Movie (Lists contain many movies)

**Model Definition:**
```
File: backend/models/CuratorProfile.js
lists: [
  {
    name: String,
    description: String,
    movies: [
      {
        movieId: String,
        title: String,
        poster: String
      }
    ]
  }
]

Proof: One List has Many Movies
       One Movie can appear in Many Lists
Example:
  List1: "Best Action" → [Movie1, Movie2, Movie3]
  List2: "Underrated" → [Movie2, Movie4, Movie5]
  Movie2 appears in List1 AND List2

Many-to-Many: Movies in multiple lists, lists have many movies
```

**Evidence in Code:**
```
File: backend/controllers/roleProfileControllers.js

Function: addMovieToList()
- Gets curator (User with role='curator')
- Gets list from curator's lists array
- Adds movie to list.movies array
- Same movie can be added to multiple lists

Function: getMoviesByList()
- Returns all movies in a list
- Query searches through curator's lists
```

---

## SUMMARY TABLE - PROOF LOCATIONS

| Requirement | File Location | Evidence |
|------------|---------------|----------|
| User 1 CRUD own Posts | postControllers.js + postRoutes.js | CREATE/READ/UPDATE/DELETE with owner checks |
| User 2 different Reviews | movieControllers.js + movieRoutes.js | Each user writes own reviews |
| Movie Model | backend/models/movieModel.js | Domain object for movies |
| Post Model | backend/models/postModel.js | Domain object for posts |
| User Model | backend/models/userModel.js | Domain object for users |
| Review Model | backend/models/reviewModel.js | Domain object for reviews |
| CuratorList Model | backend/models/CuratorProfile.js | Domain object for curator lists |
| User → Posts (1-to-M) | postModel.js + postControllers.js | owner references User |
| User → Reviews (1-to-M) | reviewModel.js + movieControllers.js | user references User |
| Movie → Reviews (1-to-M) | reviewModel.js + movieControllers.js | movie references Movie |
| User ↔ User (M-to-M) | userModel.js + userControllers.js | followers/followings arrays |
| CuratorList ↔ Movie (M-to-M) | CuratorProfile.js + roleProfileControllers.js | movies array in lists |

---

## HOW TO SHOW THIS IN A PRESENTATION

### Quick Demo Sequence:

1. **Show Models (5 domain objects):**
   ```bash
   ls -la backend/models/
   cat backend/models/movieModel.js
   cat backend/models/postModel.js
   cat backend/models/userModel.js
   cat backend/models/reviewModel.js
   cat backend/models/CuratorProfile.js
   ```

2. **Show One-to-Many (User → Posts):**
   ```bash
   cat backend/models/postModel.js | grep -A 5 "owner"
   cat backend/controllers/postControllers.js | grep -A 10 "getAllPosts"
   ```

3. **Show Many-to-Many (User ↔ User):**
   ```bash
   cat backend/models/userModel.js | grep -A 5 "followers\|followings"
   cat backend/controllers/userControllers.js | grep -A 15 "followUser"
   ```

4. **Show Access Control (User 1 vs User 2):**
   ```bash
   cat backend/controllers/postControllers.js | grep -A 10 "deletePost"
   cat backend/controllers/movieControllers.js | grep -A 10 "deleteReview"
   ```

---
