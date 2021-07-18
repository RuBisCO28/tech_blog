import { NextPage } from "next";
import Layout from "../components/layout";
import PostsContainer from "../components/postsContainer";
//import { config } from "../site.config";
import { getSortedPostsData } from "../lib/posts";
import { PostData } from "@types";

export const getStaticProps = async () => {
  const allPostsData = getSortedPostsData();
  return {
    props: {
      allPostsData,
    },
  };
};

type Props = {
  allPostsData: PostData[];
};

const Home: NextPage<Props> = ({ allPostsData }) => {
  return (
   <Layout home>
      <div className="p-5">
        <PostsContainer posts={allPostsData} />
      </div>
   </Layout>
  );
};

export default Home;
