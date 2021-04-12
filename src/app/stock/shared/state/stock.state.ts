import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { Stock } from '../models/stock.model';
import { ListenForStocks, StopListeningForStocks, UpdateStocks} from './stock.actions';
import { StockService } from '../services/stock.service';
import { Subscription } from 'rxjs';

export interface StockStateModel {
  stocks: Stock[];
}

@State<StockStateModel>({
  name: 'stock',
  defaults: {
    stocks: []
  }
})
@Injectable()
export class StockState {
  initSub: Subscription;

  constructor(private stockService: StockService) {
  }

  @Selector()
  static stocks(state: StockStateModel): Stock[] {
    return state.stocks;
  }

  @Action(ListenForStocks)
  getClients(ctx: StateContext<StockStateModel>): void {
    this.initSub = this.stockService.listenForAllStocks()
      .subscribe(stocks => {
        ctx.dispatch(new UpdateStocks(stocks));
      });
  }

  @Action(StopListeningForStocks)
  stopListeningForClients(ctx: StateContext<StockStateModel>): void {
    if (this.initSub) {
      this.initSub.unsubscribe();
    }
  }

  @Action(UpdateStocks)
  updateClients(ctx: StateContext<StockStateModel>, action: UpdateStocks): void {
        const state = ctx.getState();
        const newState: StockStateModel = {
          ...state,
          stocks: action.stocks
        };
        ctx.setState(newState);
  }
}
