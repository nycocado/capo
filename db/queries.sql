CREATE OR REPLACE VIEW v_pipelength_isometric AS
SELECT
    pl.pipl_id          AS id,
    pl.pipl_internal_id AS internalid,
    pl.pipl_length      AS length,
    pl.pipl_thickness   AS thickness,
    pl.pipl_heatnumber  AS heatnumber,

    m.mat_id            AS 'material.id',
    m.mat_name          AS 'material.name',
    d.dn_id             AS 'diameter.id',
    d.dn_nominal_mm     AS 'diameter.nominalmm',
    d.dn_nominal_inch   AS 'diameter.nominalinch',
    p.prt_id            AS 'part.id',
    p.prt_number        AS 'part.number',
    i.iso_id            AS 'isometric.id',
    i.iso_internal_id   AS 'isometric.internalid',
    prj.prj_id          AS 'isometric.project.id',
    prj.prj_internal_id AS 'isometric.project.internalid',
    prj.prj_name        AS 'isometric.project.name',
    prj.prj_client      AS 'isometric.project.client',
    s.sht_id            AS 'isometric.sheet.id',
    s.sht_number        AS 'isometric.sheet.number'
FROM
    pipelength pl
        JOIN material m ON pl.pipl_mat_id = m.mat_id
        JOIN diameter d ON pl.pipl_dn_id = d.dn_id
        JOIN part p ON pl.pipl_prt_id = p.prt_id
        LEFT JOIN isometric i ON i.iso_id = 1
        LEFT JOIN project prj ON i.iso_prj_id = prj.prj_id
        LEFT JOIN sheet s ON s.sht_iso_id = i.iso_id
WHERE
      pl.pipl_heatnumber IS NULL AND pl.pipl_ctop_id IS NULL