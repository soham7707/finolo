import HeaderBox from '@/components/HeaderBox';
import RecentTransactions from '@/components/ui/RecentTransactions';
import RightSidebar from '@/components/ui/RightSidebar';
import TotalBalanceBox from '@/components/ui/TotalBalanceBox';
import { getAccount, getAccounts } from '@/lib/actions/bank.actions';
import { getLoggedInUser } from '@/lib/actions/user.actions';

const Home = async ({ searchParams }: { searchParams: URLSearchParams }) => {
  // Ensure proper async handling of searchParams
  const params = new URLSearchParams(searchParams.toString());

  const id = params.get("id") || "";
  const currentPage = Number(params.get("page")) || 1;

  const loggedIn = await getLoggedInUser();
  if (!loggedIn) return <p>User not found. Please log in.</p>;

  const accounts = await getAccounts({ userId: loggedIn.$id });
  if (!accounts || !accounts.data?.length) return <p>No accounts found.</p>;

  const accountsData = accounts.data;
  const appwriteItemId = id || accountsData[0]?.appwriteItemId || "";

  let account = null;
  try {
    if (appwriteItemId) {
      account = await getAccount({ appwriteItemId });
    }
  } catch (error) {
    console.error("Error fetching account:", error);
  }

  return (
    <section className="home">
      <div className="home-content">
        <header className="home-header">
          <HeaderBox 
            type="greeting"
            title="Welcome"
            user={loggedIn?.firstName || 'Guest'}
            subtext="Access and manage your account and transactions efficiently."
          />

          <TotalBalanceBox 
            accounts={accountsData}
            totalBanks={accounts?.totalBanks}
            totalCurrentBalance={accounts?.totalCurrentBalance}
          />
        </header>

        <RecentTransactions 
          accounts={accountsData}
          transactions={account?.transactions || []} 
          appwriteItemId={appwriteItemId}
          page={currentPage}
        />
      </div>

      <RightSidebar 
        user={loggedIn}
        transactions={account?.transactions || []}
        banks={accountsData?.slice(0, 2)}
      />
    </section>
  );
};

export default Home;
