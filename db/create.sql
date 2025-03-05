-- Essa versão da base de dados é simplificada para o trabalho escolar
-- Usuário
CREATE TABLE user
(
    user_id          INT          NOT NULL AUTO_INCREMENT,
    user_internal_id VARCHAR(100) NOT NULL,
    user_password    VARCHAR(255) NOT NULL,
    user_name        VARCHAR(60)  NOT NULL,
    user_bdate       DATE         NOT NULL,
    user_gender      CHAR(1)      NOT NULL,
    user_photo       VARCHAR(100),
    UNIQUE (user_internal_id),
    PRIMARY KEY (user_id)
);

-- Soldador
CREATE TABLE welder
(
    wdr_id          INT NOT NULL AUTO_INCREMENT,
    wdr_certificate VARCHAR(100),
    wdr_user_id     INT NOT NULL,
    PRIMARY KEY (wdr_id)
);

-- Tubista
CREATE TABLE pipefitter
(
    pipf_id          INT NOT NULL AUTO_INCREMENT,
    pipf_certificate VARCHAR(100),
    pipf_user_id     INT NOT NULL,
    PRIMARY KEY (pipf_id)
);

-- Operador de Corte
CREATE TABLE cuttingop
(
    ctop_id          INT NOT NULL AUTO_INCREMENT,
    ctop_certificate VARCHAR(100),
    ctop_user_id     INT NOT NULL,
    PRIMARY KEY (ctop_id)
);

CREATE TABLE admin
(
    adm_id          INT NOT NULL AUTO_INCREMENT,
    adm_certificate VARCHAR(100),
    adm_user_id     INT NOT NULL,
    PRIMARY KEY (adm_id)
);

-- Material
CREATE TABLE material
(
    mat_id   INT         NOT NULL AUTO_INCREMENT,
    mat_name VARCHAR(60) NOT NULL,
    UNIQUE (mat_name),
    PRIMARY KEY (mat_id)
);

-- Diametro (DN)
CREATE TABLE diameter
(
    dn_id           INT           NOT NULL AUTO_INCREMENT,
    dn_nominal_mm   DECIMAL(6, 2) NOT NULL,
    dn_nominal_inch DECIMAL(5, 3) NOT NULL,
    UNIQUE (dn_nominal_mm),
    PRIMARY KEY (dn_id)
);

-- Tipo do acessório
CREATE TABLE fittingtype
(
    fty_id   INT         NOT NULL AUTO_INCREMENT,
    fty_name VARCHAR(60) NOT NULL,
    UNIQUE (fty_name),
    PRIMARY KEY (fty_id)
);

-- Part ou componente
CREATE TABLE part
(
    prt_id     INT          NOT NULL AUTO_INCREMENT,
    prt_number VARCHAR(100) NOT NULL,
    PRIMARY KEY (prt_id)
);

-- Troço
CREATE TABLE pipelength
(
    pipl_id          INT           NOT NULL AUTO_INCREMENT,
    pipl_internal_id VARCHAR(100)  NOT NULL,
    pipl_length      DECIMAL(8, 2) NOT NULL,
    pipl_thickness   DECIMAL(5, 2) NOT NULL,
    pipl_heatnumber  VARCHAR(100),
    pipl_mat_id      INT           NOT NULL,
    pipl_dn_id       INT           NOT NULL,
    pipl_prt_id      INT           NOT NULL,
    pipl_ctop_id     INT,
    pipl_iso_id      INT           NOT NULL,
    UNIQUE (pipl_internal_id),
    PRIMARY KEY (pipl_id)
);

-- Acessório
CREATE TABLE fitting
(
    fit_id          INT           NOT NULL AUTO_INCREMENT,
    fit_internal_id VARCHAR(100)  NOT NULL,
    fit_description VARCHAR(100)  NOT NULL,
    fit_length      DECIMAL(8, 2) NOT NULL,
    fit_thickness   DECIMAL(5, 2) NOT NULL,
    fit_heatnumber  VARCHAR(100),
    fit_fty_id      INT           NOT NULL,
    fit_mat_id      INT           NOT NULL,
    fit_prt_id      INT           NOT NULL,
    fit_iso_id      INT           NOT NULL,
    UNIQUE (fit_internal_id),
    PRIMARY KEY (fit_id)
);

-- Boca do acessório
CREATE TABLE port
(
    port_id     INT NOT NULL AUTO_INCREMENT,
    port_number INT NOT NULL,
    port_fit_id INT NOT NULL,
    port_dn_id  INT NOT NULL,
    PRIMARY KEY (port_id)
);

-- Junção
CREATE TABLE joint
(
    jnt_id      INT NOT NULL AUTO_INCREMENT,
    jnt_prt1_id INT NOT NULL,
    jnt_prt2_id INT NOT NULL,
    jnt_spo_id  INT NOT NULL,
    jnt_pipf_id INT,
    PRIMARY KEY (jnt_id)
);

