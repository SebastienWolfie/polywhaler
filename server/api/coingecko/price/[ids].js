export default defineEventHandler(async (event) => {
  try {
    const { ids } = event.context.params;

    const prices = await $fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`, {
      headers: { accept: 'application/json' },
    });

    return prices;

  } catch (err) {
    console.error("API Error:", err);
    return { error: err.message };
  }
});