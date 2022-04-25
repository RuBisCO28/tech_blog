import { NextPage } from "next";
import Layout from "../components/layout";
import { getPageData } from "../lib/page";
import { isURL } from "../lib/helper";
import ReactMarkdown from "react-markdown";
import gfm from "remark-gfm";

export async function getStaticProps() {
  const pageData = await getPageData("about");
  return {
    props: {
      pageData,
    },
  };
}

type Props = {
  pageData: {
    title: string;
    content: string;
    slug: string;
  };
};

const About: NextPage<Props> = ({ pageData }) => {
  const { content } = pageData;

  return (
    <Layout>
      <div className="p-4 sm:p-7">
        <article className='prose max-w-none break-words'>
          <div className="markdown-body">
            <ReactMarkdown
              plugins={[gfm]}
              children={content}
            />
          </div>
        </article>
      </div>
    </Layout>
  );
};

export default About;