import { NextPage } from "next";
import Layout from "../../components/layout";
import PostsContainer from "../../components/postsContainer";
import { getCategoryPosts, getCategoryNames } from "../../lib/categories";
import { PostData } from "../../types";

type Props = {
  categoryName: string;
  posts: PostData[];
};

export async function getStaticProps({ params }: { params: { name: string } }) {
  const posts = await getCategoryPosts(params.name);
  return {
    props: {
      categoryName: params.name,
      posts,
    },
  };
}

export const getStaticPaths = async () => {
  const paths = getCategoryNames();
  return {
    paths,
    fallback: false,
  };
};

const Category: NextPage<Props> = ({ posts, categoryName }) => {
  return (
    <Layout>
      <div className="p-5">
        <PostsContainer posts={posts} />
      </div>
    </Layout>
  );
};

export default Category;
