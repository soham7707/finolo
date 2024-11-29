import Link from 'next/link'
import React from 'react'
import Image from 'next/image'

const RightSidebar = ( {user, transactions, banks }:
  RightSidebarProps) => {
  return (
   <aside className= "right-sidebar">
    <section className="flex flex-col pb-8">
      <div className="profile-banner"/>
        <div className= "profile">
          <div className="profile-img">
            <span className="text-5xl font-bold text-blue-500 ">
              {user.firstName[0]}
            </span>
          </div>  
          <div className="profile-details">
            <h1 className="profile-name">
              {user.firstName} {user.lastName}
            </h1>
            <p className="profile-email">
              {user.email}

            </p>
          </div>
        </div>
    </section>

    <section className="banks">
      <div className="flex w-full justify-between">
        <h2 className="header-2">
          My Banks
        </h2>
        <Link href="/" className="flex gap-2">
        <Image 
          src = "/icons/plus.svg"
          width={20}
          height={20}
          alt = "plus"
        />
        </Link>     
      </div>
    </section>
   </aside>
  )
}

export default RightSidebar