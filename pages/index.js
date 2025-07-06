import { useState, useEffect } from 'react';
import Head from 'next/head';
import TransactionForm from '../components/TransactionForm';
import TransactionList from '../components/TransactionList';
import ExpenseChart from '../components/ExpenseChart';

export default function Home() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/transactions');
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }
      const data = await response.json();
      setTransactions(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Failed to load transactions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTransaction = async (transactionData) => {
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transactionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add transaction');
      }

      const newTransaction = await response.json();
      setTransactions(prev => [newTransaction, ...prev]);
      setSuccessMessage('Transaction added successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error adding transaction:', err);
      setError(err.message);
    }
  };

  const handleEditTransaction = async (transactionData) => {
    try {
      const response = await fetch('/api/transactions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingTransaction._id,
          ...transactionData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update transaction');
      }

      const updatedTransaction = await response.json();
      setTransactions(prev =>
        prev.map(t => t._id === updatedTransaction._id ? updatedTransaction : t)
      );
      setEditingTransaction(null);
      setSuccessMessage('Transaction updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error updating transaction:', err);
      setError(err.message);
    }
  };

  const handleDeleteTransaction = async (id) => {
    try {
      const response = await fetch('/api/transactions', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete transaction');
      }

      setTransactions(prev => prev.filter(t => t._id !== id));
      setSuccessMessage('Transaction deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error deleting transaction:', err);
      setError(err.message);
    }
  };

  const handleEdit = (transaction) => {
    setEditingTransaction({
      ...transaction,
      date: new Date(transaction.date).toISOString().split('T')[0]
    });
  };

  const handleCancelEdit = () => {
    setEditingTransaction(null);
  };

  const calculateBalance = () => {
    return transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  };

  const getBalanceColor = (balance) => {
    return balance >= 0 ? '#27ae60' : '#e74c3c';
  };

  if (error && !transactions.length) {
    return (
      <div className="container">
        <Head>
          <title>Personal Finance Tracker</title>
          <meta name="description" content="Track your personal finances with ease" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        
        <div className="error-state">
          <h2>Oops! Something went wrong</h2>
          <p>{error}</p>
          <button onClick={fetchTransactions} className="btn btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <Head>
        <title>Personal Finance Tracker</title>
        <meta name="description" content="Track your personal finances with ease" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="header">
        <h1>Personal Finance Tracker</h1>
        <p>Take control of your financial future</p>
      </header>

      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="error-state">
          <p>{error}</p>
          <button onClick={() => setError(null)} className="btn btn-secondary btn-small">
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1">
        <TransactionForm
          onSubmit={editingTransaction ? handleEditTransaction : handleAddTransaction}
          editingTransaction={editingTransaction}
          onCancel={handleCancelEdit}
        />

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Current Balance</h2>
            <div style={{ 
              fontSize: '2rem', 
              fontWeight: 'bold', 
              color: getBalanceColor(calculateBalance()),
              marginTop: '0.5rem'
            }}>
              ${calculateBalance().toFixed(2)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1">
          <ExpenseChart transactions={transactions} />
          <TransactionList
            transactions={transactions}
            onEdit={handleEdit}
            onDelete={handleDeleteTransaction}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}