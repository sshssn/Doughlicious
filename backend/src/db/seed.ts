import "dotenv/config"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding database...")

  // Clear existing data
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.product.deleteMany()
  await prisma.loyaltyHistory.deleteMany()
  await prisma.user.deleteMany()

  const products = [
    {
      name: "Original Glazed®",
      description: "The iconic donut that started it all. Our Original Glazed® donut is a light and airy treat with a signature sweet glaze that melts in your mouth. Perfect for any time of day.",
      price: 1.99,
      category: "Classics",
      imageUrl: "/products/original-glazed.png",
      stock: 100,
    },
    {
      name: "Chocolate Iced Glazed",
      description: "A chocolate lover's dream. We take our classic Original Glazed® donut and hand-dip it in a rich, smooth chocolate icing for the perfect balance of flavors.",
      price: 2.29,
      category: "Classics",
      imageUrl: "/products/chocolate-iced.png",
      stock: 85,
    },
    {
      name: "Boston Cream",
      description: "A fan favorite! This yeast shell donut is filled with a silky vanilla custard and topped with a thick layer of chocolate icing. It's like a mini dessert in every bite.",
      price: 2.49,
      category: "Filled",
      imageUrl: "/products/boston-cream.png",
      stock: 60,
    },
    {
      name: "Strawberry Dream",
      description: "Pretty in pink! A fluffy yeast donut dipped in strawberry icing and topped with colorful rainbow sprinkles. A fun and fruity treat for all ages.",
      price: 2.29,
      category: "Specialty",
      imageUrl: "/products/strawberry-dream.png",
      stock: 75,
    },
    {
      name: "Blueberry Bliss",
      description: "A cake donut bursting with real blueberry flavor and coated in a light, sweet glaze. It's the perfect morning pick-me-up or afternoon snack.",
      price: 2.49,
      category: "Cake",
      imageUrl: "/products/blueberry-bliss.png",
      stock: 50,
    },
    {
      name: "Maple Frosted",
      description: "Experience the taste of autumn all year round. A soft yeast donut topped with a rich, creamy maple frosting that pairs perfectly with your morning coffee.",
      price: 2.29,
      category: "Classics",
      imageUrl: "/products/maple-frosted.png",
      stock: 70,
    },
    {
      name: "Apple Fritter",
      description: "A rustic and hearty treat. Our Apple Fritter is packed with cinnamon and real apple chunks, then glazed to perfection. Crunchy on the outside, soft on the inside.",
      price: 2.99,
      category: "Specialty",
      imageUrl: "/products/apple-fritter.png",
      stock: 40,
    },
    {
      name: "Raspberry Jelly",
      description: "A classic filled donut. A soft yeast shell filled with tangy, sweet raspberry jelly and dusted with a fine layer of powdered sugar.",
      price: 2.49,
      category: "Filled",
      imageUrl: "/products/strawberry-dream.png",
      stock: 55,
    },
    {
      name: "Old Fashioned Glazed",
      description: "A timeless classic. This cake donut has a crunchy exterior and soft interior, with plenty of nooks and crannies to hold our signature glaze.",
      price: 2.19,
      category: "Cake",
      imageUrl: "/products/original-glazed.png",
      stock: 65,
    },
    {
      name: "Double Chocolate Indulgence",
      description: "For the serious chocolate addict. A rich chocolate cake donut topped with a thick layer of chocolate icing. Double the chocolate, double the joy.",
      price: 2.59,
      category: "Cake",
      imageUrl: "/products/chocolate-iced.png",
      stock: 45,
    },
  ]

  for (const p of products) {
    await prisma.product.create({
      data: p,
    })
  }

  console.log("Database seeded successfully!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
