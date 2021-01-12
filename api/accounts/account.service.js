const pool = require("../../config/db");

module.exports = {

    getMyTransferHistory: (data, callBack) => {
        pool.query("select am.id, am.type_movement, CONCAT(uf.names, ' ', uf.last_names) as from_user, CONCAT(ut.names, ' ', ut.last_names) as to_user, am.ammount, am.datetime  from account_movements am "+ 
        "left join users uf on am.from_user = uf.id "+
        "left join users ut on am.to_user = ut.id where am.from_user = ? or am.to_user = ?",
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
                                    "insert into account_movements(type_movement, from_user, to_user, ammount, ammount_before, ammount_after) values"+
                                    "(?,?,?,?, select ammount + ? from account where id_user = ?, select ammount + ? from account where id_user = ?)",
                                    ["Transferencia", data.my_id, data.id_user_to_transfer, data.ammount, data.ammount, data.my_id, data.my_id],
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
                    ["Retiro", data.my_id, data.my_id, data.ammount],
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