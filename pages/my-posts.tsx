import Head from 'next/head'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { API, Auth } from 'aws-amplify'
import { postsByUsername } from '../graphql/queries'
import { deletePost as deletePostMutation } from '../graphql/mutations'

export interface PostsInterface {
  postData: any
}

export default function MyPosts() {
  const [posts, setPosts] = useState([])
  useEffect(() => {
    fetchPosts()
  }, [])

  // this func fetches the post that created by a particular that is logged in
  // they'd have the full CRUD to do whatever they want with their post
  const fetchPosts = async () => {
    const { username } = await Auth.currentAuthenticatedUser()
    const postData: PostsInterface['postData'] = await API.graphql({
      query: postsByUsername,
      variables: { username },
      // auth mode here is public, anyone can view regardless of authentication
    })
    // console.log(postData)
    setPosts(postData.data.postsByUsername.items)
  }
  const deletePost = async (id) => {
    await API.graphql({
      query: deletePostMutation,
      variables: { input: { id } },
      // typscript to ignore the next line
      // @ts-ignore
      authMode: 'AMAZON_COGNITO_USER_POOLS',
    })
    fetchPosts()
  }

  return (
    <div className=''>
      <Head>
        <title>My Posts</title>
        <meta name='description' content='' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <main className='px-1'>
        <h1 className='text-3xl font-semibold tracking-wide mt-6 mb-2'>
          My Posts
        </h1>
        {posts.map((post, index) => (
          <div key={index} className='border-b border-gray-300	mt-8 pb-4'>
            <h2 className='text-xl font-semibold'>{post.title}</h2>
            <p className='text-gray-500 mt-2 mb-2'>Author: {post.username}</p>
            <Link href={`/edit-post/${post.id}`}>
              <a className='text-sm mr-4 text-blue-500'>Edit Post</a>
            </Link>
            <Link href={`/posts/${post.id}`}>
              <a className='text-sm mr-4 text-blue-500'>View Post</a>
            </Link>
            <button
              className='text-sm mr-4 text-red-500'
              onClick={() => deletePost(post.id)}
            >
              Delete Post
            </button>
          </div>
        ))}
      </main>
    </div>
  )
}
