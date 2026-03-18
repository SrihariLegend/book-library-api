export type ApiMeta = Readonly<{ total: number; page: number; limit: number }>;

export type ApiResponse<T> =
  | {
      success: true;
      data: T;
      error: null;
      meta?: ApiMeta;
    }
  | {
      success: false;
      data: null;
      error: string;
    };
