-- Query to list part numbers of fittings of type 'redutor'
SELECT fit_id
FROM fitting f
JOIN fittingtype ft ON f.fit_fty_id = ft.fty_id
JOIN part p ON f.fit_prt_id = p.prt_id
WHERE ft.fty_name = 'REDUCER';