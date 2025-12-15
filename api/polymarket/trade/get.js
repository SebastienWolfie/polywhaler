export default async function(slug){
  try {
    const market = await $fetch(`https://gamma-api.polymarket.com/events/slug/${slug}`, {
      headers: { accept: 'application/json' },
    });

    return market;
  } catch (err) {
    console.error(`Failed to fetch market for ${slug}`, err);
    return {
      error:`Failed to fetch market for ${slug}`, err
    };
  }
};
