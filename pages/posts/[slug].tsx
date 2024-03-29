import { NextPage } from "next";
import Link from "next/link";
import Layout from "../../components/layout";
import Date from "../../components/date";
import PostList from "../../components/postsList";
import { getAllPostSlugs, getPostData } from "../../lib/posts";
import { getCategoryPosts } from "../../lib/categories";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import style from "react-syntax-highlighter/dist/cjs/styles/prism/dracula";
import { PostData } from "../../types";
import gfm from "remark-gfm";
import { useEffect } from "react";

type Props = {
  postData: PostData;
  relatedPosts: PostData[];
};

const CodeBlock = ({
  language,
  value,
}: {
  language: string;
  value: string;
}) => {
  const [lang, file] = language.split(":");
  return (
    <div className="markdown-body__codeblock-container">
      {file && (
        <div>
          <span className="markdown-body__codeblock-filename">{file}</span>
        </div>
      )}
      {/* eslint-disable-next-line react/no-children-prop */}
      <SyntaxHighlighter language={lang} style={style} children={value} />
    </div>
  );
};

// Fetch necessary data for the blog post using params.slug
export async function getStaticProps({ params }: { params: { slug: string } }) {
  const postData = await getPostData(params.slug);
  const relatedPosts = await (await getCategoryPosts(postData.category))
    .filter((post) => post.slug !== params.slug)
    .slice(0, 3);

  return {
    props: {
      postData,
      relatedPosts,
    },
  };
}

// Return a list of possible value for slug
export const getStaticPaths = async () => {
  const paths = getAllPostSlugs();
  return {
    paths,
    fallback: false,
  };
};

const Post: NextPage<Props> = ({ postData, relatedPosts }) => {
  const { slug, title, date, content, category, thumbnail } = postData;

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://platform.twitter.com/widgets.js";
    document.body.appendChild(script);
    // アンマウント時に一応scriptタグを消しておく
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const Img = ({ alt, src }: { alt: string; src: string }) => {
    return (
      <picture>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
        />
      </picture>
    );
  };

  return (
    <Layout>
      <div className="p-4 sm:p-7">
        <article>
          <small className="text-sm font-normal text-gray-400">
            <Date dateString={date} />
          </small>
          <h1 className="text-3xl font-bold my-3">{title}</h1>
          <Link href={`/categories/${category}`}>
            <a className="text-gray-500 underline">#{category}</a>
          </Link>
          <div className="markdown-body">
            <ReactMarkdown
              renderers={{ code: CodeBlock, image: Img }}
              plugins={[gfm]}
              children={content} // eslint-disable-line react/no-children-prop
              allowDangerousHtml={true}
            />
          </div>
        </article>
      </div>
      <div className="px-7 pb-2">
        <hr className="mb-8" />
        <h2 className="font-semibold text-gray-800 text-md mb-3">Related Posts</h2>
        <PostList posts={relatedPosts} />
      </div>
    </Layout>
  );
};

export default Post;
