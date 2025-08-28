import React from 'react'
import DashboardLayout from '../../components/layouts/DashboardLayout'
import { useState } from 'react'
import IncomeOverview from '../../components/Income/IncomeOverview'
import axiosInstance from '../../utils/axiosinstance';
import { API_PATHS } from '../../utils/apiPaths';
import { useEffect } from 'react';
import Modal from '../../components/Modal';
import AddIncomeForm from '../../components/Income/AddincomeForm';
import {toast} from 'react-hot-toast'
import IncomeList from '../../components/Income/IncomeList';
import DeleteAlert from '../../components/DeleteAlert';
import { useUserAuth } from '../../hooks/userUserAuth';

const Income = () => {
  useUserAuth();
  const [incomeData, setIncomeData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDeleteAlert, setOpenDeleteAlert] = useState({
    show: false,
    data: null,
  });
  const [OpenAddIncomeModel, setOpenAddIncomeModel] = useState(false);
  
  // Get All income Details
  const fetchIncomeDetail = async () => {
    if (loading) return;

    setLoading(true);

    try{
      const response = await axiosInstance.post(
        `${API_PATHS.INCOME.GET_ALL_INCOME}`
      );
      if (response.data) {
        setIncomeData(response.data)
      }
    }catch(error){
      console.log("Something went wrong. Please try again", error)
    } finally{
      setLoading(false)
    }
  };

  // Add Income
  const handleAddincome = async (income) => {
    const {source, amount, date, icon} = income;

    // Validation Checks
    if(!source.trim()){
      toast.error("Source is required");
      return;
    }

    if(!amount || isNaN(amount) || Number(amount) <= 0){
      toast.error("Amount shoudl be a valid number greater than 0.");
      return;
    }

    if(!date){
      toast.error("Date is required");
      return;
    }

    try{
      await axiosInstance.post(API_PATHS.INCOME.ADD_INCOME, {
        source,
        amount,
        date,
        icon,
      });

      setOpenAddIncomeModel(false)
      toast.success("Income Added Successfully")
      fetchIncomeDetail();
    } catch(error) {
      console.error("Error adding income",
      error.response?.data?.message || error.message)
    }

  };
  
  // Delete Income
  const deleteIncome = async (id) => {
    try{
      await axiosInstance.delete(API_PATHS.INCOME.DELETE_INCOME(id))

      setOpenDeleteAlert({show:false, data:null})
      toast.success("Income transaction deleted successfully")
      fetchIncomeDetail()
    } catch (error) {
      console.error("Error deleting income",
      error.response?.data?.message || error.message)
    }
  };

  // Download Income Details
  const handleDownloadIncomeDetails = async () => {
    try{
      const response = await axiosInstance.get(
        API_PATHS.INCOME.DOWNLOAD_INCOME,
        {
          responseType: 'blob'
        }
      );

      // Create a URL for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'income-details.xlxs');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading income details:', error)
      toast.error('Failed to download the expense file.')
    }
  };

  useEffect(() => {
    fetchIncomeDetail()
    return () => {}
  }, [])
  
  
  return (
    <DashboardLayout activeMenu="Income">
      <div className='my-5 mx-auto'>
        <div className='grid grid-cols-1 gap-6'>
          <div className=''>
            <IncomeOverview
              transactions={incomeData}
              onAddIncome={() => setOpenAddIncomeModel(true)}
            />
          </div>

          <IncomeList
            transactions={incomeData}
            onDelete={(id) => {
              setOpenDeleteAlert({show:true, data:id});
            }}
            onDownload={handleDownloadIncomeDetails}
          />

        </div>

        <Modal
          isOpen={OpenAddIncomeModel}
          onClose={() => setOpenAddIncomeModel(false)}
          title='Add Income'
        >
          <AddIncomeForm onAddIncome={handleAddincome} />
        </Modal>

        <Modal
          isOpen={openDeleteAlert.show}
          onClose={() => setOpenDeleteAlert({ show: false, data: null })}
          title='Delete Income'
        >
          <DeleteAlert
            content="Do you want to delete this income?"
            onDelete={() => deleteIncome(openDeleteAlert.data)}
            onCancel={() => setOpenDeleteAlert({ show: false, data: null })}
          />
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default Income;