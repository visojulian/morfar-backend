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
        const populares = sanitizedQueryParams.populares ? sanitizedQueryParams.populares : '';
        const slug = sanitizedQueryParams.slug ? sanitizedQueryParams.slug : '';
        const query = sanitizedQueryParams.search ? sanitizedQueryParams.search : '';


        if (!(populares.length === 0)) {
          const posts = await strapi.entityService.findMany('api::post.post', {
            populate: ['cover', 'avatar', 'categories'],
            sort: [{ counter: 'desc' }],
            filters: {
              publishedAt: {
                $ne: null,
              },
              counter: {
                $ne: null,
              },
            },
          });
          ctx.send({ data: posts });
          return;
        }
        if (!(sugeridas.length === 0)) {
          const cantidad = Number(sanitizedQueryParams.cantidad);
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
          if (Array.isArray(posts)) {
            var shuffled = posts.sort(function(){ return 0.5 - Math.random() });
            var nRandomPosts = shuffled.slice(0,cantidad);
            ctx.send({ data: nRandomPosts });
            return;
          }
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
    },
    async incrementCounter(ctx) {
      const { id } = ctx.params;
      try {
        // Fetch the post
        const post = await strapi.entityService.findOne('api::post.post', id);

        if (!post) {
          return ctx.notFound('Post not found');
        }

        // Increment the counter
        const updatedPost = await strapi.entityService.update('api::post.post', id, {
          data: {
            counter: post.counter ? Number(post.counter) + 1 : 1,
          }
        });

        ctx.send({ data: updatedPost });
      } catch (error) {
        console.error(error);
        ctx.badRequest('An error occurred while processing your request.');
      }
    }
  })
);

