import React from 'react'
import { useState } from 'react';
import axiosInstance from '../../utils/axiosinstance';
import { API_PATHS } from '../../utils/apiPaths';
import toast from 'react-hot-toast';
import { useEffect } from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import ExpenseOverview from '../../components/Expense/ExpenseOverview';
import ExpenseList from '../../components/Expense/ExpenseList';
import Modal from '../../components/Modal';
import AddExpenseForm from '../../components/Expense/AddExpenseForm';
import DeleteAlert from '../../components/DeleteAlert';
import { useUserAuth } from '../../hooks/userUserAuth';

const Expense = () => {
  useUserAuth();
  const[expenseData, setExpenseData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDeleteAlert, setOpenDeleteAlert] = useState({
      show: false,
      data: null,
  });
  const [OpenAddExpenseModel, setOpenAddExpenseModel] = useState(false);
  
  // Fetch Expense details
  const fetchExpenseDetail = async () => {
    if (loading) return;

    setLoading(true)

    try{
      const response = await axiosInstance.post(
        `${API_PATHS.EXPENSE.GET_ALL_EXPENSE}`
      )

      if(response.data) {
        setExpenseData(response.data)
      }
    } catch (error) {
      console.log("Something went wrong. Please try again", error)
    }finally{
      setLoading(false)
    }
  }

  // Add Expense
  const handleAddExpense = async (expense) =>{
    const {category, amount, date, icon} = expense;

    // validation Checks
    if (!category.trim()){
      toast.error("Category is required")
      return
    }

    if (!amount || isNaN(amount) || Number(amount) <= 0){
      toast.error('Amount shoudl be a valid number greater than 0.')
      return
    }

    if(!date){
      toast.error("Date is required");
      return;
    }

    try{
      await axiosInstance.post(API_PATHS.EXPENSE.ADD_EXPENSE, {
        category,
        amount,
        date,
        icon
      });

      setOpenAddExpenseModel(false)
      toast.success("Expense Added Successfully")
      fetchExpenseDetail();
    } catch (error) {
      console.error("Error adding Expense",
      error.response?.data?.message || error.message)
    }
  }

  //Delete Expense
  const deleteExpense = async (id) => {
    try {
      await axiosInstance.delete(API_PATHS.EXPENSE.DELETE_EXPENSE(id))

      setOpenDeleteAlert({show:false, data:null})
      toast.success("Expense transaction deleted successfully")
      fetchExpenseDetail()
    } catch (error) {
      console.error("Error deleting expense",
      error.response?.data?.message || error.message)
    }
  }

  //
  const handleDownloadExpenseDetails = async () => {
    try{
      const response = await axiosInstance.get(
        API_PATHS.EXPENSE.DOWNLOAD_EXPENSE,
        {
          responseType: 'blob'
        }
      );

      // Create a URL for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'expense-details.xlxs');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading expense details:', error)
      toast.error('Failed to download the expense file.')
    }
  };

  useEffect(() => {
    fetchExpenseDetail()
    return () => {}
  },[])

  return (
    <DashboardLayout activeMenu="Expense">
      <div className='my-5 mx-auto'>
        <div className='grid grid-cols-1 gap-6'>
          <div className=''>
            <ExpenseOverview
              // Line Chart
              transactions={expenseData}
              onAddExpense = {() => setOpenAddExpenseModel(true)}
            />
          </div>

          <ExpenseList
            transactions={expenseData}
            onDelete={(id) => {
              setOpenDeleteAlert({show:true, data:id})
            }}
            onDownload={handleDownloadExpenseDetails}
          />

        </div>

        <Modal
          isOpen={OpenAddExpenseModel}
          onClose={() => setOpenAddExpenseModel(false)}
          title='Add Expense'
        >
          <AddExpenseForm onAddExpense={handleAddExpense}/>
        </Modal>

        <Modal
        isOpen={openDeleteAlert.show}
        onClose={() => setOpenDeleteAlert({show: false, data: null})}
        title='Delete Expense'
        >
          <DeleteAlert
          content="Do you want to delete this expense?"
          onDelete={() => deleteExpense(openDeleteAlert.data)}
          onCancel={() => setOpenDeleteAlert({show: false, data: null})}
          />

        </Modal>
      </div>
    </DashboardLayout>
  )
}

export default Expense;
