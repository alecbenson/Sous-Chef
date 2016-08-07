DROP FUNCTION score;

DELIMITER $$
CREATE FUNCTION score(stars FLOAT, reviews INT, madecount INT, readyTime INT) RETURNS FLOAT
BEGIN
DECLARE score FLOAT;
DECLARE starScore FLOAT;
DECLARE readyTimeScore FLOAT;
DECLARE madeCountScore FLOAT;
DECLARE reviewsScore FLOAT;

SELECT max(recipes.stars) into @maxStars from recipes;
SELECT max(recipes.reviews) into @maxReviews from recipes;
SELECT max(recipes.readyTime) into @maxReadyTime from recipes;
SELECT max(recipes.madeCount) into @maxMadeCount from recipes;

SELECT r.stars, r.madeCount, r.readyTime, r.reviews INTO @prefs_stars, @prefs_madeCount, @prefs_readyTime, @prefs_reviews FROM refinements r;

set reviewsScore = (reviews / @maxReviews) * @prefs_reviews;
set starscore = (stars / @maxStars) * @prefs_stars;
set readyTimeScore = (readyTime / @maxReadyTime) * @prefs_readyTime;
set madeCountScore = (madeCount / @maxMadeCount) * @prefs_readyTime;

SET score = IFNULL(starScore, 0) + IFNULL(reviewsScore, 0) + IFNULL(madeCountScore,0) + IFNULL(readyTimeScore,0);
RETURN score;
END$$


select a.title, score(a.stars, a.reviews, a.madeCount, a.readyTime) from recipes a order by score(a.stars, a.reviews, a.madeCount, a.readyTime) desc;
