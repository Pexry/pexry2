import { getPayload } from "payload";
import config from "@payload-config";

const categories = [

  {
    name: "Other",
    color: "#f2f2f2",
    slug: "other",
  },
  {
    name: "Self Improvement",
    color: "#f2f2f2",
    slug: "self-improvement",
    subcategories: [
      { name: "Productivity", slug: "productivity" },
      { name: "Personal Development", slug: "personal-development" },
      { name: "Mindfulness", slug: "mindfulness" },
      { name: "Career Growth", slug: "career-growth" },
    ],
  },
    {
    name: "Photography",
    color: "#f2f2f2",
    slug: "photography",
    subcategories: [
      { name: "Portrait", slug: "portrait" },
      { name: "Landscape", slug: "landscape" },
      { name: "Street Photography", slug: "street-photography" },
      { name: "Nature", slug: "nature" },
      { name: "Macro", slug: "macro" },
    ],
  },
  {
    name: "Fitness & Health",
    color: "#f2f2f2",
    slug: "fitness-health",
    subcategories: [
      { name: "Workout Plans", slug: "workout-plans" },
      { name: "Nutrition", slug: "nutrition" },
      { name: "Mental Health", slug: "mental-health" },
      { name: "Diet", slug: "diet" },
    ],
  },

  {
    name: "Education",
    color: "#f2f2f2",
    slug: "education",
    subcategories: [
      { name: "Online Courses", slug: "online-courses" },
      { name: "Tutoring", slug: "tutoring" },
      { name: "Test Preparation", slug: "test-preparation" },
      { name: "Language Learning", slug: "language-learning" },
    ],
  },
  {
    name: "Social Media",
    color: "#f2f2f2",
    slug: "social-media",
    subcategories: [
      { name: "Others", slug: "others" },
      { name: "Telegram", slug: "telegram" },
      { name: "TikTok", slug: "tiktok" },
      { name: "Instagram", slug: "instagram" },
      { name: "Facebook", slug: "facebook" },
    ],
  },
  {
    name: "Video Games",
    color: "#f2f2f2",
    slug: "video-games",
    subcategories: [
      { name: "Mobile", slug: "mobile" },
      { name: "Nintendo", slug: "nintendo" },
      { name: "Playstation", slug: "playstation" },
      { name: "Xbox", slug: "xbox" },
      { name: "Pc", slug: "pc" },
    ],
  },
  {
  name: "Subscriptions",
    color: "#f2f2f2",
    slug: "subscriptions",
    subcategories: [
      { name: "Other Subs", slug: "other-subs" },
      { name: "Mobile Apps Subs", slug: "mobile-apps-subs" },
      { name: "Canva Pro", slug: "canva-pro" },
      { name: "Netflix", slug: "netflix" },
      { name: "Softwares Subs", slug: "softwares-subs" },
      { name: "Microsoft", slug: "microsoft" },
    ],
  },
  {
    name: "Software Development",
    color: "#f2f2f2",
    slug: "software-development",
    subcategories: [
      { name: "Web Development", slug: "web-development" },
      { name: "Mobile Development", slug: "mobile-development" },
      { name: "Game Development", slug: "game-development" },
      { name: "Programming Languages", slug: "programming-languages" },
    ],
  },
  {
    name: "Writing & Publishing",
    color: "#f2f2f2",
    slug: "writing-publishing",
    subcategories: [
      { name: "Fiction", slug: "fiction" },
      { name: "Novels", slug: "novels" },
      { name: "Blogging", slug: "blogging" },
      { name: "Copywriting", slug: "copywriting" },
      { name: "Self-Publishing", slug: "self-publishing" },
    ],
  },
  {
    name: "Business & Money",
    color: "#f2f2f2",
    slug: "business-money",
    subcategories: [
      { name: "Accounting", slug: "accounting" },
      { name: "Gigs & Side Projects", slug: "gigs-side-projects" },
      { name: "Investing", slug: "investing" },
      { name: "Management & Leadership", slug: "management-leadership" },
      { name: "Marketing & Sales", slug: "marketing-sales",},
      { name: "Personal Finance", slug: "personal-finance" },
      { name: "Trading", slug: "trading" },
    ],
  },
  {
    name: "Drawing & Painting",
    color: "#f2f2f2",
    slug: "drawing-painting",
    subcategories: [
      { name: "Watercolor", slug: "watercolor" },
      { name: "Acrylic", slug: "acrylic" },
      { name: "Oil", slug: "oil" },
      { name: "Pastel", slug: "pastel" },
      { name: "Charcoal", slug: "charcoal" },
    ],
  },
  {
    name: "Design",
    color: "#f2f2f2",
    slug: "design",
    subcategories: [
      { name: "UI/UX", slug: "ui-ux" },
      { name: "Graphic Design", slug: "graphic-design" },
      { name: "3D Modeling", slug: "3d-modeling" },
      { name: "Typography", slug: "typography" },
      { name: "Templates", slug: "templates" },
    ],
  },
  {
    name: "All",
    color: "#f2f2f2",
    slug: "all",
  },
]
const seed = async () => {
    const payload = await getPayload ({ config });

    // Create admin tenant
    const adminTenant= await payload.create({
      collection: "tenants",
      data: {
        name: "admin",
        slug: "admin",
      },
    });

    // Create admin user
    await payload.create({
      collection: "users",
      data: {
        email: "admin@demo.com",
        password: "demo",
        roles: ["super-admin"],
        username: "admin",
        tenants: [
          {
            tenant: adminTenant.id
          },
        ]
      },
      overrideAccess: true,
    });

    for (const category of categories) {
        const parentCategory = await payload.create({
            collection: "categories",
            data: {
                name: category.name,
                slug: category.slug,
                color: category.color,
                parent: null,
            },
        });
        for (const subCategory of category.subcategories || []){
            await payload.create({
                collection: "categories",
                data: {
                    name: subCategory.name,
                    slug: subCategory.slug,
                    parent: parentCategory.id,
                },
            });
        }
    }
}
try {
  await seed();
  console.log('Seeding completed successfully');
  process.exit(0);
} catch (error) {
  console.error('Error during seeding:', error);
  process.exit(1);
}