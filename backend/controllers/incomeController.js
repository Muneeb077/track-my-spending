const xlxs = require("xlsx")
const Income = require("../models/Income");


exports.addIncome = async (req, res) => {
    const userId = req.user.id;

    try{
        const {icon, source, amount, date} = req.body;

        // Check for missing fields:
        if (!source || !amount || !date) {
            return res.status(400).json({message: "All fields are required" });
        }

        const newIncome = new Income({
            userId,
            icon,
            source,
            amount,
            date: new Date(date)
        });

        await newIncome.save();
        res.status(200).json(newIncome);
    } catch (err) {
        res.status(500).json({message: "Server Error"});
    }
};

exports.getAllIncome = async (req, res) => {
    const userId = req.user.id;

    try {
        const income = await Income.find({userId}).sort({date: -1});
        res.json(income)
    } catch (error) {
        res.status(500).json({message:"Server Error"});
    }
};

exports.downloadIncomeExcel = async (req, res) => {
    const userId = req.user.id;
    try{
        const income = await Income.find({userId}).sort({date:-1});

        // Prepare data for Excel
        const data = income.map((item) => ({
            source: item.source,
            amount: item.amount,
            Date: item.date,
        }));

        const wb = writeXLSX.utils.book_new();
        const ws = writeXLSX.utils.json_to_sheet(data);
        xlxs.writeFile(wb, ws, "income_details.xlxs");
        res.download('income_detail.xlxs');
    } catch (error) {
        res.status(500).json({message: "Server Error"})
    }
};

exports.deleteIncome = async (req, res) => {

    try {
        await Income.findByIdAndDelete(req.params.id);
        res.json({message: "Income deleted successfully"});
    } catch (error) {
        res.status(500).json({message: "Server Error"});
    }
};