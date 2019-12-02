import {Router} from 'express'
import StoryblokClient from 'storyblok-js-client'
import {apiStatus} from '../../../lib/util'

module.exports = ({config, db}) => {
  const multistore = config.extensions.storyblok 
    && config.extensions.storyblok.multistore 
    && config.extensions.storyblok.config.length;
  if (!multistore && (!config.storyblok || !config.storyblok.previewToken)) {
    throw new Error('🧱 : config.storyblok.previewToken not found')
  }

  const api = Router()

  function loadStories(params) {
    return storyblokClient.get('cdn/stories', Object.assign({
      per_page: 100,
      resolve_links: 'url'
    }, params))
  }

  if (multistore) {
    // map for multistore
    config.extensions.storyblok.config.map(stConfig => {
      if(!stConfig.previewToken) {
        throw new Error('🧱 : config.extensions.storyblok[] item does not have a previewToken!')
      }
      const storyblokClientConfig = {
        accessToken: stConfig.previewToken,
        cache: {
          type: 'memory'
        }
      }
      const index = stConfig.indexName
      const storyblokClient = new StoryblokClient(storyblokClientConfig)
      const storeRouter = Router()
      
      storeRouter.get('/stories', async (req, res) => {
        const path = req.params.story + req.params[0]
        let dataJson = await loadStories(req.query)
        apiStatus(res, {
          stories: dataJson.data.stories,
        })
      })
      api.use('/' + index, storeRouter)
    });

    return api;
  }

  const storyblokClientConfig = {
    accessToken: config.storyblok.previewToken,
    cache: {
      type: 'memory'
    }
  }

  const storyblokClient = new StoryblokClient(storyblokClientConfig)

  api.get('/stories', async (req, res) => {
    const path = req.params.story + req.params[0]
    let response = loadStories(req.query)
    let dataJson = await response
    apiStatus(res, {
      stories: dataJson.data.stories,
    })
  })

  return api
}
