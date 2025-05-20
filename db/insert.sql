-- Usuários
INSERT INTO
    user (user_internal_id, user_password, user_name, user_bdate, user_gender)
VALUES
    -- teste123, soldador
    ('UJS8342', '$2a$12$rpRE07uxRsTsEDguHm4NmOiM6HpKH20/Ol8Z8/90sjgqsiL4q.vpm', 'João Silva',        '1985-07-15', 'M'),
    -- abc123, soldador
    ('UPS5687', '$2a$12$6yuNlm6g/m9gGsen03lC9u11iGP02Wmz6SNH9kgl4rRSMm2Au3dRO', 'Pedro Santos',      '1980-03-22', 'M'),
    -- senha456, soldador
    ('UCO3431', '$2a$12$/HZ26JhUs.QmIbKRuKORuu9LRVomJetuYwESXEsHCpJkoraj8Mgni', 'Carlos Oliveira',   '1978-11-05', 'M'),
    -- usuario789, soldador
    ('UMC4506', '$2a$12$swcdply5JMX2U5ZHlsQmW.Glt1JuQxHSVPck0fY1FBwc8moaeR1cO', 'Miguel Costa',      '1987-09-10', 'M'),
    -- qwerty, pipefitter
    ('UAR3048', '$2a$12$dQAHFSQElyo6oLqFbFcRfeYiFC3Kxd76ClkKSVpoBcs.qp3jFCHYy', 'António Rodrigues', '1983-12-30', 'M'),
    -- 12345678, pipefitter
    ('UFP2305', '$2a$12$aCmSreRDE.BhDAi9PRC90uTBUE72z7QRa3ZVV2HSkf2rdOZjqz6cC', 'Francisco Pereira', '1992-05-15', 'M'),
    -- banana42, pipefitter
    ('ULF2384', '$2a$12$mmJQYABwg4bD/3cUHRVpQ.fR0I0ud3YOtOKSeCygszWN3GmhQRZyK', 'Luís Fernandes',    '1989-02-18', 'M'),
    -- letmein, cuttingop
    ('URM3028', '$2a$12$oyuJSjPgh5w8tf9COZpEo.fFI6eR/e17hCsNJt2QoY8plH9JysN.K', 'Rui Martins',       '1975-08-21', 'M'),
    -- welcome1, cuttingop
    ('UBC4085', '$2a$12$cCjuKtuJVJa6s91kGBO8L.VzXym8ThLSrfJ1D53B/nn3EoXwlHe7C', 'Bruno Carvalho',    '1981-06-25', 'M'),
    -- admin123, cuttingop
    ('UAS3204', '$2a$12$3vvnMXayE7vt1kz9oqElOuEhhAspULBvrqOMMY74OMkWHJSUQDFG2', 'Ana Sousa',         '1995-04-12', 'F');

-- Soldadores
INSERT INTO
    welder (wdr_certificate, wdr_user_id)
VALUES
    (CONCAT('https://www.example.com/certificate/', UUID()), 1),
    (CONCAT('https://www.example.com/certificate/', UUID()), 2),
    (CONCAT('https://www.example.com/certificate/', UUID()), 3),
    (CONCAT('https://www.example.com/certificate/', UUID()), 4);

-- Tubistas
INSERT INTO
    pipefitter (pipf_certificate, pipf_user_id)
VALUES
    (CONCAT('https://www.example.com/certificate/', UUID()), 1),
    (CONCAT('https://www.example.com/certificate/', UUID()), 5),
    (CONCAT('https://www.example.com/certificate/', UUID()), 6),
    (CONCAT('https://www.example.com/certificate/', UUID()), 7);

-- Operadores de Corte
INSERT INTO
    cuttingop (ctop_certificate, ctop_user_id)
VALUES
    (CONCAT('https://www.example.com/certificate/', UUID()), 1 ),
    (CONCAT('https://www.example.com/certificate/', UUID()), 8 ),
    (CONCAT('https://www.example.com/certificate/', UUID()), 9 ),
    (CONCAT('https://www.example.com/certificate/', UUID()), 10);

-- Materiais
INSERT INTO
    material (mat_name)
