/** Essentially an enum of color strings */
export const HEX = {
  RED: 0xE23645,
  GREEN: 0x51CD66,
  YELLOW: 0xEDC25E,
  BLURPLE: 0x384099,
}

/** Returns a promise that waits for (ms) milliseconds before resolving */
export const sleep = async (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms))

/** Deletes a property off of an objects after a certain amount of time */
export const timedDestroy = async (val: object, key: string, ms: number) =>  [await sleep(ms), delete val[key]]

/** If the input is not an array, turns it into a singleton array */
export const arrify = <T>(item: T | T[]) => item instanceof Array ? item as T[]: [item]

/** NoOp as in No Operation */
export const noop = () => {}

export const captialize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

export type AddParameters<
  TFunction extends (...args: any) => any,
  TParameters extends [...args: any]
> = (
  ...args: [...Parameters<TFunction>, ...TParameters]
) => ReturnType<TFunction>