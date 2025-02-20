"use server";

import {
  ACHClass,
  CountryCode,
  TransferAuthorizationCreateRequest,
  TransferCreateRequest,
  TransferNetwork,
  TransferType,
} from "plaid";

import { plaidClient } from "../plaid";
import { parseStringify } from "../utils";

import { getTransactionsByBankId } from "./transaction.actions";
import { getBanks, getBank } from "./user.actions";

// Get multiple bank accounts
export const getAccounts = async ({ userId }: getAccountsProps) => {
  try {
    // get banks from db
    const banks = await getBanks({ userId });

    const accounts = await Promise.all(
      banks?.map(async (bank: Bank) => {
        // get each account info from plaid
        const accountsResponse = await plaidClient.accountsGet({
          access_token: bank.accessToken,
        });
        const accountData = accountsResponse.data.accounts[0];

        // get institution info from plaid
        const institution = await getInstitution({
          institutionId: accountsResponse.data.item.institution_id!,
        });

        const account = {
          id: accountData.account_id,
          availableBalance: accountData.balances.available!,
          currentBalance: accountData.balances.current!,
          institutionId: institution.institution_id,
          name: accountData.name,
          officialName: accountData.official_name,
          mask: accountData.mask!,
          type: accountData.type as string,
          subtype: accountData.subtype! as string,
          appwriteItemId: bank.$id,
          shareableId: bank.shareableId,
        };

        return account;
      })
    );

    const totalBanks = accounts.length;
    const totalCurrentBalance = accounts.reduce((total, account) => {
      return total + account.currentBalance;
    }, 0);

    return parseStringify({ data: accounts, totalBanks, totalCurrentBalance });
  } catch (error) {
    console.error("An error occurred while getting the accounts:", error);
  }
};

// Get one bank account
export const getAccount = async ({ appwriteItemId }: getAccountProps) => {
  try {
    // Fetch bank details from database
    const bank = await getBank({ documentId: appwriteItemId });
    if (!bank) throw new Error("Bank not found");

    // Fetch account info from Plaid
    const accountsResponse = await plaidClient.accountsGet({
      access_token: bank.accessToken,
    });

    const accountData = accountsResponse.data.accounts?.[0];
    if (!accountData) throw new Error("No account data found");

    // Fetch institution details
    const institution = await getInstitution({
      institutionId: accountsResponse.data.item.institution_id!,
    });

    // Fetch transfer transactions from Appwrite
    const transferTransactionsData = await getTransactionsByBankId({
      bankId: bank.$id,
    });

    const transferTransactions = transferTransactionsData.documents.map(
      (transferData: Transaction) => ({
        id: transferData.$id,
        name: transferData.name!,
        amount: transferData.amount!,
        date: transferData.$createdAt,
        paymentChannel: transferData.channel,
        category: transferData.category,
        type: transferData.senderBankId === bank.$id ? "debit" : "credit",
      })
    );

    // Fetch transactions from Plaid
    const transactions = await getTransactions({
      accessToken: bank.accessToken,
    });

    // Construct account object
    const account = {
      id: accountData.account_id,
      availableBalance: accountData.balances.available ?? 0,
      currentBalance: accountData.balances.current ?? 0,
      institutionId: institution?.institution_id || "Unknown",
      name: accountData.name,
      officialName: accountData.official_name || "N/A",
      mask: accountData.mask || "XXXX",
      type: accountData.type as string,
      subtype: accountData.subtype as string,
      appwriteItemId: bank.$id,
    };

    // Merge and sort all transactions by date
    const allTransactions = [
      ...(Array.isArray(transactions) ? transactions : []),
      ...(Array.isArray(transferTransactions) ? transferTransactions : []),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return parseStringify({
      data: account,
      transactions: allTransactions,
    });
  } catch (error: any) {
    console.error(
      "An error occurred while getting the account:",
      error.message || error
    );
    return null;
  }
};

// Get bank info
export const getInstitution = async ({
  institutionId,
}: getInstitutionProps) => {
  try {
    const institutionResponse = await plaidClient.institutionsGetById({
      institution_id: institutionId,
      country_codes: ["US"] as CountryCode[],
    });

    const intitution = institutionResponse.data.institution;

    return parseStringify(intitution);
  } catch (error) {
    console.error("An error occurred while getting the accounts:", error);
  }
};

// Get transactions
export const getTransactions = async ({
  accessToken,
}: getTransactionsProps) => {
  let hasMore = true;
  let transactions: any[] = [];
  let cursor: string | undefined = undefined;

  try {
    while (hasMore) {
      const response = await plaidClient.transactionsSync({
        access_token: accessToken,
        cursor: cursor || undefined, // Ensure cursor is valid
      });

      const data = response.data;

      transactions = [
        ...transactions,
        ...data.added.map((transaction) => ({
          id: transaction.transaction_id,
          name: transaction.name,
          paymentChannel: transaction.payment_channel,
          type: transaction.payment_channel,
          accountId: transaction.account_id,
          amount: transaction.amount,
          pending: transaction.pending,
          category: transaction.category?.[0] || "",
          date: transaction.date,
          image: transaction.logo_url,
        })),
      ];

      cursor = data.next_cursor;
      hasMore = data.has_more;
    }

    return parseStringify(transactions);
  } catch (error: any) {
    console.error("Error fetching transactions:", {
      message: error.message,
      response: error?.response?.data,
      status: error?.response?.status,
      stack: error.stack,
    });
    return null; // Return null instead of crashing
  }
};
