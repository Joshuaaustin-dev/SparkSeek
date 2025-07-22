const express = require('express');
const router = express.Router();
const axios = require('axios');

router.get('/external-jobs', async (req, res) => {
  try {
    const { query, location, remoteOnly, employmentType, datePosted, page } = req.query;

    const options = {
      method: 'GET',
      url: 'https://jsearch.p.rapidapi.com/search',
      params: {
        query: query || 'developer',
        location: location || '',
        remote_jobs_only: remoteOnly === 'true' ? 'true' : undefined,
        employment_types: employmentType || undefined,
        date_posted: datePosted || undefined,
        page: page || '1',
        num_pages: '10',
      },
      headers: {
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY, 
        'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
      },
    };

    const response = await axios.request(options);
    res.json(response.data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch jobs from external API' });
  }
});

module.exports = router;
