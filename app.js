require("dotenv").config();
const express = require("express");
const app = express();
const userRouter = require("./api/users/user.router");
const accountRouter = require("./api/accounts/account.router");

app.use(express.json());

app.use("/api/users", userRouter);
app.use("/api/accounts", accountRouter);


app.listen(process.env.APP_PORT, () => {
    console.log("server up and running on PORT :", process.env.APP_PORT);
});