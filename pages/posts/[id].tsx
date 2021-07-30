import Head from 'next/head'
import { API, Storage } from 'aws-amplify'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import ReactMarkdown from 'react-markdown'
import { listPosts, getPost } from '../../graphql/queries'
import { PostsInterface } from '../index'

function Post({ post }) {
  const [coverImage, setCoverImage] = useState(null)
  const router = useRouter()

  useEffect(() => {
    updateCoverImage()
  }, [])

  const updateCoverImage = async () => {
    if (post.coverImage) {
      // if the post has an associated image, this func will get the image url from aws s3
      //   note this is temp assigned url that we can use in the app
      const imageKey = await Storage.get(post.coverImage)
      setCoverImage(imageKey)
    }
  }

  if (router.isFallback) {
    //   using fallback route to return a loading screen
    return <div>Loading...</div>
  }

  return (
    <div>
      <Head>
        <title>
          {post.title} by {post.username}
        </title>
        <meta name='description' content='' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <main>
        <h1 className='text-5xl mt-4 font-semibold tracking-wide '>
          {post.title}
        </h1>
        {coverImage && <img src={coverImage} className='mt-4' />}
        <p className='text-sm font-light my-4 '>by {post.username}</p>
        <div className='mt-8'>
          <ReactMarkdown className='prose' children={post.content} />
        </div>
      </main>
    </div>
  )
}

export default Post

// getstaticpaths will create paths using individual posts from listPosts
export async function getStaticPaths() {
  const postData: PostsInterface['postData'] = await API.graphql({
    query: listPosts,
  })
  const paths = postData.data.listPosts.items.map((post) => ({
    params: { id: post.id },
  }))
  return {
    paths,
    fallback: true,
  }
}
// getstaticprops will create the actual props for each individual post

export async function getStaticProps({ params }) {
  const { id } = params
  const postData: PostsInterface['postData'] = await API.graphql({
    query: getPost,
    variables: { id },
  })
  return {
    props: {
      post: postData.data.getPost,
    },
    revalidate: 60, //revalidating ie rebuilding the page every 60s to get the latest updated posts
  }
}
