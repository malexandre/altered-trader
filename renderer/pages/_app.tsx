import type { AppProps } from 'next/app'
import React, { useState, useEffect, useReducer } from 'react'
import Head from 'next/head'
import Navbar from '../components/navbar'
import { Friend, FriendCard } from '../app/fetchFriendTradelist'
import { ToastContainer, Bounce } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import '../styles/globals.css'
import { collectionReducer, UserCollectionContext, UserCollectionDispatchContext } from '../app/collectionContext'
import { BearerTokenContext } from '../app/bearerTokenContext'
import { FriendsContext, FriendTradelistsContext } from '../app/friendsContext'

function MyApp({ Component, pageProps }: AppProps) {
  const [collection, collectionDispatch] = useReducer(collectionReducer, [])

  const [friends, setFriends] = useState<Friend[]>([])
  const [friendsTradelists, setFriendsTradelists] = useState<{ [friendId: string]: FriendCard[] }>({})

  const [bearerToken, setBearerToken] = useState('')

  useEffect(() => {
    const userCollection = localStorage.getItem('userCollection')
    if (userCollection) {
      collectionDispatch({ collection: JSON.parse(userCollection), type: 'collectionFetched' })
    }

    const friends = localStorage.getItem('friends')
    if (friends) {
      setFriends(JSON.parse(friends))
    }

    const friendsTradelists = localStorage.getItem('friendsTradelists')
    if (friendsTradelists) {
      setFriendsTradelists(JSON.parse(friendsTradelists))
    }
  }, [])

  return (
    <BearerTokenContext.Provider value={bearerToken}>
      <UserCollectionContext.Provider value={collection}>
        <UserCollectionDispatchContext.Provider value={collectionDispatch}>
          <FriendsContext.Provider value={{ friends, setFriends }}>
            <FriendTradelistsContext.Provider value={{ friendsTradelists, setFriendsTradelists }}>
              <Head>
                <title>AlteredTrader</title>
              </Head>
              <div className="h-screen flex flex-col">
                <Navbar bearerToken={bearerToken} setBearerToken={setBearerToken} />{' '}
                <main className="flex-1 overflow-auto p-6">
                  <ToastContainer
                    position="top-right"
                    autoClose={5000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    draggable
                    pauseOnHover
                    pauseOnFocusLoss={false}
                    theme="dark"
                    transition={Bounce}
                  />
                  <Component {...pageProps} />
                </main>
              </div>
            </FriendTradelistsContext.Provider>
          </FriendsContext.Provider>
        </UserCollectionDispatchContext.Provider>
      </UserCollectionContext.Provider>
    </BearerTokenContext.Provider>
  )
}

export default MyApp
