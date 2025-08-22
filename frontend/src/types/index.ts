// Types basés sur l'architecture backend Surebet

export interface Money {
  amount: number;
  currency: string;
}

export interface Bet {
  title: string;
  odds: number;
  exchangeType?: 'lay' | 'back';
}

export interface Arb {
  stake: string;
  winnings: string;
  profit: string;
  currency: string;
  bet: Bet;
  bookie: BookieInfo;
  viable: boolean;
}

export interface BookieInfo {
  id: string;
  name: string;
  status: InstanceStatus;
  balance?: number;
  currencyCode: string;
}

export interface ArberInstance {
  id: string;
  name: string;
  status: ArberStatus;
  investment: Money;
  bookies: string[];
  createdAt: Date;
  opportunities: ArbGroup[];
}

export enum ArberStatus {
  Created = 'Created',
  Running = 'Running',
  Paused = 'Paused',
  Postulating = 'Postulating',
  Placing = 'Placing',
  Placed = 'Placed',
  Closed = 'Closed',
}

export enum InstanceStatus {
  Created = 'Created',
  LoggingIn = 'LoggingIn',
  LoggedIn = 'LoggedIn',
  Running = 'Running',
  Paused = 'Paused',
  Postulating = 'Postulating',
  Placing = 'Placing',
  Placed = 'Placed',
  Maxing = 'Maxing',
  Error = 'Error',
  Closed = 'Closed',
}

export type ArbGroup = Arb[];

export interface WSMessage {
  event: string;
  data: any;
}

export interface ArbitrageProfitability {
  totalProfit: number;
  profitMargin: number;
  roi: number;
}

export interface Statistics {
  totalOpportunities: number;
  profitableOpportunities: number;
  totalPotentialProfit: number;
  averageProfit: number;
  successRate: number;
}
