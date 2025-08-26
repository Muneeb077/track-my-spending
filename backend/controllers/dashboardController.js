const Income = require("../models/Income")
const Expense = require("../models/Expense")
const { isValidObjectId, Types} = require("mongoose")

exports.getDashboardData = async (req, res) => {
    try{
        const userId = req.user.id;
        const userObjectId = new Types.ObjectId(String(userId));

        // Fetch Total Income and Expense
        const totalIncome = await Income.aggregate([
            { $match: {userId: userObjectId}},
            { $group: {_id: null, total: { $sum: "$amount"}}},
        ])

        console.log("totalIncome", {totalIncome, userId: isValidObjectId(userId)});

        const totalExpense = await Expense.aggregate([
            { $match: {userId: userObjectId}},
            { $group: {_id: null, total: { $sum: "$amount"}}},
        ])

        console.log("totalExpense", {totalExpense, userId: isValidObjectId(userId)});

        // Get income transaction in the last 60 days
        const last60DaysIncomeTransactions = await Income.find({
            userId,
            date: { $gte: new Date(Date.now() - 60*24*60*60*1000)}
        }).sort({date: -1});

        // Get total Income for last 60 days
        const incomeLast60Days = last60DaysIncomeTransactions.reduce(
            (sum, txn) => sum + (Number(txn.amount) || 0),
            0
        );

        // Get expense transaction in the last 30 days
        const last30DaysExpenseTransactions = await Expense.find({
            userId,
            date: { $gte: new Date(Date.now() - 30*24*60*60*1000)}
        }).sort({date: -1});

        // Get total Expense for last 30 days
        const expenseLast30Days = last30DaysExpenseTransactions.reduce(
            (sum, txn) => sum + (Number(txn.amount) || 0),
            0
        );

        // Fetch last 5 Transactions (Income + Expense)
        const lastTransaction = [
            ...(await Income.find({userId}).sort({date: -1}).limit(5)).map(
                (txn) => ({
                    ...txn.toObject(),
                    type: "income",
                })
            ),
            ...(await Expense.find({userId}).sort({date: -1}).limit(5)).map(
                (txn) => ({
                    ...txn.toObject(),
                    type: "expense",
                })
            ),
        ].sort((a,b) => b.date - a.date); // sort latest first

        //Final Response
        res.json({
            totalBalance:(totalIncome[0]?.total || 0) - (totalExpense[0]?.total || 0),
            totalIncome: totalIncome[0]?.total || 0,
            totalExpense: totalExpense[0]?.total || 0,
            last30DaysExpenses: {
                total: expenseLast30Days,
                transaction: last30DaysExpenseTransactions,
            },
            last60DaysIncome: {
                total: incomeLast60Days,
                transaction: last60DaysIncomeTransactions,
            },
            recentTransaction: lastTransaction,
        });
    } catch (error){
        res.status(500).json({message:"Server Error", error});
    }
}