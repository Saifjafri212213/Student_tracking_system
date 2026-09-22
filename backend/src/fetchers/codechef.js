import axios from 'axios';
import * as cheerio from 'cheerio';
import { rateLimiter } from '../rateLimiter.js';

const CODECHEF_URL = 'https://www.codechef.com/users';

export async function fetchCodeChefStats(handle) {
  if (!handle) return { handle: '', total_solved: 0, rating: 0 };

  return rateLimiter.schedule('codechef', async () => {
    try {
      const response = await axios.get(`${CODECHEF_URL}/${handle}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
        },
        timeout: 20000
      });

      const html = response.data;
      const $ = cheerio.load(html);

      // Extract Rating
      const ratingText = $('.rating-number').text().trim();
      const ratingMatch = ratingText.match(/(\d+)/);
      const rating = ratingMatch ? parseInt(ratingMatch[1], 10) : 0;

      // Extract Stars
      const starText = $('.rating-star').text().trim();
      const stars = starText.split('★').length - 1 || (starText.includes('1★') ? 1 : 0);

      // Extract Global Rank & Country Rank
      const globalRankText = $('.rating-ranks ul li:first-child strong').text().trim();
      const globalRank = parseInt(globalRankText, 10) || 0;

      // Extract Total Solved Problems
      let totalSolved = 0;
      const problemsSection = $('section.problems-solved');
      if (problemsSection.length > 0) {
        const text = problemsSection.text();
        const matchTotal = text.match(/Total Problems Solved:\s*(\d+)/i);
        if (matchTotal) {
          totalSolved = parseInt(matchTotal[1], 10);
        } else {
          const matchFully = text.match(/Fully Solved\s*\((\d+)\)/i);
          if (matchFully) {
            totalSolved = parseInt(matchFully[1], 10);
          } else {
            totalSolved = problemsSection.find('a').length;
          }
        }
      } else {
        const fullMatch = html.match(/Total Problems Solved:\s*(\d+)/i);
        if (fullMatch) totalSolved = parseInt(fullMatch[1], 10);
      }

      // Extract Recent Contest from JavaScript variables
      let recentContest = null;
      $('script').each((_, script) => {
        const content = $(script).html() || '';
        if (content.includes('all_rating') || content.includes('rating_data')) {
          const matches = [...content.matchAll(/\{\s*"code":\s*"([^"]+)",.*?"rating":\s*"(\d+)",.*?"end_date":\s*"([^"]+)"/g)];
          if (matches.length > 0) {
            const latest = matches[matches.length - 1];
            const prevRating = matches.length >= 2 ? parseInt(matches[matches.length - 2][2], 10) : 1500;
            const currentRating = parseInt(latest[2], 10);
            const delta = currentRating - prevRating;

            recentContest = {
              contest_name: latest[1],
              timestamp: latest[3],
              old_rating: prevRating,
              new_rating: currentRating,
              rating_delta: delta
            };
          }
        }
      });

      return {
        handle,
        total_solved: totalSolved,
        rating,
        stars,
        global_rank: globalRank,
        recent_contest: recentContest,
        last_synced_at: Date.now(),
        status: 'success'
      };
    } catch (err) {
      if (err.response?.status === 404) {
        return { handle, total_solved: 0, rating: 0, error: 'User not found' };
      }
      console.error(`[CodeChef] Error scraping user ${handle}:`, err.message);
      return { handle, total_solved: 0, rating: 0, error: err.message };
    }
  });
}
