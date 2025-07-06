import { useState } from 'react';

export default function TransactionList({ transactions, onEdit, onDelete, loading }) {
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      setDeletingId(id);
      try {
        await onDelete(id);
      } catch (error) {
        console.error('Error deleting transaction:', error);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(Math.abs(amount));
  };

  if (loading) {
    return (
      <div className="card">
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Transaction History</h2>
        <p className="card-description">
          View and manage all your transactions
        </p>
      </div>
      
      {transactions.length === 0 ? (
        <div className="empty-state">
          <h3>No transactions yet</h3>
          <p>Start by adding your first transaction above.</p>
        </div>
      ) : (
        <div className="transaction-list">
          {transactions.map((transaction) => (
            <div key={transaction._id} className="transaction-item">
              <div className="transaction-info">
                <div className="transaction-description">
                  {transaction.description}
                </div>
                <div className="transaction-date">
                  {formatDate(transaction.date)}
                </div>
              </div>
              
              <div className={`transaction-amount ${transaction.amount >= 0 ? 'positive' : 'negative'}`}>
                {transaction.amount >= 0 ? '+' : '-'}{formatAmount(transaction.amount)}
              </div>
              
              <div className="transaction-actions">
                <button
                  onClick={() => onEdit(transaction)}
                  className="btn btn-secondary btn-small"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(transaction._id)}
                  disabled={deletingId === transaction._id}
                  className="btn btn-danger btn-small"
                >
                  {deletingId === transaction._id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}