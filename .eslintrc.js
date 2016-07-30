module.exports = {
	"extends": "eslint:recommended",
	"installedESLint": true,
	"env": {
		"node": true,
		"es6": true,
		"browser": true,
		"jquery": true,
		"mocha": true
	},
	"globals": {
		"angular": 1,
	},
	"rules": {
		"indent": [2, "tab"],
		"quotes": [2, "single"],
		"eqeqeq": [2, "smart"],
		"strict": [2, "global"],
		"no-console": 0
	}
};
