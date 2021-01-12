CREATE DATABASE `postulacion_bripley` /*!40100 DEFAULT CHARACTER SET latin1 */;

CREATE TABLE `account` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_user` int(11) DEFAULT NULL,
  `ammount` bigint(20) DEFAULT NULL,
  `type` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=7 DEFAULT CHARSET=latin1;

CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(450) NOT NULL,
  `password` varchar(450) NOT NULL,
  `names` varchar(450) NOT NULL,
  `last_names` varchar(450) NOT NULL,
  `email` varchar(450) NOT NULL,
  `validated` tinyint(4) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=110 DEFAULT CHARSET=latin1;

CREATE TABLE `user_validation_codes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_validation_code` int(11) NOT NULL,
  `id_user` int(11) NOT NULL,
  `used` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=13 DEFAULT CHARSET=latin1;

CREATE TABLE `account_movements` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type_movement` varchar(450) DEFAULT NULL,
  `from_user` int(11) DEFAULT NULL,
  `to_user` int(11) DEFAULT NULL,
  `ammount` bigint(20) DEFAULT NULL,
  `datetime` datetime DEFAULT CURRENT_TIMESTAMP,
  `ammount_before_from` bigint(20) DEFAULT NULL,
  `ammount_after_from` bigint(20) DEFAULT NULL,
  `ammount_before_to` bigint(20) DEFAULT NULL,
  `ammount_after_to` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=43 DEFAULT CHARSET=latin1;
