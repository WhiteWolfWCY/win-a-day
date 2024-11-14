declare module 'xlsx-populate' {
  interface Workbook {
    sheet(index: number): Sheet;
    addSheet(name: string): Sheet;
    outputAsync(): Promise<Uint8Array>;
    fromBlankAsync(): Promise<Workbook>;
  }

  interface Sheet {
    name(name: string): Sheet;
    cell(ref: string): Cell;
    addChart(options: ChartOptions): void;
  }

  interface Cell {
    value(value: any): Cell;
  }

  interface ChartOptions {
    type: 'bar' | 'line' | 'pie';
    series: Array<{
      name: string;
      categories: string;
      values: string;
    }>;
    title: string;
    anchor: {
      from: { col: number; row: number };
      to: { col: number; row: number };
    };
  }

  function fromBlankAsync(): Promise<Workbook>;

  export default {
    fromBlankAsync
  };
} 