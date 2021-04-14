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

export class UpdateStock {
  constructor(public stock: Stock) {}

  static readonly type = '[stock] Update stock';

}

export class ListenForStockPriceUpdated {

  static readonly type = '[stock] Listen for stock price updated';

}

export class ListenForErrors {

  static readonly type = '[stock] Listen for errors';

}

export class UpdateError {
  constructor(public errorMessage: string) {}

  static readonly type = '[stock] Update errorMessage';

}

export class AddStock {
  constructor(public newStock: Stock) {}

  static readonly type = '[stock] Add a new stock';

}

export class SendUpdateStock {
  constructor(public updatedStock: Stock) {}

  static readonly type = '[stock] Update a stock';

}


