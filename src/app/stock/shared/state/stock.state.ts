import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { Stock } from '../models/stock.model';
import {
  AddStock, ListenForErrors,
  ListenForStockPriceUpdated,
  ListenForStocks,
  SendUpdateStock,
  StopListeningForStocks, UpdateError,
  UpdateStock,
  UpdateStocks
} from './stock.actions';
import { StockService } from '../services/stock.service';
import {Subject, Subscription} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

export interface StockStateModel {
  stocks: Stock[];
  updatedStock: Stock;
  errorMessage: string;
}

@State<StockStateModel>({
  name: 'stock',
  defaults: {
    stocks: [],
    updatedStock: null,
    errorMessage: undefined
  }
})
@Injectable()
export class StockState {
  unsubscriber$ = new Subject();

  constructor(private stockService: StockService) {
  }

  @Selector()
  static stocks(state: StockStateModel): Stock[] {
    return state.stocks;
  }

  @Selector()
  static updatedStock(state: StockStateModel): Stock {
    return state.updatedStock;
  }

  @Selector()
  static error(state: StockStateModel): string {
    return state.errorMessage;
  }

  @Action(ListenForStocks)
  getStocks(ctx: StateContext<StockStateModel>): void {
     this.stockService.listenForAllStocks()
       .pipe(
         takeUntil(this.unsubscriber$)
       )
      .subscribe(stocks => {
        ctx.dispatch(new UpdateStocks(stocks));
      });
  }

  @Action(StopListeningForStocks)
  stopListeningForStocks(ctx: StateContext<StockStateModel>): void {
    this.unsubscriber$.next();
    this.unsubscriber$.complete();
  }

  @Action(UpdateStocks)
  updateStocks(ctx: StateContext<StockStateModel>, action: UpdateStocks): void {
        const state = ctx.getState();
        const newState: StockStateModel = {
          ...state,
          stocks: action.stocks
        };
        ctx.setState(newState);
  }

  @Action(UpdateStock)
  updateStock(ctx: StateContext<StockStateModel>, action: UpdateStock): void {
    const state = ctx.getState();
    const newState: StockStateModel = {
      ...state,
      updatedStock: action.stock
    };
    ctx.setState(newState);
  }

  @Action(UpdateError)
  updateError(ctx: StateContext<StockStateModel>, action: UpdateError): void {
    const state = ctx.getState();
    const newState: StockStateModel = {
      ...state,
      errorMessage: action.errorMessage
    };
    ctx.setState(newState);
  }

  @Action(ListenForStockPriceUpdated)
  listenForStockPriceUpdated(ctx: StateContext<StockStateModel>): void {
    this.stockService.listenForStockPriceUpdated()
      .pipe(
        takeUntil(this.unsubscriber$)
      )
      .subscribe(stock => {
        ctx.dispatch(new UpdateStock(stock));
      });
  }

  @Action(ListenForErrors)
  listenForErrors(ctx: StateContext<StockStateModel>): void {
    this.stockService.listenForErrors()
      .pipe(
        takeUntil(this.unsubscriber$)
      )
      .subscribe(error => {
        ctx.dispatch(new UpdateError(error));
      });
  }

  @Action(AddStock)
  addStock(ctx: StateContext<StockStateModel>, action: AddStock): void {
    this.stockService.sendAddStock(action.newStock);
  }

  @Action(SendUpdateStock)
  sendUpdateStock(ctx: StateContext<StockStateModel>, action: SendUpdateStock): void {
    this.stockService.sendUpdateStock(action.updatedStock);
  }
}
