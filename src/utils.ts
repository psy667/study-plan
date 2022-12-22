import { createEffect } from "solid-js"
import { createStore, SetStoreFunction, Store } from "solid-js/store";


export function mod(a: number, b: number) {
  return ((a % b) + b) % b;
};

export function createLocalStore<T extends object>(
  name: string,
  init: T
): [Store<T>, SetStoreFunction<T>] {
  const localState = localStorage.getItem(name);
  const [state, setState] = createStore<T>(
    localState ? JSON.parse(localState) : init
  );
  createEffect(() => localStorage.setItem(name, JSON.stringify(state)));
  return [state, setState];
}

export const cropString = (str: string, limit: number) => {
  if (str.length <= limit) return str;
  return str.slice(0, limit) + '...';
};

export const generateId = (): string => {
  return Math.random().toString(16).split('.')[1];
};


export const last = (arr) => {
  return arr[arr.length - 1];
};

export const urlRegex =
    /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;

export const deepCopy = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

export const findLast = (arr, predicate) => {
  return last(arr.filter(predicate))
}