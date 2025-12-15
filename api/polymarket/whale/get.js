export default async function(address) {
  try {
    const trades = await $fetch(`https://www.polywhaler.com/api/whale-profile/${address}?refresh=false`, {
      headers: { accept: 'application/json' },
    });

    return trades;

  } catch (err) {
    console.error("API Error:", err);
    return { error: err.message };
  }
};