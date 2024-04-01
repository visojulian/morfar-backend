'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

function getRandomAds(pautas, cantidad) {
  // Make a copy of the input array to avoid modifying the original
  const ads = [...pautas];
  const pautasFiltered = [];
  let totalAdjustedProbability = 0;

  // Calculate the total adjusted probability for all ads
  ads.forEach(ad => {
    const factor = Math.max(1, ad.attributes.showCount);
    const adjustedProbability = ad.attributes.probability / factor;
    totalAdjustedProbability += adjustedProbability;
  });

  // Randomly select ads for the given number of slots
  for (let i = 0; i < cantidad; i++) {
    const randomValue = Math.random() * totalAdjustedProbability;
    let cumulativeProbability = 0;

    for (const ad of ads) {
      const factor = Math.max(1, ad.attributes.showCount);
      const adjustedProbability = ad.attributes.probability / factor;
      cumulativeProbability += adjustedProbability;

      if (randomValue < cumulativeProbability) {
        // Add the selected ad to the result
        pautasFiltered.push({ ...ad, adjustedProbability });

        // Adjust the total probability and show count for the selected ad
        totalAdjustedProbability -= adjustedProbability;
        ad.attributes.showCount++;

        // Remove the selected ad from the pool to prevent duplicates
        ads.splice(ads.indexOf(ad), 1);
        break;
      }
    }
  }

  return pautasFiltered;
}



// Construct the path to the schema definition file

module.exports = createCoreController(
  'api::pauta.pauta',
  ({ strapi }) => ({
    async find(ctx) {
      try {
        await this.validateQuery(ctx);
        const sanitizedQueryParams = await this.sanitizeQuery(ctx);

        // Call the default parent controller action
        const result = await super.find(ctx);
        const cantidad = Number(sanitizedQueryParams.cantidad);

        // your custom logic for modifying the output
        if (cantidad) {
          // Retrieve ads to be shown
          const pautas = result.data;

          // Get randomly selected ads
          const adsToShow = getRandomAds(pautas, cantidad);

          // Update showCount for each ad
          await Promise.all(
            adsToShow.map(async ad => {
              const n = Number(ad.attributes.showCount);
              await strapi.entityService.update('api::pauta.pauta', ad.id, {
                data: {
                  showCount: n
                }
              });
            }));
          ctx.send(adsToShow);
        } else {
          ctx.send(result.data);
        }
      } catch (error) {
        // Handle any errors
        console.error(error);
        ctx.badRequest('An error occurred while processing your request.');
      }
    }
  })
);
