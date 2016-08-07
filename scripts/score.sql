DELIMITER $$

CREATE FUNCTION ingredient_matches(anchor_recipe_id INT, compare_recipe_id INT) RETURNS INT
BEGIN
  SELECT m.matches INTO @score FROM (
    SELECT t2.recipe_id, SUM(CASE WHEN t1.name IS NOT NULL THEN 1 ELSE 0 END) AS matches
      FROM ingredient_relations AS t1
      RIGHT JOIN ingredient_relations AS t2
      ON t1.name = t2.name
      AND t1.recipe_id = anchor_recipe_id
      WHERE t2.recipe_id <> anchor_recipe_id
      GROUP BY t2.recipe_id
    ) AS m WHERE m.recipe_id = compare_recipe_id;
  RETURN @score;
END$$

CREATE FUNCTION maxMatchedIngredients(anchorId INT) RETURNS INT
BEGIN
  SELECT MAX(m.matches) INTO @maximum FROM (
    SELECT t2.recipe_id, SUM(CASE WHEN t1.name IS NOT NULL THEN 1 ELSE 0 END) AS matches
      FROM ingredient_relations AS t1
      RIGHT JOIN ingredient_relations AS t2
      ON t1.name = t2.name
      AND t1.recipe_id = anchorId
      WHERE t2.recipe_id <> anchorId
      GROUP BY t2.recipe_id
    ) AS m;
  RETURN @maximum;
END$$

CREATE FUNCTION scoreWithoutAnchor(recipeId INT) RETURNS FLOAT
BEGIN
  #Get max values in recipes table so we can normalize scoring
  SELECT max(recipes.stars) into @maxStars from recipes;
  SELECT max(recipes.reviews) into @maxReviews from recipes;
  SELECT max(recipes.readyTime) into @maxReadyTime from recipes;
  SELECT max(recipes.madeCount) into @maxMadeCount from recipes;

  #Get refinement preferences
  SELECT r.stars, r.madeCount, r.readyTime, r.reviews
  INTO @prefs.stars, @prefs.madeCount, @prefs.readyTime, @prefs.reviews
  FROM refinements AS r;

  #Get stats of recipe we are looking at
  SELECT c.stars, c.madeCount, c.readyTime, c.reviews
  INTO @cur.stars, @cur.madeCount, @cur.readyTime, @cur.reviews
  FROM recipes AS c
  WHERE c.id = recipeId;

  set @reviewsScore = (@cur.reviews / @maxReviews) * @prefs.reviews;
  set @starscore = (@cur.stars / @maxStars) * @prefs.stars;
  set @readyTimeScore = (@cur.readyTime / @maxReadyTime) * @prefs.readyTime;
  set @madeCountScore = (@cur.madeCount / @maxMadeCount) * @prefs.readyTime;
  SET @score = IFNULL(@starScore, 0) + IFNULL(@reviewsScore, 0) + IFNULL(@madeCountScore, 0) + IFNULL(@readyTimeScore, 0);
  RETURN @score;
END$$

CREATE FUNCTION scoreWithAnchor(anchorId INT, compareId INT) RETURNS FLOAT
BEGIN
  #Get efficiency preference
  SELECT r.efficiency
  INTO @prefs.efficiency
  FROM refinements as r;
  set @maxMatches = maxMatchedIngredients(anchorId);
  set @priorityScore = scoreWithoutAnchor(compareId);
  set @efficiencyScore = (ingredient_matches(anchorId, compareId) / @maxMatches) * @prefs.efficiency;
  SET @score = @priorityScore + IFNULL(@efficiencyScore, 0);
  RETURN @score;
END$$