-- Spool
CREATE TABLE spool
(
    spo_id          INT          NOT NULL AUTO_INCREMENT,
    spo_internal_id VARCHAR(100) NOT NULL,
    UNIQUE (spo_internal_id),
    PRIMARY KEY (spo_id)
);

-- Projeto
CREATE TABLE project
(
    prj_id          INT          NOT NULL AUTO_INCREMENT,
    prj_internal_id VARCHAR(100) NOT NULL,
    prj_name        VARCHAR(60)  NOT NULL,
    prj_client      VARCHAR(60)  NOT NULL,
    UNIQUE (prj_internal_id),
    PRIMARY KEY (prj_id)
);

-- Isométrico
CREATE TABLE isometric
(
    iso_id          INT          NOT NULL AUTO_INCREMENT,
    iso_internal_id VARCHAR(100) NOT NULL,
    iso_prj_id      INT          NOT NULL,
    UNIQUE (iso_internal_id),
    PRIMARY KEY (iso_id)
);

-- Folha
CREATE TABLE sheet
(
    sht_id     INT NOT NULL AUTO_INCREMENT,
    sht_number INT NOT NULL,
    sht_iso_id INT NOT NULL,
    PRIMARY KEY (sht_id)
);

-- Revisão
CREATE TABLE rev
(
    rev_id       INT          NOT NULL AUTO_INCREMENT,
    rev_document VARCHAR(100) NOT NULL,
    rev_spo_id   INT          NOT NULL,
    rev_sht_id   INT          NOT NULL,
    PRIMARY KEY (rev_id)
);

-- Material de Adição
CREATE TABLE filler
(
    flr_id   INT         NOT NULL AUTO_INCREMENT,
    flr_name VARCHAR(60) NOT NULL,
    UNIQUE (flr_name),
    PRIMARY KEY (flr_id)
);

-- Soldadura
CREATE TABLE weld
(
    wld_id     INT NOT NULL AUTO_INCREMENT,
    wld_wdr_id INT,
    wld_fm_id  INT,
    wld_wps_id INT,
    wld_jnt_id INT NOT NULL,
    PRIMARY KEY (wld_id)
);

-- WPS
CREATE TABLE wps
(
    wps_id          INT           NOT NULL AUTO_INCREMENT,
    wps_internal_id VARCHAR(100)  NOT NULL,
    wps_document    VARCHAR(100)  NOT NULL,
    wps_tpi         DECIMAL(4, 2) NOT NULL,
    PRIMARY KEY (wps_id)
);

-- Foreign Keys
ALTER TABLE welder
    ADD CONSTRAINT fk_welder_user FOREIGN KEY (wdr_user_id) REFERENCES user (user_id);

ALTER TABLE pipefitter
    ADD CONSTRAINT fk_pipefitter_user FOREIGN KEY (pipf_user_id) REFERENCES user (user_id);

ALTER TABLE cuttingop
    ADD CONSTRAINT fk_cuttingop_user FOREIGN KEY (ctop_user_id) REFERENCES user (user_id);

ALTER TABLE admin
    ADD CONSTRAINT fk_admin_user FOREIGN KEY (adm_user_id) REFERENCES user (user_id);

ALTER TABLE isometric
    ADD CONSTRAINT fk_iso_project FOREIGN KEY (iso_prj_id) REFERENCES project (prj_id);

ALTER TABLE sheet
    ADD CONSTRAINT fk_sheet_iso FOREIGN KEY (sht_iso_id) REFERENCES isometric (iso_id);

ALTER TABLE rev
    ADD CONSTRAINT fk_rev_spool FOREIGN KEY (rev_spo_id) REFERENCES spool (spo_id),
    ADD CONSTRAINT fk_rev_sheet FOREIGN KEY (rev_sht_id) REFERENCES sheet (sht_id);

ALTER TABLE pipelength
    ADD CONSTRAINT fk_pipelength_part FOREIGN KEY (pipl_prt_id) REFERENCES part (prt_id),
    ADD CONSTRAINT fk_pipelength_cuttingop FOREIGN KEY (pipl_ctop_id) REFERENCES cuttingop (ctop_id),
    ADD CONSTRAINT fk_pipelength_material FOREIGN KEY (pipl_mat_id) REFERENCES material (mat_id),
    ADD CONSTRAINT fk_pipelength_diameter FOREIGN KEY (pipl_dn_id) REFERENCES diameter (dn_id),
    ADD CONSTRAINT fk_pipelength_isometric FOREIGN KEY (pipl_iso_id) REFERENCES isometric (iso_id);

ALTER TABLE fitting
    ADD CONSTRAINT fk_fitting_type FOREIGN KEY (fit_fty_id) REFERENCES fittingtype (fty_id),
    ADD CONSTRAINT fk_fitting_material FOREIGN KEY (fit_mat_id) REFERENCES material (mat_id),
    ADD CONSTRAINT fk_fitting_part FOREIGN KEY (fit_prt_id) REFERENCES part (prt_id),
    ADD CONSTRAINT fk_fitting_isometric FOREIGN KEY (fit_iso_id) REFERENCES isometric (iso_id);


