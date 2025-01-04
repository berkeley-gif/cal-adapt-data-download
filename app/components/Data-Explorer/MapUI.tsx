'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'

import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import HtmlTooltip from '../Global/HtmlTooltip'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import { FormControl, Button } from '@mui/material'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import ListItemText from '@mui/material/ListItemText'
import MenuItem from '@mui/material/MenuItem'
import Fade from '@mui/material/Fade'

import { metricsList } from '@/app/lib/data-explorer/metrics'
import { globalWarmingLevelsList } from '@/app/lib/data-explorer/global-warming-levels'

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

type MapUIProps = {
    metricSelected: number;
    gwlSelected: number;
    setMetricSelected: (metric: number) => void,
    setGwlSelected: (gwl: number) => void,
}

const MenuProps: any = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
    getContentAnchorEl: null,
    anchorOrigin: {
        vertical: "bottom",
        horizontal: "center"
    },
    transformOrigin: {
        vertical: "top",
        horizontal: "center"
    },
    variant: "menu"
}


export default function Map({ metricSelected, gwlSelected, setMetricSelected, setGwlSelected }: MapUIProps) {

    return (
        <div className="map-ui">
            <Box sx={{ flexGrow: 1 }}>
                <Grid container spacing={2}>
                    <Grid item xs={4}>
                        <div className='map-ui__parameter-selection'>
                            <div className="container container--white">
                                <div className="option-group option-group--vertical">
                                    <div className="option-group__title">
                                        <Typography variant="body2">Global Warming Level</Typography>
                                        <HtmlTooltip
                                            textFragment={
                                                <React.Fragment>
                                                    <p>The global warming level you would like to see displayed</p>
                                                </React.Fragment>
                                            }
                                            iconFragment={<InfoOutlinedIcon />}
                                            TransitionComponent={Fade}
                                            TransitionProps={{ timeout: 600 }}
                                            placement="right-end"
                                        />
                                    </div>

                                    <FormControl >
                                        <Select
                                            value={gwlSelected}
                                            onChange={(event: any) => {
                                                setGwlSelected(event.target.value as number)
                                            }}
                                            MenuProps={MenuProps}
                                            sx={{ mt: '15px', width: '200px' }}

                                        >
                                            {globalWarmingLevelsList.map((gwl) => (
                                                <MenuItem key={gwl.id} value={gwl.id}>
                                                    <ListItemText primary={gwl.title} />
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </div>
                            </div>
                            <div className="container container--white">
                                <div className="option-group option-group--vertical">
                                    <div className="option-group__title">
                                        <Typography variant="body2">Metric</Typography>
                                        <HtmlTooltip
                                            textFragment={
                                                <React.Fragment>
                                                    <p>The metric you would like to see displayed</p>
                                                </React.Fragment>
                                            }
                                            iconFragment={<InfoOutlinedIcon />}
                                            TransitionComponent={Fade}
                                            TransitionProps={{ timeout: 600 }}
                                            placement="right-end"
                                        />
                                    </div>

                                    <FormControl>
                                        <Select
                                            value={metricSelected}
                                            onChange={(event: any) => {
                                                setMetricSelected(event.target.value as number)
                                            }}
                                            MenuProps={MenuProps}
                                            sx={{ mt: '15px', width: '220px' }}

                                        >
                                            {metricsList.map((metric) => (
                                                <MenuItem key={metric.id} value={metric.id}>
                                                    <ListItemText primary={metric.title} />
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </div>
                            </div>
                        </div>
                    </Grid>
                    <Grid item xs={8}>
                    </Grid>
                </Grid>
            </Box>
        </div>
    )
}

