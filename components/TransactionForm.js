import { useState } from 'react';

export default function TransactionForm({ onSubmit, editingTransaction, onCancel }) {
  const [formData, setFormData] = useState({
    amount: editingTransaction?.amount || '',
    date: editingTransaction?.date || new Date().toISOString().split('T')[0],
    description: editingTransaction?.description || '',
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.amount) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(formData.amount) || parseFloat(formData.amount) === 0) {
      newErrors.amount = 'Amount must be a valid number';
    }
    
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 3) {
      newErrors.description = 'Description must be at least 3 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const transactionData = {
        ...formData,
        amount: parseFloat(formData.amount),
        description: formData.description.trim(),
      };
      
      await onSubmit(transactionData);
      
      // Reset form if not editing
      if (!editingTransaction) {
        setFormData({
          amount: '',
          date: new Date().toISOString().split('T')[0],
          description: '',
        });
      }
    } catch (error) {
      console.error('Error submitting transaction:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">
          {editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}
        </h2>
        <p className="card-description">
          {editingTransaction ? 'Update your transaction details' : 'Enter your transaction details below'}
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="amount" className="form-label">
              Amount
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              step="0.01"
              value={formData.amount}
              onChange={handleChange}
              className={`form-input ${errors.amount ? 'error' : ''}`}
              placeholder="Enter amount (use negative for expenses)"
            />
            {errors.amount && <span className="form-error">{errors.amount}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="date" className="form-label">
              Date
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className={`form-input ${errors.date ? 'error' : ''}`}
            />
            {errors.date && <span className="form-error">{errors.date}</span>}
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="description" className="form-label">
            Description
          </label>
          <input
            type="text"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className={`form-input ${errors.description ? 'error' : ''}`}
            placeholder="Enter transaction description"
          />
          {errors.description && <span className="form-error">{errors.description}</span>}
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary"
          >
            {isSubmitting ? 'Saving...' : (editingTransaction ? 'Update Transaction' : 'Add Transaction')}
          </button>
          
          {editingTransaction && (
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}