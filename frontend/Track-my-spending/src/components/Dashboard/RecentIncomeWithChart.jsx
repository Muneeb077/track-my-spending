import React from 'react'
import CustomPieChart from '../Charts/CustomPieChart'
import { useState } from 'react'
import { useEffect } from 'react';

const COLORS = ["#193cb8", "#00b8db", "#7f22fe", "#00d3f2"] // Need to change the color

const RecentIncomeWithChart = ({data, totalIncome}) => {
    
    const [chartData, setChartData] = useState([]);

    const prepareChartData = () => {
        const dataArr = data?.map((item) => ({
            name: item?.source,
            amount: item?.amount,
        }));

        setChartData(dataArr);
    };

    useEffect(() => {
        prepareChartData();

        return () => {};
    }, [data]);
  
    return (
   <div className='card'>
    <div className='flex items-center justify-between'>
        <h5 className='text-lg'>Last 60 Days Income</h5>
    </div>

    <CustomPieChart
        data={chartData}
        label="Total Income"
        totalAmount={`$${totalIncome}`}
        showTextAnchor
        colors={COLORS} 
    />
   </div>
  )
}

export default RecentIncomeWithChart