VALUES
    ('304L'),
    ('316L'),
    ('CS'  ),
    ('GAL' );

-- Diametros
INSERT INTO
    diameter (dn_nominal_mm, dn_nominal_inch)
VALUES
    (6,    0.125 ),
    (8,    0.250 ),
    (10,   0.380 ),
    (15,   0.500 ),
    (20,   0.750 ),
    (25,   1.000 ),
    (32,   1.250 ),
    (40,   1.500 ),
    (50,   2.000 ),
    (65,   2.500 ),
    (80,   3.000 ),
    (90,   3.500 ),
    (100,  4.000 ),
    (125,  5.000 ),
    (150,  6.000 ),
    (200,  8.000 ),
    (250,  10.000),
    (300,  12.000),
    (350,  14.000),
    (400,  16.000),
    (450,  18.000),
    (500,  20.000),
    (550,  22.000),
    (600,  24.000),
    (650,  26.000),
    (700,  28.000),
    (750,  30.000),
    (800,  32.000),
    (850,  34.000),
    (900,  36.000),
    (1050, 42.000);

-- Tipos de Acessório
INSERT INTO
    fittingtype (fty_name)
VALUES
    ('CAP'     ),
    ('COLLAR'  ),
    ('ELBOW'   ),
    ('FLANGE'  ),
    ('PIPE'    ),
    ('REDUCER' ),
    ('SPECIALS'),
    ('TEE'     );

-- Materiais de Adição
INSERT INTO
    filler (flr_name)
VALUES
    ('TW222072024'),
    ('F9919514'   );

-- Projetos
INSERT INTO
    project (prj_internal_id, prj_name, prj_client)
VALUES
    ('PRJ0001', 'PROJETO GENESIS', 'ATOMIC INDUSTRIES INC.');

-- Isometricos
CALL insert_isometric();

-- Spools
CALL insert_spool();

-- Folhas
CALL insert_sheet();

-- Revisões
CALL insert_revs();

CALL insert_parts_for_isos(10);

-- Troços
INSERT INTO
    pipelength (pipl_internal_id,
                pipl_length,
                pipl_thickness,
                pipl_heatnumber,
                pipl_mat_id,
                pipl_dn_id,
                pipl_prt_id,
                pipl_ctop_id)
