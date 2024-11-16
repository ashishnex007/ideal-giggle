import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function getDropDownValues<T>(data: T[], selector: string) {
  const uniqueArray = [...new Set(data.map(item => {
    const value = (item as any)[selector];
    // Check if the value includes 'T', indicating it's a datetime string
    if (typeof value === 'string' && value.includes('T')) {
      return value.split('T')[0]; // Extract and return the date part
    }
    return value; // Return the original value if it's not a datetime string
  }))];
  const noEmptyValues = uniqueArray.filter(element => element !== "").sort();
  const optionsArray = noEmptyValues.map(listItem => {
    return {
      value: listItem,
      label: listItem,
    };
  });
  return optionsArray;
}