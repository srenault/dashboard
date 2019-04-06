import React, { useEffect } from 'react';
import { useAsync } from "react-async";
import { Link } from "react-router-dom";

function renderAccount({ id, displayName, balance }) {
  return (
    <p key={id}><Link to={`/finance/accounts/${id}`}>{displayName} ~ {balance} €</Link></p>
  );
}

export default function AccountsOverview({ apiClient, refreshSubscription }) {

  const promiseFn = apiClient.finance.fetchAccountsOverview;

  const { data: overview, error, isLoading, reload } = useAsync({ promiseFn });

  useEffect(() => {
    const subscription = refreshSubscription.subscribe({
      next: () => reload(),
    });

    return () => subscription.unsubscribe();
  });

  if (isLoading) {

    return (<div>Loading...</div>);

  } else {
    const jointAccounts = overview.accounts.filter((account) => account.type === 'joint_account');
    const currentAccounts = overview.accounts.filter((account) => account.type === 'current_account');
    const savingAccounts = overview.accounts.filter((account) => account.type === 'saving_account');
    const balance = Math.round(overview.credit + overview.debit);

    return (
      <div className="accounts">
        <div>{ overview.startPeriod } - { balance } €</div>
        {jointAccounts.map(renderAccount)}
        {currentAccounts.map(renderAccount)}
        {savingAccounts.map(renderAccount)}
      </div>
    );
  }
}