VALUES
    -- Isométrico 1 (dn=6, thickness=5.00, mat_id=1)
    ('PIPL0001', 305.00,  5.00, NULL, 1, 6, 1,   NULL),
    ('PIPL0002', 1500.00, 5.00, NULL, 1, 6, 2,   NULL),
    ('PIPL0003', 172.00,  5.00, NULL, 1, 6, 3,   NULL),
    ('PIPL0004', 1999.00, 5.00, NULL, 1, 6, 4,   NULL),
    ('PIPL0005', 784.00,  5.00, NULL, 1, 6, 5,   NULL),
    ('PIPL0006', 1204.00, 5.00, NULL, 1, 6, 6,   NULL),
    ('PIPL0007', 856.00,  5.00, NULL, 1, 6, 7,   NULL),
    -- Isométrico 2 (dn=8, thickness=6.00, mat_id=2)
    ('PIPL0008', 450.00,  6.00, NULL, 2, 8, 13,  NULL),
    ('PIPL0009', 1333.00, 6.00, NULL, 2, 8, 14,  NULL),
    ('PIPL0010', 767.00,  6.00, NULL, 2, 8, 15,  NULL),
    ('PIPL0011', 1900.00, 6.00, NULL, 2, 8, 16,  NULL),
    ('PIPL0012', 289.00,  6.00, NULL, 2, 8, 17,  NULL),
    ('PIPL0013', 1575.00, 6.00, NULL, 2, 8, 18,  NULL),
    ('PIPL0014', 1066.00, 6.00, NULL, 2, 8, 19,  NULL),
    -- Isométrico 3 (dn=7, thickness=5.50, mat_id=3)
    ('PIPL0015', 900.00,  5.50, NULL, 3, 7, 25,  NULL),
    ('PIPL0016', 1250.00, 5.50, NULL, 3, 7, 26,  NULL),
    ('PIPL0017', 300.00,  5.50, NULL, 3, 7, 27,  NULL),
    ('PIPL0018', 1801.00, 5.50, NULL, 3, 7, 28,  NULL),
    ('PIPL0019', 412.00,  5.50, NULL, 3, 7, 29,  NULL),
    ('PIPL0020', 1678.00, 5.50, NULL, 3, 7, 30,  NULL),
    ('PIPL0021', 589.00,  5.50, NULL, 3, 7, 31,  NULL),
    -- Isométrico 4 (dn=9, thickness=6.50, mat_id=4)
    ('PIPL0022', 202.00,  6.50, NULL, 4, 9, 37,  NULL),
    ('PIPL0023', 789.00,  6.50, NULL, 4, 9, 38,  NULL),
    ('PIPL0024', 1598.00, 6.50, NULL, 4, 9, 39,  NULL),
    ('PIPL0025', 614.00,  6.50, NULL, 4, 9, 40,  NULL),
    ('PIPL0026', 1750.00, 6.50, NULL, 4, 9, 41,  NULL),
    ('PIPL0027', 322.00,  6.50, NULL, 4, 9, 42,  NULL),
    ('PIPL0028', 1444.00, 6.50, NULL, 4, 9, 43,  NULL),
    -- Isométrico 5 (dn=5, thickness=4.50, mat_id=1)
    ('PIPL0029', 100.00,  4.50, NULL, 1, 5, 49,  NULL),
    ('PIPL0030', 500.00,  4.50, NULL, 1, 5, 50,  NULL),
    ('PIPL0031', 1600.00, 4.50, NULL, 1, 5, 51,  NULL),
    ('PIPL0032', 750.00,  4.50, NULL, 1, 5, 52,  NULL),
    ('PIPL0033', 1900.00, 4.50, NULL, 1, 5, 53,  NULL),
    ('PIPL0034', 275.00,  4.50, NULL, 1, 5, 54,  NULL),
    ('PIPL0035', 1425.00, 4.50, NULL, 1, 5, 55,  NULL),
    -- Isométrico 6 (dn=6, thickness=5.00, mat_id=2)
    ('PIPL0036', 1100.00, 5.00, NULL, 2, 6, 61,  NULL),
    ('PIPL0037', 350.00,  5.00, NULL, 2, 6, 62,  NULL),
    ('PIPL0038', 198.00,  5.00, NULL, 2, 6, 63,  NULL),
    ('PIPL0039', 887.00,  5.00, NULL, 2, 6, 64,  NULL),
    ('PIPL0040', 1560.00, 5.00, NULL, 2, 6, 65,  NULL),
    ('PIPL0041', 467.00,  5.00, NULL, 2, 6, 66,  NULL),
    ('PIPL0042', 1309.00, 5.00, NULL, 2, 6, 67,  NULL),
    -- Isométrico 7 (dn=8, thickness=6.00, mat_id=3)
    ('PIPL0043', 2000.00, 6.00, NULL, 3, 8, 73,  NULL),
    ('PIPL0044', 378.00,  6.00, NULL, 3, 8, 74,  NULL),
    ('PIPL0045', 1672.00, 6.00, NULL, 3, 8, 75,  NULL),
    ('PIPL0046', 144.00,  6.00, NULL, 3, 8, 76,  NULL),
    ('PIPL0047', 1820.00, 6.00, NULL, 3, 8, 77,  NULL),
    ('PIPL0048', 523.00,  6.00, NULL, 3, 8, 78,  NULL),
    ('PIPL0049', 991.00,  6.00, NULL, 3, 8, 79,  NULL),
    -- Isométrico 8 (dn=7, thickness=5.50, mat_id=4)
    ('PIPL0050', 1234.00, 5.50, NULL, 4, 7, 85,  NULL),
    ('PIPL0051', 444.00,  5.50, NULL, 4, 7, 86,  NULL),
    ('PIPL0052', 1715.00, 5.50, NULL, 4, 7, 87,  NULL),
    ('PIPL0053', 612.00,  5.50, NULL, 4, 7, 88,  NULL),
    ('PIPL0054', 1588.00, 5.50, NULL, 4, 7, 89,  NULL),
    ('PIPL0055', 282.00,  5.50, NULL, 4, 7, 90,  NULL),
    ('PIPL0056', 900.00,  5.50, NULL, 4, 7, 91,  NULL),
    -- Isométrico 9 (dn=9, thickness=6.50, mat_id=1)
    ('PIPL0057', 1001.00, 6.50, NULL, 1, 9, 97,  NULL),
    ('PIPL0058', 1950.00, 6.50, NULL, 1, 9, 98,  NULL),
    ('PIPL0059', 560.00,  6.50, NULL, 1, 9, 99,  NULL),
    ('PIPL0060', 999.00,  6.50, NULL, 1, 9, 100, NULL),
    ('PIPL0061', 150.00,  6.50, NULL, 1, 9, 101, NULL),
    ('PIPL0062', 1345.00, 6.50, NULL, 1, 9, 102, NULL),
    ('PIPL0063', 1876.00, 6.50, NULL, 1, 9, 103, NULL),
    -- Isométrico 10 (dn=5, thickness=4.50, mat_id=2)
    ('PIPL0064', 175.00,  4.50, NULL, 2, 5, 109, NULL),
    ('PIPL0065', 1333.00, 4.50, NULL, 2, 5, 110, NULL),
    ('PIPL0066', 786.00,  4.50, NULL, 2, 5, 111, NULL),
    ('PIPL0067', 1411.00, 4.50, NULL, 2, 5, 112, NULL),
    ('PIPL0068', 1788.00, 4.50, NULL, 2, 5, 113, NULL),
    ('PIPL0069', 909.00,  4.50, NULL, 2, 5, 114, NULL),
    ('PIPL0070', 456.00,  4.50, NULL, 2, 5, 115, NULL);

