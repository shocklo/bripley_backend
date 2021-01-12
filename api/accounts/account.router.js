const { getTransfers, doTransfer, doDeposit, doWithdraw, myAccount } = require("./account.controller");
const router = require("express").Router();
const { checkToken } = require("../../auth/jwt_validator");

router.get("/", checkToken, getTransfers);
router.post("/transfer", checkToken, doTransfer);
router.post("/doDeposit", checkToken, doDeposit);
router.post("/doWithdraw", checkToken, doWithdraw);
router.post("/myAccount", checkToken, myAccount);


module.exports = router;

