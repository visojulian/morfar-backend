module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/posts/counter/:id',
      handler: 'post.incrementCounter',
      config: {
        auth: false,
      },
    }
  ]
}