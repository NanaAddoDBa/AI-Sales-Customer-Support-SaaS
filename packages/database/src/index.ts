export interface TransactionRunner<TSession> {
  run<T>(operation: (session: TSession) => Promise<T>): Promise<T>;
}
