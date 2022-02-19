/**
 * @name yt2mp3
 * @version v1.0.3
 * @author ipincamp <support@nur-arifin.my.id>
 * @license GNU (General Public License v3.0)
 */

const ytdl = require('ytdl-core');
const ytpl = require('ytpl');
const { Joi, validate } = require('express-validation');
const { last } = require('lodash');

module.exports = {
  name: '/api',
  async run(req, res, next) {
    validate({
      query: Joi.object({
        id: Joi.string().required(),
      }),
    });
    const { id } = req.query;

    try {
      await ytdl.getInfo(id).then(({ videoDetails, formats }) => {
        const {
          title,
          thumbnails,
          ownerChannelName,
          publishDate,
        } = videoDetails;

        const owner = ownerChannelName;
        const thumbnail = last(thumbnails).url;
        const videoFormats = formats;

        function invertDate(str) {
          return str.split('-').reverse().join('/');
        }

        const uploadDate = invertDate(publishDate);

        res.json({
          title,
          owner,
          uploadDate,
          thumbnail,
          videoFormats,
        });
      });
    } catch {
      await ytpl(id)
        .then((details) => {
          let {
            author,
            items,
            title,
            thumbnails,
          } = details;

          const owner = author.name;
          const thumbnail = last(thumbnails).url;
          const videoList = items;
          let videos = [];

          items.forEach((v) => {
            videos.push([v.index, v.title, v.shortUrl]);
          });

          res.json({
            title,
            owner,
            thumbnail,
            videos,
            videoList,
          });
        })
        .catch((err) => next(err));
    }
  },
};
