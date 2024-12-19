import HeaderBox from '@/components/HeaderBox'
import RightSidebar from '@/components/ui/RightSidebar';
import { TotalBalanceBox } from '@/components/ui/TotalBalanceBox';
import React from 'react'

const Home = () => {
    const loggedIn = { firstName: 'Soham', lastName: 'Mitra', email: 'soham.mitra7707@gmail.com' };


    return (
        <section className="home">
            <div className="home-content">
                <header className="home-header">
                    <HeaderBox
                        type="greeting"
                        title="Welcome"
                        user={loggedIn?.firstName || 'Guest'}
                        subtext="Access and manage your account and transactions efficiently"
                    />

                    <TotalBalanceBox
                        accounts={[]}
                        totalBanks={1}
                        totalCurrentBalance={7570.55}
                    />

                </header>

                RECENT TRANSACTION
            </div>

            <RightSidebar
                user={loggedIn}
                transactions={[]} //array
                banks={[{currentBalance: 1765.84}, {currentBalance: 4765.84}]} 
            />
        </section>
    )
}

export default Home