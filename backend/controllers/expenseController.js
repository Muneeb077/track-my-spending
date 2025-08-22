const xlxs = require("xlsx");
const Expense = require("../models/Expense");

exports.addExpense = async (req, res) => {
    const userId = req.user.id;

    try{
        const {icon, category, amount, date} = req.body;

        // Check for missing fields:
        if (!category || !amount || !date) {
            return res.status(400).json({message: "All fields are required" });
        }

        const newExpense = new Expense({
            userId,
            icon,
            category,
            amount,
            date: new Date(date)
        });

        await newExpense.save();
        res.status(200).json(newExpense);
    } catch (err) {
        res.status(500).json({message: "Server Error"});
    }
};

exports.getAllExpense = async (req, res) => {
    const userId = req.user.id;

    try {
        const expense = await Expense.find({userId}).sort({date: -1});
        res.json(expense)
    } catch (error) {
        res.status(500).json({message:"Server Error"});
    }
};

exports.downloadExpenseExcel = async (req, res) => {
    const userId = req.user.id;
    try{
        const expense = await Expense.find({userId}).sort({date:-1});

        // Prepare data for Excel
        const data = expense.map((item) => ({
            category: item.category,
            amount: item.amount,
            Date: item.date,
        }));

        const wb = writeXLSX.utils.book_new();
        const ws = writeXLSX.utils.json_to_sheet(data);
        xlxs.writeFile(wb, ws, "expense_details.xlxs");
        res.download('expense_detail.xlxs');
    } catch (error) {
        res.status(500).json({message: "Server Error"})
    }
};

exports.deleteExpense = async (req, res) => {
    try {
        await Expense.findByIdAndDelete(req.params.id);
        res.json({message: "Expense deleted successfully"});
    } catch (error) {
        res.status(500).json({message: "Server Error"});
    }
};