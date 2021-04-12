import { Stock } from '../models/stock.model';

export class ListenForStocks {
  static readonly type = '[stock] Listen for stocks';
}

export class StopListeningForStocks {
  static readonly type = '[stock] Stop listening for stocks';
}

export class UpdateStocks {
  constructor(public stocks: Stock[]) {}

  static readonly type = '[stock] Update stocks';

}


