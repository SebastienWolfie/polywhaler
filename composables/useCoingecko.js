
export function useCoingecko() {
  const getPrice = (ids) => $fetch(`/api/coingecko/price/${ids}`);

  return {
    getPrice
  };
}