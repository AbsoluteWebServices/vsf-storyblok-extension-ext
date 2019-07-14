import {Router} from 'express'
import StoryblokClient from 'storyblok-js-client'
import {apiStatus} from '../../../lib/util'

module.exports = ({config, db}) => {
  if (!config.storyblok || !config.storyblok.previewToken) {
    throw new Error('🧱 : config.storyblok.previewToken not found')
  }

  const storyblokClientConfig = {
    accessToken: config.storyblok.previewToken,
    cache: {
      type: 'memory'
    }
  }

  const storyblokClient = new StoryblokClient(storyblokClientConfig)
  const api = Router()

  api.get('/stories', async (req, res) => {
    const path = req.params.story + req.params[0]
    let response = loadStories(req.query)
    let dataJson = await response
    apiStatus(res, {
      stories: dataJson.data.stories,
    })
  })

  function loadStories(params) {
    return storyblokClient.get('cdn/stories', Object.assign({
      per_page: 100,
      resolve_links: 'url'
    }, params))
  }

  return api
}
