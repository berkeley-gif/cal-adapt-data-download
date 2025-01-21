export const metricsList = [
    {
        "id": 0, 
        "title": 'Extreme Heat Days',
        "variable": 'TX99p',
        "description": 'Mean annual change in extreme heat days',
        "path": 's3://cadcat/tmp/era/wrf/cae/mm4mean/ssp370/yr/TX99p/d02/TX99p.zarr',
        "rescale": '1.18,35.19',
        "colormap": 'oranges'
    },
    {
        "id": 1, 
        "title": 'Precipitation',
        "variable": 'R99p',
        "description": 'Absolute change in 99th percentile 1-day accumulated precipitation',
        "path": 's3://cadcat/tmp/era/wrf/cae/mm4mean/ssp370/yr/R99p/d02/R99p.zarr',
        "rescale": '-4.866,39.417',
        "colormap": 'blues'
    },
    {
        "id": 2, 
        "title": 'Wildfire',
        "variable": 'ffwige50',
        "description": 'Change in median annual number of days with (FFWI) value greater than 50',
        "path": 's3://cadcat/tmp/era/wrf/cae/mm4mean/ssp370/yr/ffwige50/d02/ffwige50.zarr',
        "rescale": '-197.96,92.158',
        "colormap": 'reds'
    }
]