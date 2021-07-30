import { useState, useEffect } from 'react'
import Head from 'next/head'

import Link from 'next/link'
import { API } from 'aws-amplify'
import { listPosts } from '../graphql/queries'

export interface PostsInterface {
  postData: any
}

export default function Home() {
  const [posts, setPosts] = useState([])
  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    const postData: PostsInterface['postData'] = await API.graphql({
      query: listPosts,
      // auth mode here is public, anyone can view regardless of authentication
    })
    // console.log(postData)
    setPosts(postData.data.listPosts.items)
  }

  return (
    <div className=''>
      <Head>
        <title>Blog</title>
        <meta name='description' content='' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <main className='px-1'>
        <h1 className='text-3xl font-semibold tracking-wider mt-6 mb-2'>
          Posts
        </h1>
        <div className=''>
          {posts.map((post, index) => (
            <Link key={index} href={`/posts/${post.id}`}>
              <div className='cursor-pointer border-b border-gray-300 mt-8 pb-4'>
                <h2 className='text-xl font-semibold capitalize'>
                  {post.title}
                </h2>
                <p className='text-gray-500 mt-2'>Author: {post.username}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
