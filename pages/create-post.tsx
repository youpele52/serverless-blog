import Head from 'next/head'
import { withAuthenticator } from '@aws-amplify/ui-react'
import { useState, useRef } from 'react' // new
import { API, Storage } from 'aws-amplify' //storage is used for interacting with s3
import { v4 as uuid } from 'uuid'
import { useRouter } from 'next/router'
import SimpleMDE from 'react-simplemde-editor' // simple markdown editor
import 'easymde/dist/easymde.min.css' // styling simple markdown editor
import { createPost } from '../graphql/mutations'
import Image from 'next/image'

export interface PostInterface {
  title: string | number
  content: string
  id?: string
  coverImage?: string
}
const initialState: PostInterface = { title: '', content: '' }

function CreatePost() {
  const [post, setPost] = useState(initialState)
  const { title, content } = post
  const router = useRouter()
  const [image, setImage] = useState(null)
  const hiddenFileInput = useRef(null)

  const onChange = (e) => {
    setPost(() => ({ ...post, [e.target.name]: e.target.value }))
  }

  const createNewPost = async () => {
    if (!title || !content) return
    const id = uuid()
    post.id = id

    if (image) {
      const fileName = `${image.name}_${uuid()}` // renaming the image to something more unique
      post.coverImage = fileName
      await Storage.put(fileName, image) // uploading the image to s3
    }

    await API.graphql({
      query: createPost,
      variables: { input: post },
      // typscript to ignore the next line
      // @ts-ignore
      authMode: 'AMAZON_COGNITO_USER_POOLS', // we set the auth mode to cognito user pools, thus, only users only users that are signed in can create post
    })
    router.push(`/posts/${id}`)
  }

  const uploadImage = async () => {
    hiddenFileInput.current.click()
  }
  const handleChange = (e) => {
    const fileUploaded = e.target.files[0]
    if (!fileUploaded) return
    setImage(fileUploaded)
  }

  return (
    <div>
      <Head>
        <title>Create a New Post</title>
        <meta name='description' content='' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <main>
        <h1 className='text-3xl font-semibold tracking-wide mt-6  '>
          Create new post
        </h1>
        <input
          onChange={onChange}
          name='title'
          placeholder='Title'
          value={post.title}
          className='border-b pb-2 text-lg my-4 focus:outline-none w-full font-light text-gray-600 placeholder-gray-600 y-2'
        />
        {image && (
          <img src={URL.createObjectURL(image)} className='my-4' alt='image' />
        )}

        <SimpleMDE
          value={post.content}
          onChange={(value) => setPost({ ...post, content: value })}
        />

        <input
          type='file'
          ref={hiddenFileInput}
          className='absolute w-0 h-0' //using tailwind to hide input bar
          onChange={handleChange} // on change, after we must have selected an image, the image would be uploaded to s3
        />
        <button
          className='bg-blue-500 text-white font-semibold px-8 py-2 rounded-2xl mr-2 h-10'
          onClick={uploadImage} // onclick will reference the input with type file...using useRef
        >
          Upload Cover Image
        </button>

        <button
          className='mb-4 bg-green-500 text-white h-10 font-semibold px-8 rounded-2xl'
          onClick={createNewPost}
        >
          Create Post
        </button>
      </main>
    </div>
  )
}

// wrapping our createpost page with authentication
export default withAuthenticator(CreatePost)
