const { PrismaClient } = require("@prisma/client");
const { faker } = require("@faker-js/faker");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function seed() {
  console.log("Seeding DB");
  try {
    await prisma.Comment.deleteMany();
    await prisma.Review.deleteMany();
    await prisma.Item.deleteMany();
    await prisma.User.deleteMany();

    const users = Array.from({ length: 5 }).map(() => ({
      name: `${faker.person.firstName()} ${faker.person.lastName()}`,
      email: faker.internet.email(),
      password: bcrypt.hashSync(faker.internet.password(), 8),
    }));

    await prisma.User.createMany({ data: users });

    const itemData = [
      {
        name: "Playstation",
        description:
          "Pellentesque dignissim enim sit amet venenatis urna. Sed augue lacus viverra vitae congue eu consequat.",
      },
      {
        name: "Xbox",
        description:
          "Cras fermentum odio eu feugiat. Id volutpat lacus laoreet non curabitur gravida arcu. Sit amet aliquam id diam maecenas ultricies mi eget. Nunc faucibus a pellentesque sit amet porttitor. ",
      },
      {
        name: "PC",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Sollicitudin ac orci phasellus egestas tellus rutrum tellus pellentesque.",
      },
    ];

    await prisma.Item.createMany({ data: itemData });

    const createdUsers = await prisma.User.findMany();
    const createdItems = await prisma.Item.findMany();

    const reviews = [];

    createdUsers.forEach((user) => {
      createdItems.forEach((item) => {
        reviews.push({
          rating: faker.number.int({ min: 1, max: 5 }),
          text: faker.lorem.paragraph(),
          itemId: item.id,
          userId: user.id,
        });
      });
    });

    await prisma.Review.createMany({ data: reviews });

    const createdReviews = await prisma.Review.findMany();
    console.log(createdReviews);

    const comments = [];

    createdUsers.forEach((user) => {
      createdReviews.forEach((review) => {
        comments.push({
          text: faker.lorem.sentence(),
          reviewId: review.id,
          userId: user.id,
        });
      });
    });

    await prisma.Comment.createMany({ data: comments });

    console.log("DB seeded");
  } catch (error) {
    console.log(error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  seed();
}

module.exports = seed;
