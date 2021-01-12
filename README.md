# bripley_backend
DESAFÍO TECNICO BANCO RIPLEY - TRANSFORMACIÓN DIGITAL
Mini Banco

Parte backend, Nodejs con Express.
Base de datos mysql.

Se debe clonar, npm install y configurar el archivo .env antes de poder montar el proyecto, el archivo .env debe contener:
DB_HOST=
DB_PORT=
DB_USER=
DB_PASSWORD=
DB_DATABASE=postulacion_bripley
DB_CONN_LIMIT= 100
APP_PORT= 
MAIL_USERNAME= 
MAIL_PASSWORD= 
MAIL_HOST= 
JWT_KEY=

adicionalmente se debe ejecutar el script de base de datos BD.sql
luego se puede montar el servicio, los endpoints activos son:

get("api/accounts/") -> Obtiene movimientos a la cuenta
post("api/accounts/transfer") -> Transfiere saldo entre usuarios
post("api/accounts/doDeposit") -> Deposita al usuario
post("api/accounts/doWithdraw") -> Retira al usuario
get("api/accounts/myAccount") -> Obtiene saldo
post("api/users/") -> Creación de usuarios
get("api/users/validate") -> Validación de usuarios
post("api/users/login") -> Login de usuarios
get("api/users/getUserByUsername") -> Valdación de existencia de usuarios por nombre
get("api/users/getUserById") ->  Valdación de existencia de usuarios por ID

