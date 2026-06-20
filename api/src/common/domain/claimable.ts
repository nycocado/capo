/** Ordem com lock exclusivo (claim). Mínimo que uma policy de claim precisa ler. */
export interface Claimable {
  claimedBy?: { id: number };
}
