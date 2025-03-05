-- Desabilita verificação de chaves estrangeiras para evitar erros de dependência
SET
FOREIGN_KEY_CHECKS = 0;

-- Drop stored procedures
DROP PROCEDURE IF EXISTS insert_revs;
DROP PROCEDURE IF EXISTS insert_spool;
DROP PROCEDURE IF EXISTS insert_sheet;
DROP PROCEDURE IF EXISTS insert_isometric;
DROP PROCEDURE IF EXISTS insert_parts_for_isos;
DROP PROCEDURE IF EXISTS insert_wps;

-- Drop tables em ordem reversa de dependência
DROP TABLE IF EXISTS `weld`;
DROP TABLE IF EXISTS `joint`;
DROP TABLE IF EXISTS `port`;
DROP TABLE IF EXISTS `fitting`;
DROP TABLE IF EXISTS `pipelength`;
DROP TABLE IF EXISTS `pipe`;
DROP TABLE IF EXISTS `rev`;
DROP TABLE IF EXISTS `sheet`;
DROP TABLE IF EXISTS `isometric`;

DROP TABLE IF EXISTS `welder`;
DROP TABLE IF EXISTS `pipefitter`;
DROP TABLE IF EXISTS `cuttingop`;
DROP TABLE IF EXISTS `admin`;

DROP TABLE IF EXISTS filler;
DROP TABLE IF EXISTS `wps`;

DROP TABLE IF EXISTS `part`;
DROP TABLE IF EXISTS `material`;
DROP TABLE IF EXISTS `diameter`;
DROP TABLE IF EXISTS `fittingtype`;
DROP TABLE IF EXISTS `project`;
DROP TABLE IF EXISTS `spool`;
DROP TABLE IF EXISTS `user`;

-- Reabilita verificação de chaves estrangeiras
SET
FOREIGN_KEY_CHECKS = 1;