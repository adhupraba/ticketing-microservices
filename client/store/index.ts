import { CurrentUser } from "@src/types";

type Store = {
  currentUser: CurrentUser | null;
};

let store: Store = {
  currentUser: null,
};

type StoreKey = keyof Store;

type GlobalStore = {
  set: (key: StoreKey, value: typeof store[StoreKey]) => void;
  get: (key: StoreKey) => Store[StoreKey];
};

export const globalStore: GlobalStore = {
  set: (key, value) => {
    store = { ...store, [key]: value };
  },
  get: (key) => store[key],
};
