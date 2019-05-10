import React, { useEffect, useCallback } from 'react';
import { withRouter } from 'react-router-dom';
import { useAsync } from 'react-async';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import withStyles from '@material-ui/core/styles/withStyles';
import green from '@material-ui/core/colors/green';
import red from '@material-ui/core/colors/red';
import frLocale from 'date-fns/locale/fr';
import format from 'date-fns/format';

import { withRoutes } from '../../Routes';
import { withRefreshSubject } from '../../Header';

const AccountRow = withRouter(({ startPeriod, account, routePaths, history }) => {

  const { id, displayName, balance } = account;

  const onClick = useCallback(() => {
    const url = routePaths.finance.children.account.reversePath({ id: account.id, startdate: startPeriod });
    history.push(url);
  }, []);

  return (
    <TableRow onClick={onClick}>
      <TableCell>{displayName}</TableCell>
      <TableCell>{balance} €</TableCell>
    </TableRow>
  );
});

function AccountsOverview({ classes, apiClient, refreshSubject, routePaths }) {

  const promiseFn = apiClient.finance.fetchAccountsOverview;

  const { data: overview, error, isLoading, reload } = useAsync({ promiseFn });

  useEffect(() => {
    const subscription = refreshSubject.subscribe({
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
    const accounts = jointAccounts.concat(currentAccounts).concat(savingAccounts);
    const credit = Math.round(overview.credit);
    const debit = Math.round(overview.debit);
    const balance = credit + debit;
    const colorCredit = { color: green['A400'] };
    const colorDebit = { color: red['A400'] };
    const colorBalance = balance > 0 ? colorCredit : colorDebit;
    const startPeriod = new Date(overview.startPeriod);

    return (
      <div className="accounts">
        <Grid container spacing={24}>
          <Grid item key="startdate">
            <Card>
              <CardContent>
                <Typography variant="h6">
                  Début de la période
                </Typography>
                <Typography variant="h3">
                  {format(startPeriod, 'D MMMM YYYY',  { locale: frLocale })}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item key="balance">
            <Card>
              <CardContent>
                <Typography variant="h6">
                  Balance
                </Typography>
                <Typography style={colorBalance} variant="h3">
                  {balance} €
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Compte</TableCell>
              <TableCell>Solde</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {accounts.map((account) => (
              <AccountRow
                key={account.id}
                startPeriod={overview.startPeriod}
                account={account}
                routePaths={routePaths}
                />
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }
}

export default withRoutes(withRefreshSubject(AccountsOverview));
