/**
 * Papéis de utilizador. Os valores batem com os nomes em `role.name` na DB e
 * com a matriz de permissões dos estágios (cut/assembly/weld).
 */
export enum Role {
  CUTTING_OPERATOR = "cutting-operator",
  PIPE_FITTER = "pipe-fitter",
  WELDER = "welder",
  ADMINISTRATOR = "administrator",
}
