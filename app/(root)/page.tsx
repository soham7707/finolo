import HeaderBox from '@/components/HeaderBox'
import RightSidebar from '@/components/ui/RightSidebar';
import { TotalBalanceBox } from '@/components/ui/TotalBalanceBox';
import React from 'react'

const Home = () => {
    const loggedIn = { firstName : 'Soham'};

    
    return (
        <section className="home">
            <div className="home-content">
                <header className = "home-header">
                    <HeaderBox
                    type = "greeting"
                    title = "Welcome"
                    user = {loggedIn?.firstName || 'Guest'}
                    subtext = "Access and manage your account and transactions efficiently"
                    />

                    <TotalBalanceBox
                        accounts = {[]}
                        totalBanks = {1}
                        totalCurrentBalance = {7570.55}
                    />

                </header>

                RECENT TRANSACTION
            </div>

            <RightSidebar
                user = {loggedIn}
                transactions = {[]} //array
                banks = {[]} // array 
                />
        </section>
    )
}

export default Home