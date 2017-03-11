# Overpass Routes to GPX Convertor

Converts routes from Overpass JSON to GPX files, one per route.

## Running

Obtain Overpass JSON from eg. http://www.overpass-api.de/query_form.html by using a query that returns routes. Example:

```
[out:json][timeout:250];
(
  relation["operator"~"kst",i]["type"="route"]["route"="hiking"](47.6477590475,16.7596435547,49.6569607868,22.6483154297);
);
out body;
>;
out body;
```

Download generated json file to this directory and name it `hiking.json`. Afterwards run `npm i && node .` and the resulting GPX files can be found in the `out` directory.
