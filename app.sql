DROP DATABASE app;
CREATE DATABASE app;
USE app;

CREATE TABLE `image` (
`url` varchar(256) NOT NULL,
`md5` char(128) NOT NULL,
PRIMARY KEY (`url`) 
);
CREATE TABLE `user` (
`uuid` char(128) NOT NULL,
`openid` varchar(256) NOT NULL,
`secret` varchar(256) NOT NULL,
`picnum` int NOT NULL,
`lastsearch` varchar(128) NULL,
PRIMARY KEY (`uuid`) 
);
CREATE TABLE `keyword` (
`user` char(128) NOT NULL,
`image` varchar(256) NOT NULL,
`keyword` varchar(256) NOT NULL,
`level` double NOT NULL,
`time` timestamp NOT NULL ON UPDATE CURRENT_TIMESTAMP,
PRIMARY KEY (`user`, `image`) 
);
CREATE TABLE `feedback` (
`uid` int(11) NOT NULL AUTO_INCREMENT,
`email` varchar(128) NOT NULL,
`feedback` varchar(1024) NOT NULL
);
