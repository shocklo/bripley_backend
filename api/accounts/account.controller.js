const { getMyAccount, getMyTransferHistory, transfer, deposit, withdraw } = require("./account.service");
const { getUserById, getUserByUsername } = require("../users/user.service")
const { hashSync, genSaltSync, compareSync } = require("bcrypt");
const { sign } = require("jsonwebtoken");

module.exports = {

    getTransfers: (req, res) => {
        const query = req.query;
        getMyTransferHistory(req.decoded.result.id, (err, results) => {
            if (err) {
                return res.status(500).json({
                    success: 0,
                    message: "Database connection errror"
                });
            }
            return res.status(200).json({
                success: 1,
                data: results
            });


        });
    },

    doTransfer: (req, res) => {
        let body = req.body;
        body.my_id = req.decoded.result.id;
        let id_to_transfer = null;
        let data = [];
        data.username = body.id_user_to_transfer;
        //validar que el usuario al que le voy a transferir existe
        //valido que el monto es MENOR a mi CAPACIDAD de transferencia
        getUserByUsername(data, (err, results) => {
            if (err) {
                return res.status(500).json({
                    success: 0,
                    message: "Database connection errror"
                });
            }
            if (!results) {
                
                return res.status(400).json({
                    success: 0,
                    message: "Usuario destino no existe"
                });
            } else {
                console.log("aca",results);
                id_to_transfer = results.id;
                getMyAccount(body.my_id, (err, results) => {
                    if (err) {
                        return res.status(500).json({
                            success: 0,
                            message: "Database connection errror"
                        });
                    }
                    if (!results) {
                        return res.status(400).json({
                            success: 0,
                            message: "No existe cuenta"
                        });
                    } else {
                        let money = results.ammount;
                        if (money < body.ammount) {
                            return res.status(400).json({
                                success: 0,
                                message: "No tienes saldo suficiente para efectuar la transferencia."
                            });
                        } else { // hago la transferencia
                            body.id_user_to_transfer = id_to_transfer;
                            transfer(body, (err, results) => {
                                if (err) {
                                    return res.status(500).json({
                                        success: 0,
                                        message: "Database connection errror"
                                    });
                                }
                                //correo notificando
                                return res.status(200).json({
                                    success: 1,
                                    data: results
                                });


                            });
                        }
                    }
                });
            }
        });
    },

    doWithdraw: (req, res) => {
        let body = req.body;
        body.my_id = req.decoded.result.id;
        getMyAccount(body.my_id, (err, results) => {
            if (err) {
                return res.status(500).json({
                    success: 0,
                    message: "Database connection errror"
                });
            }
            if (!results) {
                return res.status(400).json({
                    success: 0,
                    message: "No existe cuenta"
                });
            } else {
                let money = results.ammount;
                if (money < body.ammount) {
                    return res.status(400).json({
                        success: 0,
                        message: "No tienes saldo suficiente para efectuar el retiro."
                    });
                } else { // efectuo el retiro
                    withdraw(body, (err, results) => {
                        if (err) {
                            return res.status(500).json({
                                success: 0,
                                message: "Database connection errror"
                            });
                        }              
                        return res.status(200).json({
                            success: 1,
                            data: results                   
                        });
            
                        
                    });
                }
            }
        });
        
    },

    doDeposit: (req, res) => {
        let body = req.body;
        body.my_id = req.decoded.result.id;
        deposit(body, (err, results) => {
            if (err) {
                return res.status(500).json({
                    success: 0,
                    message: "Database connection errror"
                });
            }              
            return res.status(200).json({
                success: 1,
                data: results                   
            });

            
        });
    },


}