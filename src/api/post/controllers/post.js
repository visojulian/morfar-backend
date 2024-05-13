'use strict';

const { Query } = require('pg');

/**
 * post controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController(
  'api::post.post',
  ({ strapi }) => ({
    async find(ctx) {
      try {
        await this.validateQuery(ctx);
        const sanitizedQueryParams = await this.sanitizeQuery(ctx);
        const sugeridas = sanitizedQueryParams.sugeridas ? sanitizedQueryParams.sugeridas : '';
        const destacadas = sanitizedQueryParams.destacadas ? sanitizedQueryParams.destacadas : '';
        const slug = sanitizedQueryParams.slug ? sanitizedQueryParams.slug : '';
        const query = sanitizedQueryParams.search ? sanitizedQueryParams.search : '';


        if (!(sugeridas.length === 0)) {
          const posts = await strapi.entityService.findMany('api::post.post', {
            populate: ['cover', 'avatar', 'categories'],
            sort: [{ publishedAt: 'asc' }],
            filters: {
              publishedAt: {
                $ne: null,
              },
              destacada: true,

            },
          });
          ctx.send({ data: posts });
          return;
        }
        if (!(destacadas.length === 0)) {
          const posts = await strapi.entityService.findMany('api::post.post', {
            populate: ['cover', 'avatar', 'categories'],
            sort: [{ publishedAt: 'desc' }],
            filters: {
              publishedAt: {
                $ne: null,
              },
              destacada: true,

            },
          });
          ctx.send({ data: posts });
          return;
        }
        if (!(slug.length === 0)) {
          const posts = await strapi.entityService.findMany('api::post.post', {
            populate: ['cover', 'avatar', 'categories'],
            filters: {
              publishedAt: {
                $ne: null,
              },
              slug: {
                $eq: slug,
              },

            },
          });
          ctx.send({ data: posts });
          return;
        }
        if (!(query.length === 0)) {
          const posts = await strapi.entityService.findMany('api::post.post', {
            populate: ['categories', 'avatar', 'cover'],
            filters: {
              publishedAt: {
                $ne: null,
              },
              $or: [
                {
                  title: {
                    $containsi: query,
                  },
                },
                {
                  description: {
                    $containsi: query,
                  },
                },
                {
                  plates: {
                    $containsi: query,
                  },
                },
                {
                  categories: {
                    Categoria: {
                      $containsi: query,
                    },
                  },
                },
              ],
            },
          });
          ctx.send({ data: posts });
          return;
        }
        const posts = await strapi.entityService.findMany('api::post.post', {
          populate: ['cover', 'avatar', 'categories'],
          filters: {
            publishedAt: {
              $ne: null,
            },
          }
        });
        ctx.send({ data: posts });
      } catch (error) {
        console.error(error);
        ctx.badRequest('An error occurred while processing your request.');
      }
    }
  })
);

