import Head from 'next/head'
import { useEffect, useState } from 'react'
import { API } from 'aws-amplify'
import { useRouter } from 'next/router'
import SimpleMDE from 'react-simplemde-editor'
import 'easymde/dist/easymde.min.css'
// import { v4 as uuid } from 'uuid'
import { updatePost } from '../../graphql/mutations'
import { getPost } from '../../graphql/queries'

export default function EditPost() {
  const [post, setPost] = useState(null)
  const router = useRouter()
  const { id } = router.query

  useEffect(() => {
    fetchPost()
  }, [id])

  const fetchPost = async () => {
    if (!id) return
    const postData = await API.graphql({
      query: getPost,
      variables: { id },
    })
    // @ts-ignore
    setPost(postData.data.getPost)
  }

  if (!post) return null

  const onChange = (e) => {
    setPost(() => ({ ...post, [e.target.name]: e.target.value }))
  }

  const { title, content } = post

  const updateCurrentPost = async () => {
    if (!title || !content) return
    await API.graphql({
      query: updatePost,
      variables: { input: { title, content, id } },
      // @ts-ignore
      authMode: 'AMAZON_COGNITO_USER_POOLS',
    })
    router.push('/my-posts')
  }
  return (
    <div>
      <Head>
        <title>Edit Post</title>
        <meta name='description' content='' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <main className=''>
        <h1 className='text-3xl font-semibold tracking-wide mt-7 mb-2'>
          Edit Post
        </h1>
        <input
          onChange={onChange}
          name='title'
          placeholder='Title'
          value={post.title}
          className='border-b pb-2 text-lg my-4 focus:outline-none w-full font-light
          text-gray-600 placeholder-gray-600 y-2'
        />
        <SimpleMDE
          value={post.content}
          onChange={(value) => setPost({ ...post, content: value })}
        />
        <button
          className='mb-4 bg-green-600 text-white font-semibold px-8 py-2 rounded-3xl'
          onClick={updateCurrentPost}
        >
          Update Post
        </button>
      </main>
    </div>
  )
}
