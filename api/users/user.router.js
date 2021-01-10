const { createUser, validateUser, login, getUserByUsername, getUserById } = require("./user.controller");
const router = require("express").Router();
const { checkToken } = require("../../auth/jwt_validator");

router.post("/", createUser);

router.get("/validate", validateUser);
router.post("/login", login);
router.get("/getUserByUsername", checkToken,  getUserByUsername);
router.get("/getUserById", checkToken,  getUserById);

module.exports = router;

