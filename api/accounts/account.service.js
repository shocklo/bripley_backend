const pool = require("../../config/db");

const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    service: process.env.MAIL_HOST,
    auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD
    }
});
module.exports = {

    getMyTransferHistory: (data, callBack) => {
        pool.query(
            " select am.id, am.type_movement, CONCAT(uf.names, ' ', uf.last_names) as from_user, CONCAT(ut.names, ' ', ut.last_names) as to_user, am.ammount, am.datetime, "+
            " am.ammount_before_from, am.ammount_after_from "+
            " from account_movements am  "+
            "     left join users uf on am.from_user = uf.id  "+
            "     left join users ut on am.to_user = ut.id where am.from_user = ? "+
            " union "+
            " select am.id, am.type_movement, CONCAT(uf.names, ' ', uf.last_names) as from_user, CONCAT(ut.names, ' ', ut.last_names) as to_user, am.ammount, am.datetime, "+
            " am.ammount_before_to, am.ammount_after_to "+
            " from account_movements am  "+
            "     left join users uf on am.from_user = uf.id  "+
            "     left join users ut on am.to_user = ut.id where am.type_movement = 'Transferencia' and am.to_user = ?  order by id asc ",
        /*"select am.id, am.type_movement, CONCAT(uf.names, ' ', uf.last_names) as from_user, CONCAT(ut.names, ' ', ut.last_names) as to_user, am.ammount, am.datetime  from account_movements am "+ 
        "left join users uf on am.from_user = uf.id "+
        "left join users ut on am.to_user = ut.id where am.from_user = ? or am.to_user = ?"*/
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
        //Requiero hacer una consulta para obtener los datos historicos por usuario y lo que se enviará por correo:
        let from_user;
        let to_user;
        let from_user_email;
        let to_user_email;
        let ammount_after_from;
        let ammount_after_to;
        let ammount_before_from;
        let ammount_before_to;

        
        pool.query( // Obtengo campos del FROM
            "select u.names, u.last_names, u.email, a.ammount from users u left outer join account a on u.id = a.id_user where u.id = ?",
            [data.my_id],
            (error, results, fields) => {
                if (error) {
                    callBack(error);
                } else {
                    from_user = results[0].names+' '+results[0].last_names;
                    from_user_email = results[0].email;
                    ammount_before_from = results[0].ammount;
                    pool.query( // Obtengo campos del TO
                        "select u.names, u.last_names, u.email, a.ammount from users u left outer join account a on u.id = a.id_user where u.id = ?",
                        [data.id_user_to_transfer],
                        (error, results, fields) => {
                            if (error) {
                                callBack(error);
                            } else {
                                to_user = results[0].names+' '+results[0].last_names;
                                to_user_email = results[0].email;
                                ammount_before_to = results[0].ammount; 
                                pool.query( // descuento mi dinero
                                    "update account set ammount = (ammount - ?) where id_user = ?",
                                    [data.ammount, data.my_id],
                                    (error, results, fields) => {
                                        if (error) {
                                            callBack(error);
                                        } else {
                                            console.log("RESTO",data.ammount);
                                            console.log("A",data.my_id);
                                            pool.query( // aumento dinero en cuenta destino
                                                "update account set ammount = (ammount + ?) where id_user = ?",
                                                [data.ammount, data.id_user_to_transfer],
                                                (error, results, fields) => {
                                                    if (error) {
                                                        callBack(error);
                                                    } else {
                                                        console.log("AUMENTO",data.ammount);
                                                        console.log("A",data.id_user_to_transfer);
                                                        //Envio correo notificando al que recibe                                 
                                                        var mailOptionsFrom = {
                                                            from: process.env.DB_HOST,
                                                            to: from_user_email,
                                                            subject: 'DESAFÍO TECNICO BANCO RIPLEY - Mini banco CAF',                                   
                                                            html: 
                                                            '<html><head></head><body><div style="max-width:500px; margin-left:auto; margin-right:auto; "> '+
                                                            '<div style="background-color:#894590; height:30px;"></div> '+
                                                            '<div style="background-color:#f8f8f8; padding-top:50px; padding-bottom:50px; padding-left:10px; padding-right:10px;"> '+
                                                            '<h1>Comprobante de Transferencia a terceros</h1> '+
                                                            ''+ from_user +', Te informamos que se ha realizado una transferencia desde tu cuenta a '+ to_user +' por:<br><br> '+
                                                            '$'+data.ammount+'<br><br><br> Atentamente: Cristóbal Alegría Fuentes. <br>'+
                                                            '</div><div><table style="width:100%; height:20px; border-collapse: collapse;"><tr><td style="background-color:#e22d36; width:45%;"> '+
                                                            '</td><td style="background-color:#f2ad4b; width:20%;"></td><td style="background-color:#894590; width:35%;"> '+
                                                            '</td></tr></table></div></div></body></html> ',                                                           
                                                            text:''
                                                        };
                        
                                                        var mailOptionsTo = {
                                                            from: process.env.DB_HOST,
                                                            to: to_user_email,
                                                            subject: 'DESAFÍO TECNICO BANCO RIPLEY - Mini banco CAF',                                   
                                                            html: 
                                                            '<html><head></head><body><div style="max-width:500px; margin-left:auto; margin-right:auto; "> '+
                                                            '<div style="background-color:#894590; height:30px;"></div> '+
                                                            '<div style="background-color:#f8f8f8; padding-top:50px; padding-bottom:50px; padding-left:10px; padding-right:10px;"> '+
                                                            '<h1>Comprobante de Transferencia a terceros</h1> '+
                                                            ''+ to_user +', Te informamos que '+from_user+' ha realizado una transferencia a tu cuenta por:<br><br> '+
                                                            '$'+data.ammount+'<br><br><br> Atentamente: Cristóbal Alegría Fuentes. <br>'+
                                                            '</div><div><table style="width:100%; height:20px; border-collapse: collapse;"><tr><td style="background-color:#e22d36; width:45%;"> '+
                                                            '</td><td style="background-color:#f2ad4b; width:20%;"></td><td style="background-color:#894590; width:35%;"> '+
                                                            '</td></tr></table></div></div></body></html> ', 
                                                            text:''
                                                        };
                        
                                                        transporter.sendMail(mailOptionsFrom, function (error, info) {
                                                            if (error) {
                                                                console.log(error);
                                                            } else {
                                                                console.log('Email sent: ' + info.response);
                                                            }
                                                        });
                        
                                                        transporter.sendMail(mailOptionsTo, function (error, info) {
                                                            if (error) {
                                                                console.log(error);
                                                            } else {
                                                                console.log('Email sent: ' + info.response);
                                                            }
                                                        });
                        
                        
                        

                                                        ammount_after_from = ammount_before_from - data.ammount;
                                                        ammount_after_to = ammount_before_to + data.ammount;
                        
                                                        pool.query( // genero registro historico                                                                                   
                                                            "insert into account_movements(type_movement, from_user, to_user, ammount, ammount_before_from, ammount_after_from, ammount_before_to, ammount_after_to) values (?,?,?,?,?,?,?,?)",
                                                            ["Transferencia", data.my_id, data.id_user_to_transfer, data.ammount, ammount_before_from, ammount_after_from, ammount_before_to, ammount_after_to],
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
                            }
                        });
                }
            });

        
    },

    deposit: (data, callBack) => {      
        pool.query( // Obtengo campos del FROM
            "select u.names, u.last_names, u.email, a.ammount from users u left outer join account a on u.id = a.id_user where u.id = ?",
            [data.my_id],
            (error, results, fields) => {
                if (error) {
                    callBack(error);
                } else {
                    let ammount_before_from = results[0].ammount;
                    pool.query(
                        "update account set ammount = ammount + ? where id_user = ?",
                        [data.ammount, data.my_id],
                        (error, results, fields) => {
                            if (error) {
                                callBack(error);
                            }
                            pool.query( // genero registro historico
                                "insert into account_movements(type_movement, from_user, to_user, ammount, ammount_before_from, ammount_after_from) values (?,?,?,?,?,?)",
                                ["Deposito", data.my_id, data.my_id, data.ammount, ammount_before_from, ammount_before_from+data.ammount],
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
                }
            }); 
        
    },

    withdraw: (data, callBack) => {
        pool.query( // Obtengo campos del FROM
            "select u.names, u.last_names, u.email, a.ammount from users u left outer join account a on u.id = a.id_user where u.id = ?",
            [data.my_id],
            (error, results, fields) => {
                if (error) {
                    callBack(error);
                } else {
                    let ammount_before_from = results[0].ammount;
                    pool.query(
                        "update account set ammount = ammount - ? where id_user = ?",
                        [data.ammount, data.my_id],
                        (error, results, fields) => {
                            if (error) {
                                callBack(error);
                            }
                            pool.query( // genero registro historico
                                "insert into account_movements(type_movement, from_user, to_user, ammount,  ammount_before_from, ammount_after_from) values (?,?,?,?,?,?)",
                                ["Retiro", data.my_id, data.my_id, data.ammount, ammount_before_from, ammount_before_from-data.ammount],
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
                }
            });
        
    },


};