import Head from 'next/head'
import React, { useState, useEffect } from 'react'
import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react' //for ui
import { Auth } from 'aws-amplify'

export interface UserInterface {
  user: null | {
    username: string
    attributes: {
      email: string
    }
  }
}

function Profile() {
  const [user, setUser] = useState<UserInterface['user']>(null)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const user = await Auth.currentAuthenticatedUser()
    setUser(user)
  }
  if (!user) return null

  return (
    <div>
      <Head>
        <title>My Profile</title>
        <meta name='description' content='' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <main>
        <h1 className='text-3xl font-semibold tracking-wide mt-6'>
          My Profile
        </h1>
        <h3 className='font-medium text-gray-500 my-2'>
          Username: {user.username}
        </h3>
        <p className='text-sm text-gray-500 mb-6'>
          Email: {user.attributes.email}
        </p>
        <AmplifySignOut />
      </main>
    </div>
  )
}

// wrapping our Profile page with authentication
export default withAuthenticator(Profile)
