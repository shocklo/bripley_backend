const pool = require("../../config/db");

module.exports = {

    getMyTransferHistory: (data, callBack) => {
        pool.query('select * from account_movements where from_user = ? or to_user = ?',
            [data, data],
            (error, results, fields) => {
                if (error) {
                    callBack(error);
                }
                return callBack(null, results);

            }
        );
    },

    createAccount: (data, callBack) => {
        let randomNumber = 0;
        pool.query(
            "insert into account(id_user, ammount, type) values (?,?,'Corriente')",
            [data.insertId, randomNumber],
            (error, results, fields) => {
                if (error) {
                    callBack(error);
                }
                return callBack(null, results[0]);

            }
        );
    },

    getMyAccount: (data, callBack) => {
        pool.query(
            "select ammount from account where id_user = ?",
            [data],
            (error, results, fields) => {
                if (error) {
                    callBack(error);
                }
                return callBack(null, results[0]);

            }
        );
    },

    transfer: (data, callBack) => {
        pool.query( // descuento mi dinero
            "update account set ammount = ammount - ? where id_user = ?",
            [data.my_id, data.ammount],
            (error, results, fields) => {
                if (error) {
                    callBack(error);
                } else {
                    pool.query( // aumento dinero en cuenta destino
                        "update account set ammount = ammount + ? where id_user = ?",
                        [data.id_user_to_transfer, data.ammount],
                        (error, results, fields) => {
                            if (error) {
                                callBack(error);
                            } else {
                                pool.query( // genero registro historico
                                    "insert into account_movements(type_movement, from_user, to_user, ammount) values (?,?,?,?)",
                                    ["Transferencia", data.my_id, data.id_user_to_transfer, data.ammount],
                                    (error, results, fields) => {
                                        if (error) {
                                            callBack(error);
                                        } else {
                                            return callBack(null, 1);
                                        }
                                    }
                                );
                            }
                        }
                    );
                }
            }
        );
    },

    deposit: (data, callBack) => {       
        pool.query(
            "update account set ammount = ammount + ? where id_user = ?",
            [data.ammount, data.my_id],
            (error, results, fields) => {
                if (error) {
                    callBack(error);
                }
                pool.query( // genero registro historico
                    "insert into account_movements(type_movement, from_user, to_user, ammount) values (?,?,?,?)",
                    ["Deposito", data.my_id, data.my_id, data.ammount],
                    (error, results, fields) => {
                        if (error) {
                            callBack(error);
                        } else {
                            return callBack(null, 1);
                        }
                    }
                );

            }
        );
    },

    withdraw: (data, callBack) => {
        pool.query(
            "update account set ammount = ammount - ? where id_user = ?",
            [data.ammount, data.my_id],
            (error, results, fields) => {
                if (error) {
                    callBack(error);
                }
                pool.query( // genero registro historico
                    "insert into account_movements(type_movement, from_user, to_user, ammount) values (?,?,?,?)",
                    ["Deposito", data.my_id, data.my_id, data.ammount],
                    (error, results, fields) => {
                        if (error) {
                            callBack(error);
                        } else {
                            return callBack(null, 1);
                        }
                    }
                );

            }
        );
    },


};