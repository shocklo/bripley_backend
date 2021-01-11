const { create, checkByUsername, checkByEmail, createValidationCode, checkCode, login, getUserByUsername, getUserById } = require("./user.service");
const { createAccount } = require("../accounts/account.service");
const { hashSync, genSaltSync, compareSync } = require("bcrypt");
const { sign } = require("jsonwebtoken");
const { end } = require("../../config/db");
const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
    service: process.env.MAIL_HOST,
    auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD
    }
});


module.exports = {
    createUser: (req, res) => {
        const body = req.body;
        const salt = genSaltSync(10);
        body.password = hashSync(body.password, salt);
        //Validar que usuario no existe
        checkByUsername(body.username, (err, results) => {
            if (err) {
                return res.status(500).json({
                    success: 0,
                    message: "Database connection errror"
                });
            }
            if (results) {
                return res.status(400).json({
                    success: 0,
                    message: "Usuario con datos ya existentes en sistema"
                });
            } else {
                checkByEmail(body.email, (err, results) => {
                    if (err) {
                        return res.status(500).json({
                            success: 0,
                            message: "Database connection errror"
                        });
                    }
                    if (results) {
                        return res.status(400).json({
                            success: 0,
                            message: "Usuario con datos ya existentes en sistema"
                        });
                    } else {//el usuario no existe, ni por username ni por correo electronico, procedo a crearlo
                        create(body, (err, results) => {
                            if (err) {
                                console.log(err);
                                return res.status(500).json({
                                    success: 0,
                                    message: "Database connection errror"
                                });
                            }
                            let userId = results;
                            createValidationCode(userId, (err, results) => {
                                // crear nuevo codigo para el usuario
                                if (err) {
                                    console.log(err);
                                    return res.status(500).json({
                                        success: 0,
                                        message: "Database connection errror"
                                    });
                                }
                                var urlActivacion = "https://cristobalalegria.cl/api/validate?code="+results+"&id_user"+userId.insertId;
                                var mailOptions = {
                                    from: process.env.DB_HOST,
                                    to: body.email,
                                    subject: 'DESAFÍO TECNICO BANCO RIPLEY - Mini banco CAF',
                                    //TODO:: Formatear correo electronico y añadir URL para activación directa.
                                    text: 
                                    '<html><head></head><body>Hola!, gracias por registrarte en el sistema<br><br>'+
                                    'Para acceder debes validar la cuenta, para ello puedes hacer <a href="'+urlActivacion+'">Click acá.</a><br><br>'+
                                    'Si por algún motivo no puedes acceder al vinculo accede a la siguiente url:<br>'+
                                    urlActivacion+
                                    '<br><br><br> Atentamente: Cristóbal Alegría Fuentes.</body></html>'
                                };

                                transporter.sendMail(mailOptions, function (error, info) {
                                    if (error) {
                                        console.log(error);
                                    } else {
                                        console.log('Email sent: ' + info.response);
                                    }
                                });
                            });

                            createAccount(userId, (err, results) => {
                                // crear nuevo codigo para el usuario
                                if (err) {
                                    console.log(err);
                                    return res.status(500).json({
                                        success: 0,
                                        message: "Database connection errror"
                                    });
                                }
                                //Creo una nueva cuenta asociada al usuario.                               
                            });

                            return res.status(200).json({
                                success: 1,
                                data: results,
                                message: "Usuario creado exitosamente, favor revisa tu correo electrónico dentro de los próximos minutos para validar tu cuenta."

                            });
                        });
                    }
                });


            }
        });
    },

    validateUser: (req, res) => {
        const query = req.query;
        checkCode(query, (err, results) => {
            if (err) {
                return res.status(500).json({
                    success: 0,
                    message: "Database connection errror"
                });
            }
            if (!results) {
                return res.status(400).json({
                    success: 0,
                    message: "Codigo o usuario Invalido"
                });
            } else {
              
                return res.status(200).json({
                    success: 1,
                    data: results,
                    message: "Usuario validado correctamente."
                });

            }
        });
    },


    login: (req, res) => {
        const body = req.body;
        login(body, (err, results) => {
            if (err) {
                return res.status(500).json({
                    success: 0,
                    message: "Database connection errror"
                });
            }
            if (!results) {
                return res.status(400).json({
                    success: 0,
                    message: "Usuario o contraseña invalidos."
                });
            } else {
                const result = compareSync(body.password, results.password);
                if (result) {
                    results.password = undefined;
                    const jsonToken = sign({ result: results }, process.env.JWT_KEY, {
                        expiresIn: "1h"
                    });
                    return res.json({
                        success: 1,
                        message: "Login correcto",
                        data: jsonToken
                    });
                } else {
                    return res.json({
                        success: 0,
                        message: "Login incorrecto, valide usuario y contraseña."

                    });
                }

            }
        });
    },

    getUserByUsername: (req, res) => {
        const query = req.query;
        console.log(req.decoded.result.id);
        getUserByUsername(query, (err, results) => {
            if (err) {
                return res.status(500).json({
                    success: 0,
                    message: "Database connection errror"
                });
            }
            if (!results) {
                return res.status(400).json({
                    success: 0,
                    message: "Usuario no encontrado."
                });
            } else {               
                return res.status(200).json({
                    success: 1,
                    data: results,
                    message: "Usuario Encontrado."
                });

            }
        });
    },

    getUserById: (req, res) => {
        const query = req.query;        
        getUserById(query, (err, results) => {
            if (err) {
                return res.status(500).json({
                    success: 0,
                    message: "Database connection errror"
                });
            }
            if (!results) {
                return res.status(400).json({
                    success: 0,
                    message: "Usuario no encontrado."
                });
            } else {               
                return res.status(200).json({
                    success: 1,
                    data: results,
                    message: "Usuario Encontrado."
                });

            }
        });
    },


}