-- Acessórios
INSERT INTO
    fitting (fit_internal_id,
             fit_description,
             fit_length,
             fit_thickness,
             fit_heatnumber,
             fit_fty_id,
             fit_mat_id,
             fit_prt_id)
VALUES
    -- Isométrico 1 (thickness=5.00)
    ('FIT0001', 'COUDE ROULE SOUDE 3D 45º ISO - EN10253-3/10253-4 - 304L',   26,   2, NULL, 3, 1, 8  ),
    ('FIT0002', 'COUDE ROULE SOUDE 3D 90º ISO - EN10253-3/10253-4 - 304L',   26,   2, NULL, 3, 1, 9  ),
    ('FIT0003', 'COUDE SANS SOUDURE LR 90º - ASTM A403 - 316L',              26,   2, NULL, 3, 2, 10 ),
    ('FIT0004', 'COUDE ROULE SOUDE 3D 45º ISO - EN10253-3/10253-4 - 316L',   26,   2, NULL, 3, 2, 11 ),
    ('FIT0005', 'COUDE ROULE SOUDE 3D 90º ISO - EN10253-3/10253-4 - 316L',   26,   2, NULL, 3, 2, 12 ),
    -- Isométrico 2 (thickness=6.00)
    ('FIT0006', 'COLLET EPAIS - TYPE 35 NFE29251 / TYPE 37 EN1092-1 - 304L', 26,   2, NULL, 2, 1, 20 ),
    ('FIT0007', 'COLLET EPAIS - TYPE 35 NFE29251 / TYPE 37 EN1092-1 - 316L', 26,   2, NULL, 2, 2, 21 ),
    ('FIT0008', 'BRIDE PLATE TOURNANTE - TYPE02 - EN1092-1 - 304L',          34,   2, NULL, 4, 1, 22 ),
    ('FIT0009', 'RED. CONC. SOUDEE - ISO EN10253-4 - 304L',                  34,   2, NULL, 6, 1, 23 ),
    ('FIT0010', 'RED. EXCEN. SOUDEE - ISO EN10253-4 - 304L',                 34,   2, NULL, 6, 1, 24 ),
    -- Isométrico 3 (thickness=5.50)
    ('FIT0011', 'RED. CONC. S/S - ASTM A403 - 316L',                         34,   2, NULL, 6, 2, 32 ),
    ('FIT0012', 'RED. CONC. SOUDEE - ISO EN10253-4 - 316L',                  34,   2, NULL, 6, 2, 33 ),
    ('FIT0013', 'TE EGAL SOUDE EXTRUDE - ISO EN10253-4 - 304L',              34,   2, NULL, 8, 1, 34 ),
    ('FIT0014', 'TE REDUIT SOUDE EXTRUDE - ISO EN10253-4 - 304L',            34,   2, NULL, 8, 1, 35 ),
    ('FIT0015', 'TE REDUIT SOUDE EXTRUDE - ISO EN10253-4 - 316L',            34,   2, NULL, 8, 2, 36 ),
    -- Isométrico 4 (thickness=6.50)
    ('FIT0016', 'TE EGAL SANS SOUDURE - ASTM A403 - 316L',                   45,   2, NULL, 8, 2, 44 ),
    ('FIT0017', 'TES REDUITS INOX SANS SOUDURE - ASTM A403 - 316L',          45,   2, NULL, 8, 2, 45 ),
    ('FIT0018', 'TE EGAL SOUDE EXTRUDE - ISO EN10253-4 - 316L',              45,   2, NULL, 8, 2, 46 ),
    ('FIT0019', 'FOND BOMBES - EN10253-4 - 304L',                            45,   2, NULL, 1, 1, 47 ),
    ('FIT0020', 'CAPS - ASTM A403 - 316L',                                   36,   2, NULL, 1, 2, 48 ),
    -- Isométrico 5 (thickness=4.50)
    ('FIT0021', 'EMBOUT MALE INOX - GAZ - 316L',                             36,   2, NULL, 7, 1, 56 ),
    ('FIT0022', 'BOSSAGE GAZ - 316L',                                        36,   2, NULL, 7, 1, 57 ),
    ('FIT0023', 'RACCORD UNION LISSE-FEMELLE GAZ JOINT PLAT TEFLON - 316L',  36,   2, NULL, 7, 1, 58 ),
    ('FIT0024', 'RACCORD UNION LISSE-MALE GAZ JOINT PLAT PTFE - 316L',       36,   2, NULL, 7, 1, 59 ),
    ('FIT0025', 'COUDE ROULE SOUDE 3D 45º ISO - EN10253-3/10253-4 - 304L',   36,   2, NULL, 3, 1, 60 ),
    -- Isométrico 6 (thickness=5.00)
    ('FIT0026', 'COUDE ROULE SOUDE 3D 90º ISO - EN10253-3/10253-4 - 304L',   84.2, 2, NULL, 3, 1, 68 ),
    ('FIT0027', 'COUDE SANS SOUDURE LR 90º - ASTM A403 - 316L',              84.2, 2, NULL, 3, 2, 69 ),
    ('FIT0028', 'COUDE ROULE SOUDE 3D 45º ISO - EN10253-3/10253-4 - 316L',   84.2, 2, NULL, 3, 2, 70 ),
    ('FIT0029', 'COUDE ROULE SOUDE 3D 90º ISO - EN10253-3/10253-4 - 316L',   84.2, 2, NULL, 3, 2, 71 ),
    ('FIT0030', 'COLLET EPAIS - TYPE 35 NFE29251 / TYPE 37 EN1092-1 - 304L', 84.2, 2, NULL, 2, 1, 72 ),
    -- Isométrico 7 (thickness=6.00)
    ('FIT0031', 'COLLET EPAIS - TYPE 35 NFE29251 / TYPE 37 EN1092-1 - 316L', 84.2, 2, NULL, 2, 2, 80 ),
    ('FIT0032', 'BRIDE PLATE TOURNANTE - TYPE02 - EN1092-1 - 304L',          84.2, 2, NULL, 4, 1, 81 ),
    ('FIT0033', 'RED. CONC. SOUDEE - ISO EN10253-4 - 304L',                  84.2, 2, NULL, 6, 1, 82 ),
    ('FIT0034', 'RED. EXCEN. SOUDEE - ISO EN10253-4 - 304L',                 84.2, 2, NULL, 6, 1, 83 ),
    ('FIT0035', 'RED. CONC. S/S - ASTM A403 - 316L',                         84.2, 2, NULL, 6, 2, 84 ),
    -- Isométrico 8 (thickness=5.50)
    ('FIT0036', 'RED. CONC. SOUDEE - ISO EN10253-4 - 316L',                  45,   2, NULL, 6, 2, 92 ),
    ('FIT0037', 'TE EGAL SOUDE EXTRUDE - ISO EN10253-4 - 304L',              45,   2, NULL, 8, 1, 93 ),
    ('FIT0038', 'TE REDUIT SOUDE EXTRUDE - ISO EN10253-4 - 304L',            45,   2, NULL, 8, 1, 94 ),
    ('FIT0039', 'TE REDUIT SOUDE EXTRUDE - ISO EN10253-4 - 316L',            45,   2, NULL, 8, 2, 95 ),
    ('FIT0040', 'TE EGAL SANS SOUDURE - ASTM A403 - 316L',                   45,   2, NULL, 8, 2, 96 ),
    -- Isométrico 9 (thickness=6.50)
    ('FIT0041', 'TES REDUITS INOX SANS SOUDURE - ASTM A403 - 316L',          45,   2, NULL, 8, 2, 104),
    ('FIT0042', 'TE EGAL SOUDE EXTRUDE - ISO EN10253-4 - 316L',              45,   2, NULL, 8, 2, 105),
    ('FIT0043', 'FOND BOMBES - EN10253-4 - 304L',                            45,   2, NULL, 1, 1, 106),
    ('FIT0044', 'CAPS - ASTM A403 - 316L',                                   45,   2, NULL, 1, 2, 107),
    ('FIT0045', 'COUDE ROULE SOUDE 3D 45º ISO - EN10253-3/10253-4 - 304L',   45,   2, NULL, 3, 1, 108),
    -- Isométrico 10 (thickness=4.50)
    ('FIT0046', 'COUDE ROULE SOUDE 3D 90º ISO - EN10253-3/10253-4 - 304L',   14,   2, NULL, 3, 1, 116),
    ('FIT0047', 'COUDE SANS SOUDURE LR 90º - ASTM A403 - 316L',              14,   2, NULL, 3, 2, 117),
    ('FIT0048', 'COUDE ROULE SOUDE 3D 45º ISO - EN10253-3/10253-4 - 316L',   14,   2, NULL, 3, 2, 118),
    ('FIT0049', 'COUDE ROULE SOUDE 3D 90º ISO - EN10253-3/10253-4 - 316L',   14,   2, NULL, 3, 2, 119),
    ('FIT0050', 'COLLET EPAIS - TYPE 35 NFE29251 / TYPE 37 EN1092-1 - 304L', 14,   2, NULL, 2, 1, 120);

