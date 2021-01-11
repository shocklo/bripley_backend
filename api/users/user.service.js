const pool = require("../../config/db");

module.exports = {
    create: (data, callBack) => {
        // Validar que los campos sean correctos

        //Validar que el usuario no exista, ya sea por correo electronico o por RUT


        pool.query(
            'insert into users(username, password, names, last_names, email) values (?,?,?,?,?)',
            [
                data.username,
                data.password,
                data.names,
                data.last_names,                
                data.email
            ],
            (error, results, fields) => {
                if (error) {
                    callBack(error);
                }
                return callBack(null, results);

            }
        );
    },

    checkByUsername: (data, callBack) => {
        pool.query(
            'select id from users where username = ?',
            [data],
            (error, results, fields) => {
                if (error) {
                    callBack(error);
                }
                return callBack(null, results[0]);

            }
        );
    },

    checkByEmail: (data, callBack) => {
        pool.query(
            'select id from users where email = ?',
            [data],
            (error, results, fields) => {
                if (error) {
                    callBack(error);
                }
                return callBack(null, results[0]);

            }
        );
    },


    createValidationCode: (data, callBack) => {
        //random number
        let randomNumber = Math.floor(Math.random() * (999999 - 100000 + 1) + 100000);
        pool.query(
            'insert into user_validation_codes(user_validation_code, id_user) values (?,?)',
            [randomNumber, data.insertId],
            (error, results, fields) => {
                if (error) {
                    callBack(error);
                }
                return callBack(null, randomNumber);

            }
        );
    },

    checkCode: (data, callBack) => {
        pool.query(
            'select id from  user_validation_codes where user_validation_code = ? and id_user = ? and used = 0',
            [data.code, data.id_user],
            (error, results, fields) => {
                if (error) {
                    callBack(error);
                }
                if (results[0]) {

                    pool.query(
                        'update user_validation_codes set used = 1 where id = ?',
                        [results[0]["id"]],
                        (error, results, fields) => {
                            if (error) {
                                callBack(error);
                            }
                        }
                    );

                    pool.query(
                        'update users set validated = 1 where id = ?',
                        [data.id_user],
                        (error, results, fields) => {
                            if (error) {
                                callBack(error);
                            }
                        }
                    );
                }
                return callBack(null, results[0]);
            }
        );
    },

    login: (data, callBack) => {
        pool.query(
            'select * from users where username = ? and validated = 1',
            [data.username],
            (error, results, fields) => {
                if (error) {
                    callBack(error);
                }
                return callBack(null, results[0]);

            }
        );
    },

    getUserByUsername: (data, callBack) => {
        pool.query(
            'select id from users where username = ? and validated = 1',
            [data.username],
            (error, results, fields) => {
                if (error) {
                    callBack(error);
                }
                return callBack(null, results[0]);

            }
        );
    },

    getUserById: (data, callBack) => {
        pool.query(
            'select username from users where id = ? and validated = 1',
            [data],
            (error, results, fields) => {
                if (error) {
                    callBack(error);
                }
                return callBack(null, results[0]);

            }
        );
    },


};