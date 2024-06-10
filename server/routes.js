const express = require("express");
const router = express.Router();
const prisma = require("./db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authenticateToken = require("./api/authenticate");

router.use(express.json());
router.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).send(err.message || "Internal server error.");
  next(err);
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findFirst({
      where: {
        email: email,
      },
    });

    if (!user) {
      return res.status(401).json("Invalid email or password");
    }

    const validatePassword = await bcrypt.compare(password, user.password);

    if (!validatePassword) {
      return res.status(401).json("Invalid email or password");
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);

    res.json({ token });
  } catch (error) {
    console.error(error);
  }
});

// Get all items

router.get("/items", async (req, res) => {
  const items = await prisma.Item.findMany();
  res.json(items);
});

// Get specific item and it's review and comments

router.get("/items/:id", async (req, res) => {
  const itemId = parseInt(req.params.id);
  const items = await prisma.Item.findUnique({
    where: {
      id: itemId,
    },
    include: {
      reviews: {
        include: {
          user: true,
          comments: {
            include: {
              user: true,
            },
          },
        },
      },
    },
  });
  res.json(items);
});

// Get all reviews

router.get("/reviews", async (req, res) => {
  const reviews = await prisma.Review.findMany();
  res.json(reviews);
});

// Get all comments

router.get("/comments", async (req, res) => {
  const comments = await prisma.Comment.findMany();
  res.json(comments);
});

// Get user reviews

router.get("/users/reviews", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const userReviews = await prisma.Review.findMany({
      where: {
        userId: userId,
      },
    });
    res.json(userReviews);
  } catch (error) {
    console.error(error);
  }
});

// Get user comments

router.get("/users/comments", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const userComments = await prisma.Comment.findMany({
      where: {
        userId: userId,
      },
    });
    res.json(userComments);
  } catch (error) {
    console.error(error);
  }
});

// Create new item

router.post("/items", authenticateToken, async (req, res) => {
  try {
    const newItem = await prisma.Item.create({
      data: {
        name: req.body.name,
        description: req.body.description,
      },
    });
    res.json(newItem);
  } catch (error) {
    console.log(error);
  }
});

// Create new user

router.post("/users", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    await prisma.User.create({
      data: {
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
      },
    });
    res.status(200).send("User created.");
  } catch (error) {
    console.log(error);
  }
});

// Create new review

router.post("/reviews", authenticateToken, async (req, res) => {
  try {
    await prisma.Review.create({
      data: {
        text: req.body.text,
        rating: req.body.rating,
        itemId: req.body.itemId,
        userId: req.body.userId,
      },
    });
    res.status(200).send("Review created.");
  } catch (error) {
    console.log(error);
  }
});

// Create new comment

router.post("/comments", authenticateToken, async (req, res) => {
  try {
    await prisma.Comment.create({
      data: {
        text: req.body.text,
        reviewId: req.body.reviewId,
        userId: req.body.userId,
      },
    });
    res.status(200).send("Comment created.");
  } catch (error) {
    console.log(error);
  }
});

// Delete item

router.delete("/items/:id", async (req, res) => {
  try {
    const itemId = parseInt(req.params.id);
    const item = await prisma.Item.delete({
      where: {
        id: itemId,
      },
    });
    res.send(item);
  } catch (error) {
    console.log(error);
  }
});

// Delete user

router.delete("/users/:id", authenticateToken, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    await prisma.User.delete({
      where: {
        id: userId,
      },
    });
    res.status(200).send("User deleted");
  } catch (error) {
    console.log(error);
  }
});

// Delete review

router.delete("/reviews/:id", authenticateToken, async (req, res) => {
  try {
    const reviewId = parseInt(req.params.id);
    await prisma.Review.delete({
      where: {
        id: reviewId,
      },
    });
    res.status(200).send("Review deleted");
  } catch (error) {
    console.error(error);
  }
});

// Delete comment

router.delete("/comments/:id", authenticateToken, async (req, res) => {
  try {
    const commentId = parseInt(req.params.id);
    await prisma.Comment.delete({
      where: {
        id: commentId,
      },
    });
    res.status(200).send("Comment deleted.");
  } catch (error) {
    console.error(error);
  }
});

// Edit review

router.put("/review/:id", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const reviewId = parseInt(req.params.id);

    const review = await prisma.Review.findUnique({
      where: {
        id: reviewId,
      },
      select: {
        userId: true,
      },
    });

    if (!review || review.userId !== userId) {
      return res.status(401).json({ error: "Not authorized to edit review." });
    }

    await prisma.Review.update({
      where: {
        id: reviewId,
      },
      data: {
        text: req.body.text,
        rating: req.body.rating,
      },
    });
  } catch (error) {
    console.error(error);
  }
});

// Edit comment

router.put("/comment/:id", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const commentId = parseInt(req.params.id);

    const comment = await prisma.Comment.findUnique({
      where: {
        id: commentId,
      },
      select: {
        userId: true,
      },
    });

    if (!comment || comment.userId !== userId) {
      return res.status(401).json({ error: "Not authorized to edit comment" });
    }

    await prisma.Comment.update({
      where: {
        id: commentId,
      },
      data: {
        text: req.body.text,
      },
    });

    res.status(200).json({ message: "Edit successful" });
  } catch (error) {
    console.error(error);
  }
});

module.exports = router;
