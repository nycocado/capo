INSERT INTO
    user (user_name, user_bdate, user_gender)
VALUES
    ('João Silva', '1985-07-15', 'M'),
    ('Pedro Santos', '1980-03-22', 'M'),
    ('Carlos Oliveira', '1978-11-05', 'M'),
    ('Miguel Costa', '1987-09-10', 'M'),
    ('António Rodrigues', '1983-12-30', 'M'),
    ('Francisco Pereira', '1992-05-15', 'M'),
    ('Luís Fernandes', '1989-02-18', 'M'),
    ('Rui Martins', '1975-08-21', 'M'),
    ('Bruno Carvalho', '1981-06-25', 'M'),
    ('Ana Sousa', '1995-04-12', 'F');

INSERT INTO
    welder (wdr_certificate, wdr_user_id)
VALUES
    ('CWB-WD-001', 1),
    ('CWB-WD-002', 2),
    ('CWB-WD-003', 3),
    ('CWB-WD-004', 4);

INSERT INTO
    pipefitter (pipf_certificate, pipf_user_id)
VALUES
    ('CWB-PF-001', 5),
    ('CWB-PF-002', 6),
    ('CWB-PF-003', 7);

INSERT INTO
    cuttingop (ctop_certificate, ctop_user_id)
VALUES
    ('CWB-CO-001', 8),
    ('CWB-CO-002', 9),
    ('CWB-CO-003', 10);

INSERT INTO
    material (mat_name)
VALUES
    ('304L'),
    ('316L'),
    ('CS'),
    ('GAL');

INSERT INTO diameter (dn_nominal_mm, dn_nominal_inch) VALUES (6, 0.125);
INSERT INTO diameter (dn_nominal_mm, dn_nominal_inch) VALUES (8, 0.250);
INSERT INTO diameter (dn_nominal_mm, dn_nominal_inch) VALUES (10, 0.380);
INSERT INTO diameter (dn_nominal_mm, dn_nominal_inch) VALUES (15, 0.500);
INSERT INTO diameter (dn_nominal_mm, dn_nominal_inch) VALUES (20, 0.750);
INSERT INTO diameter (dn_nominal_mm, dn_nominal_inch) VALUES (25, 1.000);
INSERT INTO diameter (dn_nominal_mm, dn_nominal_inch) VALUES (32, 1.250);
INSERT INTO diameter (dn_nominal_mm, dn_nominal_inch) VALUES (40, 1.500);
INSERT INTO diameter (dn_nominal_mm, dn_nominal_inch) VALUES (50, 2.000);
INSERT INTO diameter (dn_nominal_mm, dn_nominal_inch) VALUES (65, 2.500);
INSERT INTO diameter (dn_nominal_mm, dn_nominal_inch) VALUES (80, 3.000);
INSERT INTO diameter (dn_nominal_mm, dn_nominal_inch) VALUES (90, 3.500);
INSERT INTO diameter (dn_nominal_mm, dn_nominal_inch) VALUES (100, 4.000);
INSERT INTO diameter (dn_nominal_mm, dn_nominal_inch) VALUES (125, 5.000);
INSERT INTO diameter (dn_nominal_mm, dn_nominal_inch) VALUES (150, 6.000);
INSERT INTO diameter (dn_nominal_mm, dn_nominal_inch) VALUES (200, 8.000);
INSERT INTO diameter (dn_nominal_mm, dn_nominal_inch) VALUES (250, 10.000);
INSERT INTO diameter (dn_nominal_mm, dn_nominal_inch) VALUES (300, 12.000);
INSERT INTO diameter (dn_nominal_mm, dn_nominal_inch) VALUES (350, 14.000);
INSERT INTO diameter (dn_nominal_mm, dn_nominal_inch) VALUES (400, 16.000);
INSERT INTO diameter (dn_nominal_mm, dn_nominal_inch) VALUES (450, 18.000);
INSERT INTO diameter (dn_nominal_mm, dn_nominal_inch) VALUES (500, 20.000);
INSERT INTO diameter (dn_nominal_mm, dn_nominal_inch) VALUES (550, 22.000);
INSERT INTO diameter (dn_nominal_mm, dn_nominal_inch) VALUES (600, 24.000);
INSERT INTO diameter (dn_nominal_mm, dn_nominal_inch) VALUES (650, 26.000);
INSERT INTO diameter (dn_nominal_mm, dn_nominal_inch) VALUES (700, 28.000);
INSERT INTO diameter (dn_nominal_mm, dn_nominal_inch) VALUES (750, 30.000);
INSERT INTO diameter (dn_nominal_mm, dn_nominal_inch) VALUES (800, 32.000);
INSERT INTO diameter (dn_nominal_mm, dn_nominal_inch) VALUES (850, 34.000);
INSERT INTO diameter (dn_nominal_mm, dn_nominal_inch) VALUES (900, 36.000);
INSERT INTO diameter (dn_nominal_mm, dn_nominal_inch) VALUES (1050, 42.000);