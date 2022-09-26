export type Nullable<T> = T | null;

export type Undef<T> = T | undefined;

export type Maybe<T> = T | null | undefined;

export type ErrorField = {
  field?: string;
  message: string;
};

export type CurrentUser = {
  id: string;
  email: string;
  iat: number;
};

export interface ICurrentUserProps {
  currentUser: CurrentUser | null;
}

export interface ITicket {
  id: string;
  title: string;
  price: number;
  userId: string;
}

export interface IOrder {
  id: string;
  userId: string;
  status: string;
  expiresAt: string;
  ticket: Omit<ITicket, "userId">;
}
