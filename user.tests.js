const prisma = require("./server/db");

describe("User model", () => {
  beforeEach(async () => {
    await prisma.$connect();
  });

  afterEach(async () => {
    await prisma.$disconnect();
  });

  // Create user test

  test("create a new user", async () => {
    const userData = {
      name: "Test User",
      email: "test@example.com",
      password: "password123",
    };

    const createdUser = await prisma.User.create({ data: userData });

    expect(createdUser).toHaveProperty("id");
    expect(createdUser.name).toBe(userData.name);
    expect(createdUser.email).toBe(userData.email);
  });

  // Find user test

  test("retrieve a user by ID", async () => {
    const user = await prisma.User.create({
      data: {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      },
    });

    const foundUser = await prisma.User.findUnique({ where: { id: user.id } });

    expect(foundUser).toEqual(user);
  });

  // Edit Review

  test("edit an existing review", async () => {
    const newReview = await prisma.review.create({
      data: {
        text: "Initial review text",
        rating: 4,
        userId: 46,
        itemId: 25,
      },
    });

    const updatedReviewData = {
      text: "Updated review text",
      rating: 5,
    };

    await prisma.review.update({
      where: {
        id: newReview.id,
      },
      data: updatedReviewData,
    });

    const updatedReview = await prisma.review.findUnique({
      where: {
        id: newReview.id,
      },
    });

    expect(updatedReview.text).toBe(updatedReviewData.text);
    expect(updatedReview.rating).toBe(updatedReviewData.rating);
  });
});