-- Bocas dos Fittings
-- Single-port fittings
INSERT INTO
    port (port_number, port_fit_id, port_dn_id)
SELECT
    1,
    f.fit_id,
    5
FROM
    fitting f
WHERE
    f.fit_id NOT IN (9, 10, 11, 12, 33, 34, 35, 36);

-- Two-port fittings
INSERT INTO
    port (port_number, port_fit_id, port_dn_id)
VALUES
    (1, 33, 5),
    (2, 33, 5),
    (1, 34, 5),
    (2, 34, 5),
    (1, 35, 5),
    (2, 35, 5),
    (1, 36, 5),
    (2, 36, 5);

-- Junções
INSERT INTO
    joint (jnt_prt1_id, jnt_prt2_id, jnt_spo_id, jnt_pipf_id)
SELECT
    ((s.spo_id - 1) * 4 + seq.offset1),
    ((s.spo_id - 1) * 4 + seq.offset2),
    s.spo_id,
    NULL
FROM
    spool s
        CROSS JOIN ( SELECT 1 AS offset1, 2 AS offset2 UNION ALL SELECT 3, 4 ) AS seq;

-- Soldaduras
INSERT INTO
    weld (wld_wdr_id, wld_fm_id, wld_jnt_id)
SELECT
    NULL,
    NULL,
    jnt_id
FROM
    joint;