ALTER TABLE port
    ADD CONSTRAINT fk_port_fitting FOREIGN KEY (port_fit_id) REFERENCES fitting (fit_id),
    ADD CONSTRAINT fk_port_diameter FOREIGN KEY (port_dn_id) REFERENCES diameter (dn_id);

ALTER TABLE joint
    ADD CONSTRAINT fk_joint_prt1 FOREIGN KEY (jnt_prt1_id) REFERENCES part (prt_id),
    ADD CONSTRAINT fk_joint_prt2 FOREIGN KEY (jnt_prt2_id) REFERENCES part (prt_id),
    ADD CONSTRAINT fk_joint_spool FOREIGN KEY (jnt_spo_id) REFERENCES spool (spo_id),
    ADD CONSTRAINT fk_joint_pipefitter FOREIGN KEY (jnt_pipf_id) REFERENCES pipefitter (pipf_id);

ALTER TABLE weld
    ADD CONSTRAINT fk_weld_welder FOREIGN KEY (wld_wdr_id) REFERENCES welder (wdr_id),
    ADD CONSTRAINT fk_weld_filler FOREIGN KEY (wld_fm_id) REFERENCES filler (flr_id),
    ADD CONSTRAINT fk_weld_joint FOREIGN KEY (wld_jnt_id) REFERENCES joint (jnt_id),
    ADD CONSTRAINT fk_weld_wps FOREIGN KEY (wld_wps_id) REFERENCES wps (wps_id);

-- Isometricos
DELIMITER $$
CREATE PROCEDURE insert_isometric()
BEGIN
    DECLARE i INT DEFAULT 1;
    WHILE i <= 10
        DO
            INSERT INTO isometric (iso_internal_id, iso_prj_id) VALUES (CONCAT('ISO', LPAD(i, 4, '0')), 1);
            SET i = i + 1;
        END WHILE;
END $$
DELIMITER ;

-- Spools
DELIMITER $$
CREATE PROCEDURE insert_spool()
BEGIN
    DECLARE i INT DEFAULT 1;
    WHILE i <= 30
        DO
            INSERT INTO spool (spo_internal_id) VALUES (CONCAT('SPO', LPAD(i, 3, '0')));
            SET i = i + 1;
        END WHILE;
END $$
DELIMITER ;

-- Folhas
DELIMITER $$
CREATE PROCEDURE insert_sheet()
BEGIN
    DECLARE i INT DEFAULT 1;
    WHILE i <= 10
        DO
            INSERT INTO sheet (sht_number, sht_iso_id) VALUES (1, i);
            SET i = i + 1;
        END WHILE;
END $$
DELIMITER ;

-- Revisões
DELIMITER $$
CREATE PROCEDURE insert_revs()
BEGIN
    DECLARE i INT DEFAULT 1;
    DECLARE sheet_id INT;
    DECLARE document_link VARCHAR(255);
    WHILE i <= 30
        DO
            SET sheet_id = CEIL(i / 3);
            SET document_link = CONCAT('isometric', LPAD(sheet_id, 2, '0'), '.pdf');
            INSERT INTO rev (rev_document, rev_spo_id, rev_sht_id) VALUES (document_link, i, sheet_id);
            SET i = i + 1;
        END WHILE;
END $$
DELIMITER ;


-- Parts por isometricos
DELIMITER $$
CREATE PROCEDURE insert_parts_for_isos(IN n_iso INT)
BEGIN
    DECLARE iso INT DEFAULT 1;
    DECLARE pip INT;
    WHILE iso <= n_iso
        DO
            SET pip = 1;
            -- 7 pipelength parts por isométrico
            WHILE pip <= 7
                DO
                    INSERT INTO part (prt_number) VALUES (CONCAT('1.', pip));
                    SET pip = pip + 1;
                END WHILE;
            -- 5 fittings por isométrico (prefixos 2 a 6) com sufixo sempre 1
            INSERT INTO part (prt_number) VALUES ('2.1');
            INSERT INTO part (prt_number) VALUES ('3.1');
            INSERT INTO part (prt_number) VALUES ('4.1');
            INSERT INTO part (prt_number) VALUES ('5.1');
            INSERT INTO part (prt_number) VALUES ('6.1');
            SET iso = iso + 1;
        END WHILE;
END$$
DELIMITER ;

-- WPS
DELIMITER $$
CREATE PROCEDURE insert_wps()
BEGIN
    DECLARE i INT DEFAULT 1;
    DECLARE internal_id VARCHAR(100);
    DECLARE document_name VARCHAR(100);
    DECLARE temperature DECIMAL(4,2);

    WHILE i <= 5
        DO
            SET internal_id = CONCAT('WPS', LPAD(i, 2, '0'));
            SET document_name = CONCAT('WPS', LPAD(i, 2, '0'), '.pdf');
            SET temperature = ROUND(50 + (RAND() * 49.99), 2);

            INSERT INTO wps (wps_internal_id, wps_document, wps_tpi)
            VALUES (internal_id, document_name, temperature);

            SET i = i + 1;
        END WHILE;
END $$
DELIMITER ;