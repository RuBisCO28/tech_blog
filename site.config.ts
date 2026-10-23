import path from "path";

export const config = {
  postDir: path.join(process.cwd(), "contents/posts"),
  categoryList: [
    { slug: "/", name: "All" },
    { slug: "/categories/JA", name: "JA" },
    { slug: "/categories/EN", name: "EN" },
  ],
};
