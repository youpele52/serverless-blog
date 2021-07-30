import '../styles/globals.css'
import '../configureAmplify'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Auth, Hub } from 'aws-amplify'

function MyApp({ Component, pageProps }) {
  const [signedInUser, setSignedInUser] = useState(false)

  useEffect(() => {
    authListener()
  }, [])
  const authListener = async () => {
    // hub listens for different types of event, here it will be used for listenig for Auth events
    Hub.listen('auth', (data) => {
      switch (data.payload.event) {
        case 'signIn':
          return setSignedInUser(true)
        case 'signOut':
          return setSignedInUser(false)
      }
    })
    try {
      await Auth.currentAuthenticatedUser()
      setSignedInUser(true)
    } catch (error) {}
  }
  // return <Component {...pageProps} />
  return (
    <div>
      {/* nav bar */}
      <nav className='p-6 border-b border-gray-500'>
        <Link href='/' passHref>
          <span className='mr-6 cursor-pointer'>Home</span>
        </Link>
        <Link href='/create-post' passHref>
          <span className='mr-6 cursor-pointer'>Create Post</span>
        </Link>

        {signedInUser && (
          <Link href='/my-posts' passHref>
            <span className='mr-6 cursor-pointer'>My Posts</span>
          </Link>
        )}
        <Link href='/profile' passHref>
          <span className='mr-6 cursor-pointer'>Profile</span>
        </Link>
      </nav>
      {/* app main component */}
      <div className='py-8 px-16'>
        <Component {...pageProps} />
      </div>
    </div>
  )
}

export default MyApp
