import path from "path";

export const config = {
  siteMeta: {
    title: "RuBisCO Blog",
    description: "Tech Blog by RuBisCO",
    author: "RuBisCO",
  },
  postDir: path.join(process.cwd(), "contents/posts"),
  repo: "https://github.com/RuBisCO28/tech_blog",
  siteRoot:
    process.env.NODE_ENV === "production"
      ? "https://ycopy-icopy.vercel.app"
      : "http://localhost:3000",
  categoryList: [
    { slug: "/", name: "All" },
    { slug: "/categories/JA", name: "JA" },
    { slug: "/categories/EN", name: "EN" },
  ],
};
