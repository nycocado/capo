-- Essa versão da base de dados é simplificada para o trabalho escolar
-- Usuário
CREATE TABLE
	user (
		user_id INT NOT NULL AUTO_INCREMENT,
		user_name VARCHAR(60) NOT NULL,
		user_bdate DATE NOT NULL,
		user_gender CHAR(1) NOT NULL,
		PRIMARY KEY (user_id)
	);

-- Soldador
CREATE TABLE
	welder (
		wdr_id INT NOT NULL AUTO_INCREMENT,
		wdr_certificate VARCHAR(100),
		wdr_user_id INT NOT NULL,
		PRIMARY KEY (wdr_id)
	);

-- Tubista
CREATE TABLE
	pipefitter (
		pipf_id INT NOT NULL AUTO_INCREMENT,
		pipf_certificate VARCHAR(100),
		pipf_user_id INT NOT NULL,
		PRIMARY KEY (pipf_id)
	);

-- Operador de Corte
CREATE TABLE
	cuttingop (
		ctop_id INT NOT NULL AUTO_INCREMENT,
		ctop_certificate VARCHAR(100),
		ctop_user_id INT NOT NULL,
		PRIMARY KEY (ctop_id)
	);

-- Material
CREATE TABLE
	material (
		mat_id INT NOT NULL AUTO_INCREMENT,
		mat_name VARCHAR(60) NOT NULL,
		PRIMARY KEY (mat_id)
	);

-- Diametro (DN)
CREATE TABLE
	diameter (
		dn_id INT NOT NULL AUTO_INCREMENT,
		dn_nominal_mm DECIMAL(6, 2) NOT NULL,
		dn_nominal_inch DECIMAL(5, 3) NOT NULL,
		PRIMARY KEY (dn_id)
	);

-- Tipo do acessório
CREATE TABLE
	fittingtype (
		fty_id INT NOT NULL AUTO_INCREMENT,
		fty_name VARCHAR(60) NOT NULL,
		PRIMARY KEY (fty_id)
	);

-- Estado de corte
CREATE TABLE
	cuttingstate (
		cst_id INT NOT NULL AUTO_INCREMENT,
		cst_name VARCHAR(20) NOT NULL,
		cst_cdate DATETIME NOT NULL,
		PRIMARY KEY (cst_id)
	);

-- Part ou componente
CREATE TABLE
	part (
		prt_id INT NOT NULL AUTO_INCREMENT,
		prt_number VARCHAR(100) NOT NULL,
		PRIMARY KEY (prt_id)
	);

-- Tubo
CREATE TABLE
	pipe (
		pip_id INT NOT NULL AUTO_INCREMENT,
		pip_lenght DECIMAL(8, 2) NOT NULL,
		pip_thickness DECIMAL(5, 2) NOT NULL,
		pip_heat_num VARCHAR(100),
		pip_mat_id INT NOT NULL,
		pip_dn_id INT NOT NULL,
		PRIMARY KEY (pip_id)
	);

-- Troço
CREATE TABLE
	pipelength (
		pipl_id INT NOT NULL AUTO_INCREMENT,
		pipl_length DECIMAL(8, 2) NOT NULL,
		pipl_ pipl_prt_id INT NOT NULL,
		pipl_pip_id INT NOT NULL,
		PRIMARY KEY (pipl_id)
	);

-- Processo de Corte
CREATE TABLE
	cutting (
		ctg_id INT NOT NULL AUTO_INCREMENT,
		ctg_pipl_id INT NOT NULL,
		ctg_cts_id INT NOT NULL,
		PRIMARY KEY (ctg_id)
	);

-- Acessório
CREATE TABLE
	fitting (
		fit_id INT NOT NULL AUTO_INCREMENT,
		fit_description VARCHAR(100) NOT NULL,
		fit_fty_id INT NOT NULL,
		fit_mat_id INT NOT NULL,
		fit_prt_id INT NOT NULL,
		PRIMARY KEY (fit_id)
	);

-- Boca do acessório
CREATE TABLE
	port (
		port_id INT NOT NULL AUTO_INCREMENT,
		port_number INT NOT NULL,
		port_fit_id INT NOT NULL,
		port_dn_id INT NOT NULL,
		PRIMARY KEY (port_id)
	);

-- Junção
CREATE TABLE
	joint (
		jnt_id INT NOT NULL AUTO_INCREMENT,
		jnt_prt1_id INT NOT NULL,
		jnt_prt2_id INT NOT NULL,
		jnt_spo_id INT NOT NULL,
		jnt_pipf_id INT NOT NULL,
		PRIMARY KEY (jnt_id)
	);

-- Spool
CREATE TABLE
	spool (
		spo_id INT NOT NULL AUTO_INCREMENT,
		PRIMARY KEY (spo_id)
	);

-- Projeto
CREATE TABLE
	project (
		prj_id INT NOT NULL AUTO_INCREMENT,
		prj_name VARCHAR(60) NOT NULL,
		prj_client VARCHAR(60) NOT NULL,
		PRIMARY KEY (prj_id)
	);

-- Isométrico
CREATE TABLE
	isometric (
		iso_id INT NOT NULL AUTO_INCREMENT,
		iso_prj_id INT NOT NULL,
		PRIMARY KEY (iso_id)
	);

-- Folha
CREATE TABLE
	sheet (
		sht_id INT NOT NULL AUTO_INCREMENT,
		sht_number INT NOT NULL,
		sht_iso_id INT NOT NULL,
		PRIMARY KEY (sht_id)
	);

-- Revisão
CREATE TABLE
	rev (
		rev_id INT NOT NULL AUTO_INCREMENT,
		rev_document VARCHAR(100) NOT NULL,
		rev_spo_id INT NOT NULL,
		rev_sht_id INT NOT NULL,
		PRIMARY KEY (rev_id)
	);

-- Material de Adição
CREATE TABLE
	fillermaterial (
		fm_id INT NOT NULL AUTO_INCREMENT,
		fm_name VARCHAR(60) NOT NULL,
		PRIMARY KEY (fm_id)
	);

-- Soldadura
CREATE TABLE
	weld (
		wld_id INT NOT NULL AUTO_INCREMENT,
		wld_wdr_id INT NOT NULL,
		wld_fm_id INT NOT NULL,
		wld_jnt_id INT NOT NULL,
		PRIMARY KEY (wld_id)
	);

-- WPS
CREATE TABLE
	wps (
		wps_id INT NOT NULL AUTO_INCREMENT,
		wps_document VARCHAR(),
		PRIMARY KEY (wps_id)
	);